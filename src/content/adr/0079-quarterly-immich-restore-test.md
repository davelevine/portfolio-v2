---
title: "Quarterly Immich Restore Test"
number: 79
date: "2026-05-29"
status: "Accepted"
summary: "Added a quarterly, NAS-local test that restores the latest Immich dump into an isolated throwaway stack and verifies it, because the restore path for an irreplaceable photo library had never been exercised."
ail: 2
---

## Decision Drivers

- Immich holds an irreplaceable photo and video library (~145k assets spanning two decades), and its restore path had never been exercised
- The offsite backup excludes regenerable folders, which silently breaks Immich's startup integrity check on restore
- Manual DR tests are easy to defer, and backup rot goes undetected
- Recovery needs validating without risking the live, precious stack

## Context

Immich runs as a Container Manager project on the Synology NAS and is backed up three ways (a remote NAS, offsite object storage, and an independent cloud copy of the originals), with a nightly built-in database dump. All of that was verified to exist, but the *restore* had never been run end to end. A first manual test proved the procedure works and surfaced two non-obvious failure modes, both now documented in the Immich recovery runbook.

### Problem Statement

Backups that aren't tested aren't backups. A nightly dump that silently stops, a schema that drifts from a floating image tag, or a restore that trips Immich's folder-integrity check would all go unnoticed until a real loss. The data is the kind that can't be re-acquired.

## Decision

Run a quarterly restore test on the 1st of January, April, July, and October via DSM Task Scheduler on the NAS. The test restores the latest dump plus a small sample of originals into an isolated throwaway stack, verifies the data and that the server serves, tears everything down, and pings Healthchecks.io. A skipped or failed run alerts via the missed or failed ping.

### Key Design Choices

**NAS-local, not GitHub Actions.** Unlike the VPS restore test (ADR 0070), this test can't run in CI. It needs the NAS's own Docker engine, the live dump, and the live environment file, and a cloud runner has no path into the NAS's Docker. DSM Task Scheduler keeps it self-contained on the NAS, with no dependency on the control node or the private network being up.

**The escape hatch is never automated.** This is a test, not the restore. It only reports; it never modifies or "repairs" the live stack, and the documented manual restore remains the sole recovery action. Recovery never depends on this automation being healthy.

**Full isolation from live.** The test uses a separate Compose project, port, and temp directory outside the backup tree. It reads the live dump and environment file read-only and guards against any path overlap with the live project. A `trap` tears the throwaway stack down on every exit, including failure or interrupt, so a broken run can't linger or fill the disk.

**Self-correcting version pin.** The test reads the Immich version stamped in the dump filename and pins the throwaway stack to it, so it always tests the version that produced the current dump.

### Validation Steps

1. **Dump freshness:** fail fast if the newest dump is older than eight days
2. **Database replay:** the dump restores cleanly, including the pgvecto-rs/VectorChord extension via a `search_path` workaround
3. **Data smoke test:** the restored database has a non-zero asset count
4. **Server serves:** the Immich server answers `ping` and reports its version after the first-boot vector-index rebuild

### Alternatives Considered

- **GitHub Actions (as in ADR 0070):** rejected. The cloud runner has no route to the NAS's Docker, the dump, or the environment file.
- **An Ansible/systemd timer on the control node:** rejected. It would SSH into the NAS on a schedule, adding a cross-host dependency and pulling the NAS into Ansible's scope for a single job, against the escape-hatch principle.
- **Active Ansible management of the Immich stack:** deferred. The NAS stays outside Ansible, so nothing would reconcile a managed definition, and active applies would restart a live, precious stack.
- **Committing the compose file as config-as-code (no orchestration):** rejected. The Immich compose file is stock upstream with nothing homelab-specific; a frozen copy drifts with no reconciliation loop and can fall out of sync with the very version being restored. The runbook references Immich's official compose file for the dump's version and documents the environment keys instead.

## Consequences

### Pros

- The restore path is exercised four times a year, so backup rot (a stopped nightly dump, a broken extension restore, a version-skewed schema) surfaces within a quarter rather than during a real loss.
- Fully isolated from live: separate project, port, and temp directory; read-only on the live dump and environment file; torn down on every exit.
- The self-correcting version pin always exercises the version that produced the current dump, so the test can't silently drift out of relevance.
- Doubles as living proof that the documented runbook procedure still works.

### Cons

- Each run briefly consumes NAS resources (an image pull, a full database restore, a first-boot vector-index rebuild).
- Deployment and the scheduler entry are manual, so the test isn't armed until they exist, and a missed setup is itself a gap.
- It validates the restore path, not bare-metal recovery of the NAS hardware itself.

### Mitigations

- Scheduled quarterly and off-hours, so the resource cost is negligible.
- Healthchecks.io alerts on a missed run, so a never-armed or deactivated test surfaces rather than rotting silently.
- The manual restore stays documented and independent of this automation, so a lapsed or failing test never blocks an actual recovery.

## Related

- ADR 0070: the sibling quarterly restore test for the VPS. This mirrors its pattern, on the NAS rather than in CI.
- ADR 0060: the notification strategy; Healthchecks.io tracks recurring jobs like this one.
