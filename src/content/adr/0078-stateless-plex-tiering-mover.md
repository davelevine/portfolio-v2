---
title: "Stateless Plex Tiering Mover"
number: 78
date: "2026-05-14"
status: "Accepted"
category: "Storage & Backups"
summary: "Refactored the Plex tiering mover to derive tier state at runtime from the filesystem and the Plex API, because the state.json cache it replaced bought nothing and caused three fragilities."
supersedes: [77]
ail: 2
---

## Decision Drivers

- Three high-impact fragilities in the as-built mover from ADR 0077 all traced back to a single root cause: a 5.9 MB `state.json` cache holding state that's already authoritative in two other systems (the filesystem and the Plex API)
- A mover/content-sync race window where the on-disk tier and `state.json` disagreed, with `rsync --delete` as the load-bearing failure mode
- `state.json` writes weren't durable against power loss (no `fsync` before `os.replace`); the next run aborted on a JSON parse error if interrupted mid-write
- Plex database rebuilds re-keyed `ratingKey`s and orphaned tier state, silently losing pins, grace-period clocks, and cold-play flags
- Per-account play-history blindness on a multi-user server, a secondary issue surfaced during shadow-mode validation

## Context

ADR 0077 chose mergerfs, an NFS cold tier, and a custom Python mover with `state.json` as its runtime artifact. The infrastructure decisions (the mergerfs union, the NFS cold tier, copy-verify-delete with xxh64, atomic companion-group moves, the nightly timer, circuit-breaker pre-flights) held up well in production. The orchestration layer did not.

A post-deployment fragility audit surfaced three issues, each with file-and-line evidence:

1. **Mover/sync race.** The mover deleted the NVMe source before writing `state.json`. For a sub-second window the file lived only on the NAS while `state.json` still said "hot." The nightly content sync built its cold-tier exclude list from `state.json`, so a concurrent run could destroy the freshly demoted file via `rsync --delete-after`.
2. **Non-durable state writes.** The state writer used `os.replace()` for the rename but never called `fsync()` on the temp file. Power loss between the write and the rename left a truncated temp file and an unrecoverable state on the next run.
3. **DB-rebuild orphaning.** Re-keyed Plex items were dropped from `state.json`, which silently reset grace periods, lost pins, and lost promotion flags.

Walking through what `state.json` actually held, every field fell into one of two buckets: derivable from somewhere authoritative (the filesystem or the Plex API), or needing persistence for exactly one fact (the tier-since timestamp used by the cold-play detector). The cache bought nothing and cost three fragilities.

A fourth issue surfaced during the first shadow-mode validation run. The legacy code read `viewCount` and `lastViewedAt` from a library endpoint that, on a multi-user Plex server, returns **per-account** values. The admin token saw zero plays for content that other accounts were actively watching, while Tautulli showed heavy play on the same items. The legacy mover would have demoted that content on its next live run. The fix (server-wide play history from the history endpoint) landed before the stateless refactor was allowed to proceed.

### Problem Statement

The tiering system worked correctly under normal conditions but carried fragility out of proportion to the problem it solved, concentrated in `state.json` and the orchestration that maintained it. Patching the symptoms (locks, `fsync`, schema versioning, orphan recovery) was feasible but compounded the complexity. The cleaner answer was to eliminate the cache and derive tier state at runtime from sources that already held the authoritative answer.

## Decision

Refactor the mover to be **stateless** with respect to `state.json`. Persisted state collapses to two things:

- **A single xattr, `user.plex_tiering.tier_since`** (an ISO 8601 timestamp), on the primary media file, written atomically at the moment of every successful move. It replaces the old last-moved timestamp and feeds the cold-play detector. It falls back to `ctime` when the filesystem doesn't support `user.*` xattrs; the production NFS mount falls in this category, and the fallback is correct, just less precise.
- **A small `pins.json`** (tens of entries in a 13k-item library) keyed by file path, not by Plex `ratingKey`. Path-keyed pins survive Plex DB rebuilds and Sonarr/Radarr file replacements at the same logical path. Writes are atomic, with `fcntl.flock` advisory locking and `fsync` before rename.

Everything else becomes derived at runtime:

| Old `state.json` field | New source |
| --- | --- |
| `current_tier` | Filesystem detection (already filesystem-derived in the original code) |
| `title`, `media_type`, `file_path`, `added_at`, `series_rating_key` | Plex API enumeration each run |
| `view_count`, `last_viewed_at` | Plex server-wide play history (all accounts) |
| `grace_period_expires_at` | `addedAt + grace_days_for(media_type)`, recomputed each run |
| `last_moved_at` | The `tier_since` xattr (`ctime` fallback) |
| `flagged_for_promotion` | Transient: `(tier == cold) AND (lastViewedAt > tier_since)`, recomputed each run |
| `pinned` | `pins.json` lookup by file path |

