---
title: "Quarterly VPS Snapshot Restore Test"
number: 70
date: "2026-03-27"
status: "Accepted"
category: "Storage & Backups"
summary: "Added a quarterly CI workflow that boots the latest VPS snapshot on a throwaway instance, safely isolated from production, and proves the database can actually be restored from offsite replicas."
ail: 2
---

## Decision Drivers

- No automated validation that Hetzner snapshots are bootable and recoverable
- Litestream S3 replicas (the offsite backup for Journalistic) were untested end-to-end
- Manual DR drills are infrequent and easy to skip, so backup rot goes undetected
- Need to validate recovery without risking production infrastructure

## Context

The homelab relies on two backup mechanisms for the Hetzner VPS: weekly Hetzner snapshots (full disk image) and continuous Litestream replication of the Journalistic SQLite database to Cloudflare R2. Both are critical to disaster recovery, but neither was validated automatically. A corrupted snapshot or broken replication pipeline would go unnoticed until a real incident.

### Problem Statement

Backups that aren't tested aren't backups. The homelab had no automated way to verify that a snapshot would actually boot, that Tailscale could rejoin the tailnet, or that Litestream could restore a database from S3. A quarterly manual drill was documented but easy to defer.

## Decision

Implement a GitHub Actions workflow that runs quarterly on the 1st of January, April, July, and October. The workflow provisions an ephemeral Hetzner instance from the latest production snapshot, validates the Litestream restore path, and tears everything down, all without touching production.

### Key Design Choices

**Ephemeral infrastructure with isolated state:** The restore test uses its own OpenTofu environment with a separate state backend. No shared state with production, so a failed teardown can't corrupt the production state.

**Cloud-init production safety measures:** Booting a production snapshot on a new instance is inherently dangerous. The snapshot carries live services that would cause harm if they started:

- `tailscaled` would connect with the production identity, kicking the real VPS off the tailnet
- Docker would start the full compose stack, including Litestream (which could overwrite production backups with stale data), Caddy (Let's Encrypt rate limits), and services with external side effects
- Systemd timers would fire production automation jobs (heartbeat pings, backups, monitoring) that could mask real outages on Healthchecks.io

Cloud-init `bootcmd` runs before systemd starts services and masks all of these. A hosts-file null-route for the Healthchecks.io ping domain provides defense in depth against `Persistent=true` timers that might fire before the mask takes effect.

**Dynamic server type selection:** Rather than hardcoding a Hetzner server type (which could be renamed or discontinued), the workflow queries the Hetzner API at runtime and selects the cheapest shared x86 type whose disk fits the snapshot. This makes the workflow resilient to Hetzner lineup changes.

**Ephemeral Tailscale identity per run:** Each run generates a single-use, ephemeral Tailscale auth key via the OAuth API. Cloud-init wipes the production Tailscale state and rejoins with a fresh, per-run identity. Ephemeral nodes auto-remove when they disconnect, so cleanup is automatic.

**Litestream CLI installed at runtime:** On production, Litestream runs inside Docker. Since Docker is masked on the ephemeral instance, the workflow installs the Litestream binary directly from the release tarball into the user's home directory: no `sudo` required, no package manager dependency.

### Validation Steps

1. **Snapshot freshness**: fail fast if the latest snapshot is older than 8 days
2. **Instance bootability**: the snapshot boots and cloud-init completes successfully
3. **SSH reachability**: Tailscale joins the tailnet and SSH works
4. **Safety verification**: Docker is masked, no containers running, correct Tailscale identity
5. **Litestream S3 restore**: restore the Journalistic database from R2 to a local file
6. **SQLite integrity check**: `PRAGMA integrity_check` passes and the database has entries

### Alternative Approaches Considered

- **Full compose stack validation:** Unmask Docker and verify all containers reach a healthy state. Rejected because network-isolated containers would produce misleading health check results, and the added complexity increases false-failure risk without proportionally increasing confidence.
- **Hardcoded server type fallback chain:** Maintain a list of fallback types (cx33 → cx43 → ccx23). Rejected in favor of dynamic API-based selection, which carries no maintenance burden when Hetzner changes its lineup.
- **Pre-provisioned Tailscale auth key in the secrets manager:** Store a reusable auth key. Rejected because single-use keys consumed on one run would block the next, and reusable keys are a security concern. Per-run OAuth generation is self-contained.

## Consequences

**Pros:**

- Automated quarterly validation catches backup rot before it becomes a real incident
- Production is fully isolated: masked services, ephemeral Tailscale identity, separate state backend
- Dynamic server selection is resilient to Hetzner lineup changes
- Healthchecks.io tracks that the test runs on schedule; ntfy sends success/failure alerts
- The workflow doubles as documentation of the exact recovery steps

**Cons:**

- Each run costs ~7 minutes of CI time plus Hetzner compute (an ephemeral cx33 is ~$0.01 per run)
- Only validates the Litestream restore for Journalistic; other services rely on snapshot integrity alone
- A cloud-init race condition with `Persistent=true` timers required the hosts-file workaround

**Mitigations:**

- Cost is negligible for quarterly runs
- Snapshot bootability and SSH reachability are strong signals of overall snapshot integrity; a corrupted snapshot would fail at those stages
- The hosts-file null-route reliably blocks false Healthchecks.io pings regardless of timer ordering

## Related

- ADR-0060: Notification strategy (Healthchecks.io for recurring jobs, ntfy for events)
- ADR-0069: R2 storage used by Litestream replicas
