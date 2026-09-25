---
title: "Plex Tiered Storage with mergerfs"
number: 77
date: "2026-05-11"
status: "Partially superseded"
category: "Storage & Backups"
summary: "Tiered the Plex library across NVMe (hot) and the NAS (cold) behind a mergerfs union, because buying more NVMe was too expensive and moving everything to the NAS would give up direct-NVMe read performance."
supersededBy: 78
ail: 2
---

## Decision Drivers

- Plex hot-tier NVMe drives at 69–71% utilization with no viable expansion path; an 8 TB NVMe replacement priced at ~$2,179 per drive
- Preserve direct-NVMe read performance for recently played content (transcoding, fast seek, multiple concurrent streams)
- Keep all Plex metadata, watch history, and library structure intact through the migration: no full re-scans, no resetting view counts
- Bring offsite-backup coverage to the bulk of the Plex library by routing cold content through the NAS, which already mirrors to a secondary NAS via Hyper Backup
- Replace the retired rclone-copy approach without re-creating its rename-duplicate failure mode

## Context

The Plex library on the homelab server is split across two NVMe drives: an 8 TB drive for TV and a 4 TB drive for movies. As of the decision date these were at 71% and 69% utilization respectively, with a steady-state growth rate of approximately 200 GB/month combined (135 GB on TV, 65 GB on movies, measured from Beszel over a rolling 30-day window). At that pace both drives reach the 20% min-free threshold within 5–6 months, after which Sonarr/Radarr writes would start failing.

Buying additional NVMe was the simplest path but the worst on cost: 8 TB NVMe at the time priced at ~$2,179 per drive, with no obvious follow-on plan once those filled. Moving everything to the Synology NAS (25 TB free) was the other extreme: it kills the direct-NVMe read performance that makes multi-stream Plex pleasant and shifts every cold-tier seek to NFS latency. Neither end of the spectrum was satisfying.

A tiered approach was attractive in principle: keep recently played content on NVMe, demote everything else to the NAS, and surface both to Plex as a single tree. Three things had to be solved for it to work:

1. **A unified read view.** Plex can't natively span two filesystems for one library; the answer needs to be transparent to Plex.
2. **A scoring policy that's actually useful.** The mover needs to know what's "hot" vs "cold" with enough precision that recently binged shows don't get prematurely demoted.
3. **A move mechanism that won't corrupt data.** The retired rclone-Plex jobs accumulated 2 TB of file-level orphans over years because `rclone copy` doesn't recognize Sonarr/Radarr's bulk renames: every rename produced a fresh copy on the NAS without removing the old one. A move pattern that handles renames cleanly is non-negotiable.

There was also a downstream backup question. Hot-tier content has historically had no offsite copy (the rclone-Plex jobs were an attempt at offsite coverage, and they were retired without replacement). The design intentionally leans on the mover gradually migrating content to the cold tier, where Hyper Backup to a secondary NAS provides offsite coverage. That trade is acceptable for re-downloadable media but worth being explicit about.

### Problem Statement

