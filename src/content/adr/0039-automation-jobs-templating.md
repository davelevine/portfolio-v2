---
title: "Automation Jobs Templating and Intelligent Scheduling"
number: 39
date: "2025-09-17"
status: "Superseded"
summary: "Introduced job-type templates and automatic time-slot assignment for scheduled systemd jobs to cut repetitive configuration and prevent jobs from competing for resources."
supersededBy: 59
ail: 2
---

## Decision Drivers

- Eliminate verbose and error-prone scheduled job configuration
- Prevent timing conflicts between automated tasks across hosts
- Reduce configuration maintenance overhead (44% reduction achieved)
- Standardize job types and healthcheck integration patterns
- Enable intelligent slot assignment for optimal system resource usage

## Context

The existing `scheduled_jobs` configuration system required verbose, repetitive definitions for each systemd timer, leading to maintenance overhead and configuration drift. Each job required explicit timing, environment variables, healthcheck URLs, and service definitions to be manually specified and coordinated.

### Problem Statement

**Configuration Verbosity:**

- Each job required 8-12 lines of YAML configuration
- Repetitive patterns for job types (backup, monitoring, maintenance)
- Manual timing coordination to prevent resource conflicts
- Inconsistent healthcheck integration patterns

**Operational Challenges:**

- Timing conflicts when multiple jobs competed for I/O or CPU resources
- Difficult to add new jobs without analyzing existing schedules
- No automated gap enforcement between similar job types
- Manual healthcheck URL management and environment variable setup

**Maintenance Overhead:**

- The homelab server's host variables needed to shrink from 162 to 90 lines (a 44% reduction)
- Copy-paste errors in job definitions
- Difficult to refactor common patterns across multiple hosts

## Decision

Implement a **job templating system** with intelligent scheduling via a new `automation_jobs` configuration format and a custom Ansible filter plugin.

### Core Components

**1. Job Type Templates.** Built-in templates cover the common job patterns: `backup` (early-morning slots), `sync` (weekly coordination slots), `monitoring` (dawn slots) and `maintenance` (weekly/monthly distribution).

**2. Intelligent Timing Assignment:**

- Automatic slot assignment based on job type
- 15-minute gap enforcement between similar jobs
- Conflict detection and resolution
- Fallback to an explicit `calendar:` when specified

**3. Simplified Configuration.** A job shrinks to a name, a `type`, the script to run and an optional healthcheck URL; the calendar is auto-assigned to prevent conflicts.

**4. Filter Plugin Implementation:**

- A `process_automation_jobs` filter in the automation role
- Converts templated jobs to full systemd service definitions
- Handles timing slot assignment and environment variable injection
- Maintains backward compatibility with the legacy `scheduled_jobs`

### Template Definitions

- **Backup jobs:** early-morning slots (01:00-03:00) with 15-minute gaps
- **Sync jobs:** weekly slots (Monday 00:00) for large data operations
- **Monitoring jobs:** dawn slots (06:00-07:00) for system health checks
- **Maintenance jobs:** distributed weekly/monthly timing for housekeeping

## Consequences

**Pros:**

- **Significant configuration reduction:** 44% fewer lines in the homelab server's host variables (162 → 90 lines)
- **Conflict prevention:** automatic timing gap enforcement eliminates resource competition
- **Consistent patterns:** standardized job types reduce copy-paste errors and improve maintainability
- **Intelligent scheduling:** automatic slot assignment optimizes system resource usage
- **Enhanced reliability:** built-in healthcheck integration with automatic environment variable management
- **Faster development:** new jobs require minimal configuration (3-4 lines vs 8-12 lines)

**Cons:**

- **Learning curve:** operators must understand job type templates vs direct systemd configuration
- **Filter plugin complexity:** a custom Ansible filter adds code complexity requiring Python maintenance
- **Template constraints:** job types enforce timing patterns that may not suit all use cases
- **Migration effort:** existing hosts need conversion from `scheduled_jobs` to `automation_jobs`

**Mitigations:**

- **Backward compatibility:** the legacy `scheduled_jobs` format remains fully supported during transition
- **Override capability:** an explicit `calendar:` bypasses template timing when needed
- **Comprehensive testing:** the filter plugin includes unit tests and job conflict validation
- **Documentation:** clear examples and migration guides in the role README and operational docs
- **Gradual migration:** hosts can migrate incrementally without service disruption

## Related

- ADR 0015: Scheduled jobs via systemd timers (the foundation timer system)
- ADR 0023: Role consolidation that enabled this templating system
- ADR 0031: VPS cron-to-systemd migration that highlighted the configuration verbosity
- ADR 0059: Removes this templating abstraction (supersedes this ADR)