The scoring algorithm collapses from `view_count × recency_weight` (with 30/60/90/180-day bands) to **pure LRU with optional series cohesion**: an item is eligible for demotion if its most recent play (or its most recently played sibling, for TV) is older than `inactivity_days` (default 180, unchanged from the prior effective behavior). For the common `view_count == 1` case, which is essentially the entire library, the new policy makes identical decisions to the old one; they differ only at the exact-day boundary and for the rare `view_count == 0` case, where both correctly resolve to "demote."

The infrastructure decisions from ADR 0077 are unchanged: the mergerfs union, the NFS cold tier, copy-verify-delete with xxh64, companion-group atomicity, the timer schedule, batch budgets, circuit-breaker pre-flights, secret injection, Plex auto-trash safety, health checks, and Healthchecks.io wiring. The `tier-ctl` operator CLI keeps the same surface, with its data source switched from `state.json` to live filesystem and Plex queries.

The content-sync sidecar now gets its cold-tier exclude list from `tier-ctl emit-cold-excludes`, which walks the cold-tier directories and emits the files actually present there. That's simpler and more correct than reading a cache: the cold tier is literally the set of files that exist on cold.

### Alternative Approaches Considered

- **Patch the cache.** Add a lockfile for the race, `fsync` before the rename, a pre-flight confirming auto-trash is disabled, an orphan-recovery path for re-keying, and a versioned schema. Rejected because the cache itself was the source of complexity; patching it added moving parts without simplifying anything.
- **dm-cache or bcache for kernel-level tiering.** Elegant in principle: let the kernel handle hot/cold block placement, with no userspace mover and no state. Rejected because it requires re-pooling the NVMe and NAS storage at the block layer, which means destroying and restoring the entire 12 TB library. The migration cost far exceeded the value. Worth re-examining at a future hardware refresh.
- **Plex multi-folder libraries instead of mergerfs.** Pointing one library at both hot and cold roots would eliminate the mergerfs single point of failure and the auto-trash hardening requirement. Out of scope: mergerfs is working, and this was an orchestration change, not an infrastructure change. Worth reconsidering separately.

## Consequences

### Pros

- **The three audit findings collapse by construction, not by patch.** No `state.json` to race against the sync, no `state.json` to fail to `fsync`, no `ratingKey`-indexed cache to orphan when Plex re-keys items. Each problem disappeared because the thing that caused it no longer exists.
- **A smaller, simpler codebase.** Roughly 800 lines and ~140 tests after the refactor, down from ~3,400 lines and ~120 tests. Five modules were removed outright, and the cognitive surface for future maintenance shrank meaningfully.
- **No schema versioning concerns.** xattr presence or absence is self-describing, and `pins.json` is small enough to version trivially if ever needed.
- **DB-rebuild resilience.** Pins keyed by path survive re-keying, grace-period clocks live with the files, and watch history was already in Plex's database. Nothing is left in the tiering layer for a DB rebuild to break.
- **Multi-user play history correctly aggregated.** Surfaced as a byproduct of the shadow-mode gate: plays from every account on the server now correctly influence tier decisions.

### Cons

- **The migration was operationally non-trivial.** A 13k-item library of real media required shadow-mode validation, a one-time backfill to seed `tier_since` from the old timestamps, and an export to seed `pins.json` from existing pins. The work landed in six changes over two days, plus one side-quest fix.
- **xattr loss on manual file operations.** A `cp` without `--xattrs` or a manual `mv` between tiers strips the `tier_since` xattr. The decision engine still works (the xattr is consulted only for cold items and rewritten on every successful move), but the cold-play detector skips items with no xattr until they move again. Documented in the runbook.
- **No xattr passthrough over the NAS's NFS export.** Every cold-tier `tier_since` write fails. The `ctime` fallback covers the case correctly (verified by exhaustive case analysis), but the log noise was a real problem, fixed by downgrading "not supported" errors to debug level.

### Mitigations

- **Shadow mode was the hard gate.** The new decision logic first ran read-only alongside the legacy mover and emitted per-item decision diffs. Cutover required zero unclassifiable divergences. The gate caught the per-account play-history bug before the stateless code was allowed to act.
- **The old code stayed installed behind a `--legacy` flag** until the final change removed both flag and code together. Rollback during the deprecation window was a single flag.
- **The existing pre-flight safeties survive unchanged.** Empty-directory detection, the NFS writability check, the non-empty-library assertion, and the mergerfs health check all guard against the dread scenario: "NVMe unmounted, mover silently flips every item to cold." They remain, documented as a dedicated drive-missing protection section in the runbook.

## Related

- ADR 0077: the original tiering decision. Its infrastructure choices stand; this ADR replaces its orchestration layer only.
- ADR 0015: the systemd-timer job pattern used by the mover and sync timers.