NVMe capacity exhaustion is imminent. The two end-state options (buy bigger drives, or move everything to the NAS) each give up too much. A tiered architecture is the right shape, but the underlying mechanics (Plex's view of a split library, the scoring policy, the move tooling) need to be solved together, not piecemeal.

## Decision

Adopt a **tiered storage architecture for the Plex TV and movies libraries**. The NAS exports a cold tier over NFS; the homelab server mounts it alongside the two NVMe hot-tier drives and presents both through a mergerfs FUSE union. Plex and Tunarr read from the union; Sonarr and Radarr write directly to NVMe, bypassing it.

- **mergerfs with the `ff` (first-found) policy** on create, action, and search. NVMe always wins for files present on both branches; Plex sees one tree and is blind to which branch any given file lives on. mergerfs's lack of inotify propagation is handled by the mover triggering an explicit Plex partial scan after every successful run.
- **Sonarr/Radarr bypass mergerfs.** mergerfs is read-only as far as the \*arr stack is concerned. This avoids the create-policy race that would otherwise put new downloads on whichever branch had more free space; new content belongs unambiguously on NVMe.
- **The Plex API as the source of truth for play data.** `viewCount` and `lastViewedAt` feed the scoring algorithm. Tautulli is *not* in the critical path; it's consulted only for per-user history breakdowns in the operator CLI. Tautulli being down has zero impact on tier decisions.
- **Scoring:** `score = view_count × recency_weight`, with recency bands of 1.0 (≤30 days), 0.8 (≤60), 0.6 (≤90), 0.3 (≤180), and 0.0 (>180 or never played). For TV, episode scores roll up to a series score (`max` across episodes), so any episode play keeps the whole series hot. This solves the otherwise pathological "binge S3E1–E4 over the weekend and the algorithm demotes S3E5–E10 as never played" problem.
- **Tier decisions:** keep hot if pinned, in the grace period, scoring above zero, or flagged for promotion; demote otherwise. Promote on a manual flag, or when Plex's `lastViewedAt` for a cold item is newer than its recorded last move (a cold-play detector that works even when Tautulli is down).
- **A nightly mover, Monday to Saturday**, built on the existing systemd-timer job pattern (ADR 0015). Sunday is skipped to avoid overlapping the weekly server backup. The mover runs with enough privilege to resolve a UID mismatch between the \*arr stack and Plex, and uses **copy-verify-delete with xxh64 checksums**, never a plain rename or move. Companion files (`.srt`, `.nfo`, etc.) move as atomic groups; a mid-group failure leaves the source intact for the next run to pick up.
- **A nightly NVMe-to-NAS content sync**, an `rsync -a --delete` that excludes every file marked cold in the mover's state. Every currently hot file has a matching NAS copy within 24 hours while cold-tier files are immune to deletion. As a side effect, demotions become a fast hash-verify-delete because the destination already matches. Strong pre-flights (valid state, a plausible item count, a writable NFS mount) refuse to act on a corrupt or partially deployed system.
- **Batch budgets** of 50 items, 500 GB, or 150 minutes per run. The caps keep a first-run wave from colliding with the backup window and bound the blast radius if any single run goes wrong. At the steady-state ~6.7 GB/day growth rate, 50 items a night leaves comfortable margin for both the initial backlog and ongoing churn.
- **Circuit-breaker pre-flights** abort the mover before any moves if the NFS or mergerfs mounts are missing, or if Plex returns an empty library (which implies a mount or auth problem, not a genuinely empty Plex).
- **`state.json` as a runtime artifact**, captured daily by the Plex database backup job (30-day retention, mirrored offsite weekly). The mover persists state after every successful move, so an interrupted run keeps its progress.
- **Two CLI surfaces, one binary:** `plex-tiering` is the automation entry point invoked by the timer; `tier-ctl` is the operator surface (`status`, `pin`, `unpin`, `promote`, `demote`, `score`, `run --dry-run`).
- **Everything deployed via Ansible**, with the Plex token injected from the secret manager at render time. `state.json` is intentionally never created or touched by Ansible; its ground truth is on disk, not in the repo.

### Alternative Approaches Considered

- **Buy bigger NVMe drives.** Rejected on cost and on the lack of a follow-on plan once those filled. Tiering is a structural solution; buying drives is a 12–18 month deferral with no architectural improvement.
- **Move all Plex content to the NAS.** Rejected on read performance. NFS-backed seeks add noticeable latency for direct play, transcoding source reads, and multi-stream workloads. The whole reason NVMe holds the library is the responsiveness it gives Plex; throwing that away to solve capacity is the wrong trade.
- **Cap the library or delete content.** Rejected on user value. The library represents years of curation; aggressive pruning treats the symptom without addressing the structural capacity problem, and the curated, no-longer-available subset is genuinely irreplaceable.
- **ZFS with an L2ARC cache.** Conceptually clean, but it would require migrating both drives from ext4 to ZFS: a multi-day project with significant risk and no clean rollback. It also doesn't solve the offsite question, since the cold portion still lives on the same physical NVMe.
- **bcachefs or a similar tier-aware filesystem.** Promising long-term but too new for production reliance. Worth revisiting in 2–3 years.
- **Two separate Plex libraries, one per tier.** Workable but ugly: users would see "Movies" and "Movies (cold)", watch history would split, and recommendations would fracture. The point of mergerfs is to keep Plex's view of the library coherent.
- **rclone copy/sync to the NAS as the tier mechanism.** Already attempted and proven to accumulate orphans through rename duplication. Rejected for any tier-related role. The existing server backup uses rclone with `--backup-dir`, which *is* rename-safe, but that's snapshot-style backup, not active tier movement, and it stays in its backup role.

## Consequences

### Pros

- **NVMe purchase deferred indefinitely**, with no architectural debt incurred. The library can grow another ~25 TB before the cold tier itself becomes a capacity question.
- **The hot read path stays direct NVMe.** The `ff` policy returns the NVMe path for any file on both branches, so there's no FUSE-introduced latency for hot content, which is the >90% case for active sessions.
- **The entire library gains offsite coverage.** Cold content gets there through demotions; hot content gets there through the nightly sync. Worst-case lag from an import to an offsite copy is about eight days (24 hours to the NAS plus a weekly mirror). Before this architecture, no Plex media had offsite coverage.
- **Plex metadata stayed intact through the migration.** No re-scan, no view-count reset, no library shuffle visible to clients. The compose swap was a five-minute container recreate.
- **Rename safety.** Copy-verify-delete with xxh64 makes cross-tier moves bit-exact, and atomic companion groups handle bulk renames cleanly. The 2 TB orphan accumulation cannot recur with this mechanism.
- **An operator surface that doesn't require thinking about tiers.** `tier-ctl pin "Knives Out"` works whether the file is hot or cold today. Day-to-day operations are about content, not paths.

### Cons

- **Reliance on the nightly content sync.** Hot-tier offsite coverage depends on the sync running every night; if it breaks silently, new imports accumulate without NAS copies. Mitigated by a Healthchecks.io check and a README status badge that turns red after two days, but it's a live dependency rather than a static guarantee.
- **Daily parity load on the NFS link.** Bounded in the steady state (~6.7 GB/day), but a bulk-rename event temporarily inflates the delta. Mitigated by running off-peak on a 24-hour cadence so renames can't snowball.
- **mergerfs is a FUSE layer that can fail.** A broken mount leaves the union empty and Plex sees nothing on either tier. Mitigated by a 15-minute health-check job that pages on failure and by the mover's circuit breaker, but it's one more failure surface than direct NVMe.
- **mergerfs doesn't propagate inotify events.** Plex won't notice relocated files without an explicit partial-scan trigger, which the mover issues after each batch.
- **A 7–8 month initial drain** at the safety-first 50-items-a-night cap, with ~11,300 items eligible for demotion at the first dry run. The slow drain is itself a feature (bounded blast radius, more nights of validation), but the system takes most of a year to reach steady state.
- **One more system to operate.** The Python package, the mover timer, the mergerfs health check, and the operator CLI add four new operational concerns. A dedicated runbook exists to keep this from becoming opaque, but it's still net new surface.

### Mitigations

- **Hot-tier offsite coverage** piggybacks on the historical parity the retired rclone jobs left behind (~99% of NVMe content already had a matching NAS copy), so the first sync was a small delta rather than a 7 TB transfer.
- **mergerfs failure detection.** The health-check job is the first line; the mover's circuit breaker is the second. Recovery, including a full rollback to direct-NVMe mounts, is documented in the runbook.
- **State loss.** `state.json` is backed up daily with weekly offsite mirroring. In the worst case, state can be rebuilt from Plex; pins and move history are the only real losses, and neither causes data loss.
- **First-run blast radius.** The nightly cap means any mover bug exposes at most ~50 items a night, with the backup as the rollback path.
- **Documentation by audience.** This ADR (the why), a design spec (the full algorithm and risk analysis), and an operational runbook. Each has a clear audience; no single document tries to be all three.

## Related

- ADR 0078: replaces this ADR's orchestration layer (the `state.json` cache and weighted scoring) with a stateless mover. The infrastructure choices here (mergerfs, NFS cold tier, copy-verify-delete) still stand.
- ADR 0006: the NAS-primary backup philosophy, which accepts re-downloadable media as a recovery path. This ADR extends it with a mechanism that gradually moves content into the protected layer.
- ADR 0015: the systemd-timer job pattern the mover and health check build on. No new scheduling infrastructure was introduced.
- ADR 0052: the broader backup direction. The mover deliberately doesn't use restic: active tier movement and snapshot-style backup are different problems.
