---
title: "Migrate the Hetzner VPS from CPX32 to CX33 for Cost Optimization"
number: 66
date: "2026-02-03"
status: "Accepted"
summary: "Right-sized the VPS from CPX32 to CX33, keeping the same vCPU and RAM but halving storage that was never used, for a 48% cost saving."
ail: 2
---

## Decision Drivers

- Cost reduction from $12.59/month to $6.59/month (48% savings)
- The CPX32's 160 GB of storage exceeded actual requirements
- The CX33 keeps the same vCPU count and RAM

## Context

Following the Ashburn-to-Nuremberg migration in ADR 0065, the VPS was running as a `cpx32` shared AMD instance with 4 vCPUs, 8 GB RAM and 160 GB of NVMe storage.

### Problem Statement

The CPX32 provided 160 GB of storage, double what the CX33 offers, but this capacity was overprovisioned for actual usage. As part of general cost reduction efforts, the CX33 presented an opportunity to halve monthly costs while keeping the same vCPU and RAM configuration.

## Decision

Migrate the VPS from `cpx32` to `cx33` using a snapshot-based approach, reducing monthly costs while right-sizing storage to actual needs.

### Implementation

The same snapshot playbook as ADR 0065: snapshot the running CPX32, provision a new `cx33` in Nuremberg from it, swap the servers in OpenTofu state (`tofu state rm`, then `tofu import`), and change the server type in the variables file.

**Server comparison:**

| Attribute   | Before (CPX32)       | After (CX33)            |
| ----------- | -------------------- | ----------------------- |
| Server type | `cpx32` (shared AMD) | `cx33` (cost-optimized) |
| vCPU        | 4                    | 4                       |
| RAM         | 8 GB                 | 8 GB                    |
| Storage     | 160 GB NVMe SSD      | 80 GB SSD               |
| Traffic     | 20 TB/month          | 20 TB/month             |
| CPU         | AMD EPYC Genoa       | AMD EPYC Rome           |
| Price       | $12.59/month         | $6.59/month             |

### Alternative Approaches Considered

1. **Remain on CPX32.** The storage capacity wasn't being used; rejected for cost reasons.
2. **Downgrade to CX22 (2 vCPU, 4 GB).** Insufficient resources for the current service count; rejected.

## Consequences

**Pros:**

- 48% cost reduction, from $12.59 to $6.59/month (~$72/year savings)
- The same vCPU count (4) and RAM (8 GB) maintain service capacity
- Storage right-sized to actual usage
- The EU traffic allowance (20 TB) is unchanged

**Cons:**

- Storage reduced from 160 GB to 80 GB
- Older CPU generation (Rome vs Genoa)

**Mitigations:**

- If storage becomes constrained, additional Hetzner volumes can be attached

## Related

- ADR 0065: The preceding migration from Ashburn to Nuremberg
- ADR 0032: Hetzner infrastructure management in code
