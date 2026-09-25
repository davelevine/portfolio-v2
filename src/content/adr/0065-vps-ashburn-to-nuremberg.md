---
title: "Migrate the Hetzner VPS from Ashburn to Nuremberg"
number: 65
date: "2026-01-31"
status: "Accepted"
category: "Hosting"
summary: "Moved the VPS from Hetzner's US region to Nuremberg for EU data protection, cheaper and larger instances, and deliberate latency as friction against compulsively checking dashboards."
ail: 2
---

## Decision Drivers

- EU hosting provides stronger privacy protections than US-based infrastructure
- Hetzner EU pricing is significantly cheaper, with more generous resource and traffic allowances
- An intentional latency increase encourages more present, less compulsive interaction with services
- An opportunity to upgrade from CCX13 (dedicated, 2 vCPU) to CPX32 (shared, 4 vCPU) at lower cost

## Context

The VPS had been running in Hetzner's Ashburn, VA region (`ash`) since initial provisioning as a `ccx13` dedicated instance. Both the public services and the private, internal-only services (monitoring, reverse proxy, sign-in) ran from this US-East location.

### Problem Statement

Hosting in a US datacenter meant personal infrastructure was subject to US data jurisdiction. The `ccx13` dedicated instance was also more expensive than shared alternatives offering better specs, and Hetzner's EU locations include far more generous traffic allowances. Beyond the practical concerns, the low latency of a nearby US datacenter made it too easy to compulsively check services and dashboards. Adding geographic distance introduces just enough friction to encourage being more present.

## Decision

Migrate the VPS from Ashburn, VA (`ash`) to Nuremberg, Germany (`nbg1`) using a snapshot-based blue/green approach, upgrading the server type from `ccx13` to `cpx32`.

### Implementation

The migration took a snapshot of the running Ashburn server, provisioned a new `cpx32` in Nuremberg from it, then swapped the servers in OpenTofu state (`tofu state rm` for the old one, `tofu import` for the new one) and updated the server type, location and snapshot in the variables file. Follow-up work re-pointed the Cloudflare Tunnel ingress, the outbound VPN region and the edge firewall rules at the new server, and re-registered the mesh VPN node, whose identity had been carried over stale in the snapshot.

**Server comparison:**

| Attribute   | Before (Ashburn)    | After (Nuremberg)      |
| ----------- | ------------------- | ---------------------- |
| Server type | `ccx13` (dedicated) | `cpx32` (shared AMD)   |
| vCPU        | 2                   | 4                      |
| RAM         | 8 GB                | 8 GB                   |
| Storage     | 80 GB SSD           | 160 GB NVMe SSD        |
| Location    | `ash` (Ashburn, VA) | `nbg1` (Nuremberg, DE) |
| Price       | ~€12.49/month       | ~€10.99/month          |

### Alternative Approaches Considered

1. **In-place resize without migration.** Hetzner doesn't support changing the location of an existing server; rejected.
2. **Parallel operation (both servers running).** Attempted first, then rolled back because the two servers conflicted over the same Cloudflare Tunnel and Tailscale identities; rejected in favour of blue/green.
3. **Fresh Ubuntu install plus Ansible bootstrap.** Cleaner but slower; the snapshot approach preserved all service state and volumes immediately.

## Consequences

**Pros:**

- Infrastructure hosted under EU data protection regulations (GDPR) rather than US jurisdiction
- Doubled vCPU count (2 → 4) and storage (80 → 160 GB NVMe) while reducing monthly cost
- The EU traffic allowance (20 TB included) far exceeds the US allocation
- Added latency from the transatlantic distance provides natural friction against compulsive checking

**Cons:**

- The snapshot-based migration carried stale mesh VPN state that had to be wiped manually
- Cloud-init does not re-execute on snapshot-provisioned servers (known Hetzner behaviour)
- Shared vCPUs (CPX) instead of dedicated (CCX), acceptable for bursty homelab workloads
- The old Ashburn server remains in Hetzner in a shutdown state until manually deleted

**Mitigations:**

- Wiping the stale state and re-registering the node resolved the identity conflict
- Edge configuration that references the server was updated alongside the move
- The old Ashburn server is retained temporarily as a rollback option

## Related

- ADR 0017: VPS onboarding via Tailscale and a bootstrap playbook
- ADR 0032: Hetzner infrastructure management in code
- ADR 0066: Follow-up right-sizing of the Nuremberg server from CPX32 to CX33
