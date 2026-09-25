---
title: "Cached Secrets Lookup Plugin for Ansible"
number: 75
date: "2026-05-04"
status: "Accepted"
summary: "Replaced the upstream Bitwarden Secrets Manager lookup with a small local Ansible plugin that reuses one client, caches each secret once per run, and retries transient errors, cutting per-run failure probability from about 99% to effectively zero."
ail: 2
---

## Decision Drivers

- Eliminate the call-volume amplifier that turned an upstream ~4.5% 503 rate into a ~99% chance of any given playbook run failing
- Move retry to a single boundary instead of scattering it across templates, variables, tasks, and shell wrappers
- Reduce per-deploy latency by removing redundant authentication round trips
- Stop deploy success depending on transient CDN-edge conditions

## Context

The repository uses Bitwarden Secrets Manager (BWS) as the source of truth for runtime secrets consumed by Ansible. Ansible accessed it through the upstream `bitwarden.secrets.lookup` collection, called inline in templates, in host variables, and in task-level `set_fact` blocks.

Reading the upstream plugin's source turned up three structural issues, and each made the others worse given how Bitwarden's network behaved:

1. **No client reuse.** Every `lookup()` call builds a fresh client, authenticates, and then fetches the secret: two network round trips per reference.
2. **No cache.** A secret referenced N times across templates and plays is fetched N times.
3. **No retry.** A single 503 raises `AnsibleLookupError` and aborts the play.

A 200-call loop test from the control node, one call every 1.3 seconds against a single secret, returned 191 passes and 9 failures: a steady **4.5% upstream 503 rate**. Every error was the same CDN-edge `503 upstream connect error`, which points to Bitwarden's origin dropping a small fraction of connections behind its CDN. The failures weren't bursty, weren't tied to particular secrets, and weren't local.

A typical full-site run referenced about 30 unique secrets but made about 120 API calls, because every reference did a login plus a fetch and templates were re-evaluated across plays. The compounded failure probability was:

```
P(any fail) = 1 − 0.955^120 ≈ 99.6%
```

That matched reality: deploys failed on almost every run.

### Problem Statement

The Ansible-side access pattern made one to two orders of magnitude more API calls than necessary, with no retry at the most common call sites, against an upstream with a steady ~4.5% per-call failure rate. Adding retries at individual call sites treated the symptom but left the call-volume amplifier in place, and it couldn't be applied to inline `lookup()` calls in templates at all.

## Decision

Ship a local Ansible lookup plugin, `bws`, as a drop-in replacement for `bitwarden.secrets.lookup`, registered through the repository's Ansible configuration. How it behaves:

- **One client per `ansible-playbook` process.** One login per run, not one per lookup.
- **A cache keyed by secret ID and field.** Each unique secret is fetched at most once per process. Repeat references are dictionary reads with no network call.
- **On-demand fetching only.** A secret is fetched the first time it's referenced. There's no bulk sync, so the plugin never holds more secrets than the upstream plugin did.
- **Retry with exponential backoff inside the plugin.** Five attempts at 1, 2, 4, 8, and 16 seconds for 5xx and connection-level errors. Errors that retrying can't fix (not found, authentication failures, malformed input) fail immediately, with the SDK's own message intact.
- **Same call signature as upstream.** Migrating is a text swap.

Once the plugin landed, the cleanup followed in sequence. Every remaining upstream call site was migrated. The now-redundant task-level `register`/`retries`/`until` shims came out, along with the dead diagnostic tasks that depended on them. The shell-side gaps were closed so that non-Ansible callers go through the existing shell retry wrapper. One assertion that fetched secrets are non-empty stays: it guards against a separate Jinja `set_fact` behavior that swallows errors, which retry doesn't cover. Bootstrap tasks call the CLI directly on purpose, because they run before the wrapper is deployed.

### Alternatives Considered

- **Bulk sync of all accessible secrets.** Rejected. A sync pulls every secret the token can read into process memory, including ones the run never uses. That exposes more for no operational benefit, while on-demand fetching holds exactly what the run needs.
- **Pre-declared batch fetch.** Considered. Declare every secret a playbook needs, batch-fetch them at play start, and serve the rest from cache. The call-count win is the same, but the manifest has to be maintained separately from the templates that use it, and the run breaks whenever a template adds a lookup without updating the manifest. Rejected as too rigid.
- **Retries everywhere through `register`/`retries`/`until`.** Tried in earlier work. It treats the symptom, not the cause. It can't be applied to inline `lookup()` calls in templates or variables, because there is no task to attach retries to. And it leaves 60 to 120 sequential round trips per run as a latency tax.
- **Shadow the upstream plugin name.** Rejected. A distinct name keeps `git grep` accurate, lets the upstream plugin coexist if it's ever needed again, and makes it obvious in code review that the plugin is local.

## Consequences

### Pros

- **Reliability: ~99% down to ~0.0006% per-run failure probability.** With about 30 unique secrets per run, a 4.5% per-call failure rate, and five attempts each, P(unrecoverable) ≈ 30 × 0.045⁵ ≈ 0.0006%. Effectively zero short of a sustained outage.
- **API calls: ~120 down to ~30 per run.** The per-lookup login is gone, and repeat references collapse into a single fetch.
- **Single retry boundary.** Retry logic lives in one file instead of being spread across task shims, shell wrappers, and an upstream plugin that had none. New code that uses secrets needs no retry boilerplate.
- **Clearer failures.** When a fetch does fail, the plugin reports the underlying transport error verbatim. The upstream plugin's generic "secret could not be found" message used to hide it.
- **No longer hostage to upstream conditions.** Combined with making `apt update` non-fatal, deploys no longer need the secrets API, the CDN edge, upstream DNS, and package mirrors all healthy at the same moment.
- **Net code reduction.** The plugin's ~250 lines are offset by ~150 lines of removed retry shims, dead diagnostic tasks, and an inline shell retry function.

### Cons

- **A local plugin to maintain.** If the Python SDK changes its API, the plugin needs updating. One rename has already happened, and the plugin handles both names.
- **Values live for the whole run.** Cached values stay in process memory for the full run. That's no change from before, because Ansible already keeps rendered values for the playbook's lifetime.
- **No automatic invalidation.** A secret rotated mid-run is served from cache. Acceptable, because rotation happens out-of-band and shouldn't race with deploys.

### Mitigations

- The non-empty-secret assertion stays in place, so a malformed response or unexpected SDK change can't let a deploy go ahead with a partial secret set.
- The shell-side retry wrapper independently covers cron jobs, CI scripts, and other non-Ansible callers. Neither retry layer depends on the other.
