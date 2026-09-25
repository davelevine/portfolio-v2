---
title: "Event-Driven Drift Notification"
number: 84
date: "2026-08-13"
status: "Accepted"
category: "Infrastructure as Code"
summary: "Made the per-host drift detector notify only when the drift set changes and deleted the fixed-schedule weekly digest, because drift should page when it happens and quiet weeks should stay quiet."
supersedes: [49]
ail: 2
---

## Decision Drivers

- The daily per-host drift detector computed a precise change-set and then threw it away: nothing consumed the JSON it wrote
- The only drift-shaped notification actually reaching an operator was a fixed-schedule weekly digest that fired whether or not anything changed
- A weekly cadence is the wrong signal for drift: real drift should page when it happens, and quiet weeks should stay quiet

## Context

A drift-detection script runs daily on the homelab server and the VPS. It diffs live state against a captured baseline across packages, services, config checksums, mounts, users and groups, and Docker state, writes a dated JSON report to disk, and exits 0. No workflow, script, or job ever read those reports. They accumulated unread.

The notification an operator associated with "drift" came from somewhere else: a centralized weekly infrastructure-summary workflow (ADR 0049) that collected package, container, and disk counts from each host every Sunday and sent an ntfy digest. It ran on a fixed schedule regardless of whether anything had changed, so it read as recurring noise rather than signal.

### Problem Statement

Two mechanisms split the job badly: a detector that found real drift but told no one, and a scheduled digest that told everyone every week without regard to whether drift existed. The precise, actionable data lived in the silent half.

## Decision

Wire notification to the detector that already knows what changed, and make it event-driven.

The detector now sends an ntfy notification only on a change in the drift set: new drift, a changed drift set, or a return to baseline. A signature of the current change-set is stored alongside the reports; a persisting, already-reported drift stays silent, so the daily run doesn't re-alert. The alert body carries the actual per-section additions and removals, plus the two remediation paths (adopt the change as a new baseline, or reconcile by redeploying). The job still exits 0 in all cases, so its Healthchecks.io/Gatus signal continues to mean "detection ran," not "no drift."

Notification reuses the host's existing path for job failure and recovery alerts, including how it obtains its ntfy credentials. No new secret or variable is introduced.

The weekly summary workflow is deleted. Its only unique signal was the count deltas, which event-driven drift detection now covers in far more detail, and only when something actually moved.

### Alternative Approaches Considered

- **Exit non-zero on drift and let systemd's `OnFailure=` notify.** Rejected: it trips the Healthchecks/Gatus signal (detection would look "broken" on every drift), re-alerts daily while drift persists, and the failure body is a generic `systemctl status` tail rather than the change-set.
- **Keep the weekly digest, but make it fire only on change.** Rejected as a half-measure: the per-host detector already has the richer data, so the central digest became redundant rather than merely quieter.

## Consequences

- Drift now pages when it happens, with the specific changes and what to do about them, and stays silent otherwise. This partially reverses ADR 0049's move to a single centralized reporting workflow: detection notifies from the host again. The failure modes ADR 0049 fixed (host-down blindness, duplicate schedules) no longer apply, because Healthchecks.io dead-man monitoring of the detection job itself is what now catches a silent host.
- One fewer scheduled workflow to maintain.
- The alert depends on the host's notification config and a reachable ntfy. Both are already required by every job failure and recovery notification, so this adds no new dependency.

## Related

- Supersedes ADR 0049 (GitHub Actions-based infrastructure monitoring).
- ADR 0055: the shared ntfy notification path.
- ADR 0060: the notification endpoint standard.
