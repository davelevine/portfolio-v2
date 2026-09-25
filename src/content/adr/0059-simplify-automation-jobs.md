---
title: "Simplify Automation Jobs by Removing the Templating Abstraction"
number: 59
date: "2025-10-23"
status: "Accepted"
category: "Automation"
summary: "Removed the job templating and smart-scheduling layer from ADR 0039 in favour of explicit per-job configuration, because every production job overrode the templates anyway."
supersedes: [39]
ail: 2
---

## Decision Drivers

- Reduce cognitive load by eliminating unused abstraction layers
- Improve code maintainability by removing a complex Python filter plugin
- Simplify onboarding for future maintainers with explicit configuration
- Address the reality that the "smart scheduling" features were never actually used

## Context

ADR 0039 introduced a job templating system with intelligent scheduling to reduce configuration verbosity and prevent timing conflicts. The system included:

- Job type templates (`backup`, `sync`, `monitoring`, `maintenance`)
- Smart timing slot assignment via a Python filter plugin
- Automatic conflict detection and resolution
- A three-layer lookup (`job_types.yml` → `timing_slots.yml` → filter plugin)

### Problem Statement

**The templating abstraction added complexity without delivering value:**

1. **Unused "smart scheduling":** every job in production specifies an explicit `calendar:` value, bypassing the auto-assignment logic entirely.
2. **High cognitive load:** understanding a single job's schedule requires tracing through four files: the job definition, the type template, the timing slots, and the Python filter logic.
3. **Maintenance overhead:** the Python filter plugin requires ongoing maintenance for limited benefit.
4. **Onboarding friction:** new operators must learn the templating system instead of reading straightforward YAML.

**Reality check from production configuration:** a typical backup job declared `type: backup` (whose template said "daily") and then set its own `calendar:` of 01:00 every day, overriding the template anyway.

The `type` field only served to provide defaults that were immediately overridden, making it pure ceremony.

## Decision

**Remove the templating abstraction and return to explicit, direct job configuration.**

### New Simplified Schema

Each job now states everything directly:

- `name` (required): unique identifier
- `description` (optional): defaults to the name
- `user` (required): the user to run as
- `command` (required): the complete command to execute
- `oncalendar` (required): a systemd calendar expression
- `healthcheck_url` (optional): a dead-man's-switch ping URL
- `random_delay` (optional): defaults to 30s
- `secrets` (optional): secrets to inject into the job's environment

### Changes Made

**Removed:**

- `job_types.yml` (job type templates)
- `timing_slots.yml` (slot definitions)
- `job_templating.py` (Python filter)
- The `type` field from job definitions
- The `script` + `args` pattern (consolidated into `command`)
- The `calendar` field (renamed to `oncalendar` for clarity)

**Simplified:**

- The timer tasks now use simple Jinja2 templating instead of the Python filter
- Job processing happens inline with basic defaults (description, random delay)
- Healthcheck URL injection via a straightforward environment variable

**Preserved:**

- All existing job schedules (migrated to explicit `oncalendar` values)
- Healthcheck integration
- Secrets injection
- systemd service/timer generation
- User specification and environment handling

### Migration Example

Under ADR 0039, a backup job carried a `type` (looked up in `job_types.yml`), a `script` path, an overriding `calendar`, and a healthcheck URL. After the change, the same job carries a `description`, an explicit `user`, the full `command`, an `oncalendar` value and the healthcheck URL. Key differences:

- No `type` lookup needed
- `user` is explicit (no hidden defaults)
- `command` is the full command (no script + args merging)
- `oncalendar` clearly indicates a systemd timer specification
- One file to understand the complete job definition

## Consequences

**Pros:**

- **35% reduction in conceptual complexity:** from four layers (job definition → type template → timing slots → Python filter) to one (direct YAML)
- **Single source of truth:** all job configuration in one place, no cross-file lookups
- **Easier onboarding:** operators can understand jobs by reading straightforward YAML
- **Reduced maintenance:** eliminated a Python filter plugin that required testing and updates
- **Explicit over implicit:** all schedules visible at a glance, no hidden logic
- **Same output:** generated systemd services are functionally identical

**Cons:**

- **Slightly more verbose:** each job requires an explicit `user` and full `command`
- **No automatic conflict avoidance:** operators must manually coordinate timing (but they already were)
- **One-time migration effort:** all three hosts' variable files required updates

**Mitigations:**

- **Documentation updated:** the README includes clear examples and field descriptions
- **Validation preserved:** Ansible still validates systemd calendar expressions
- **Testing approach:** deploy incrementally (control node → VPS → homelab server) with validation

### Line Count Impact

While ADR 0039 claimed a 44% reduction (162 → 90 lines), the new explicit format trades minimal verbosity for dramatic clarity:

- **Control node:** 23 lines (was 23 with templating)
- **VPS:** 49 lines (was 53 with templating)
- **Homelab server:** 93 lines (was 89 with templating)

The slight increase in line count is offset by eliminating:

- 40 lines in `job_types.yml`
- 89 lines in `timing_slots.yml`
- 187 lines in `job_templating.py`
- **Net reduction: ~316 lines of infrastructure code removed**

## Related

- ADR 0039: Original templating system decision (superseded by this ADR)
- ADR 0015: Foundation systemd timer system (unchanged)
- ADR 0040: Role consolidation that enabled this refactoring
