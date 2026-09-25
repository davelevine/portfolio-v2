---
title: "Cloudflare Access Manual Management"
number: 28
date: "2025-09-08"
status: "Superseded"
summary: "Kept Cloudflare Zero Trust Access in the dashboard rather than in Terraform, because the provider at the time could not model Access's reusable-policy design without errors or duplication."
supersededBy: 80
ail: 2
---

## Decision Drivers

- Need to decide how Cloudflare Zero Trust Access resources should be managed
- Terraform infrastructure-as-code versus manual dashboard management
- Whether Cloudflare's Access model and Terraform's resource model are actually compatible
- Balance between automation benefits and implementation complexity

## Context

Cloudflare Zero Trust Access provides authentication and authorization for public-facing services through applications and policies. Several homelab services sit behind it, and the question came up whether to manage those resources in Terraform alongside the rest of the Cloudflare configuration or keep them in the Cloudflare dashboard.

### Problem Statement

Access resource management came down to two approaches:

1. **Terraform management**: version control, automation, and consistency with the rest of the infrastructure code
2. **Manual management**: Cloudflare's purpose-built dashboard

### Investigation

Several experiments tested whether Terraform management was feasible:

1. **API export**: tried `cf-terraforming` and custom scripts
2. **Resource import**: tried importing the existing applications and policies
3. **Configuration conversion**: wrote Terraform definitions matching the live setup
4. **Deployment testing**: exercised the import and management workflows end to end

### Findings

**Architectural incompatibility.** Cloudflare Access uses a **reusable policy model**, where a single policy can be shared across many applications. Terraform, as the provider modelled it at the time, expected a **per-resource model**, where each resource is managed individually with explicit relationships.

Specific problems:

- **Reusable policy conflicts**: the API returned "cannot update reusable policies through this endpoint" errors
- **Assignment conflicts**: applications could not be imported cleanly alongside one another
- **Import complexity**: applications and policies each needed their own composite import-ID format

## Decision

Manage Cloudflare Access applications and policies manually in the Cloudflare dashboard, not in Terraform. All Terraform variables, resources, and references to Access were removed from the codebase.

### Alternatives Considered

**Terraform with policy duplication.** Create a separate policy per application instead of sharing reusable ones. Rejected: significant management overhead, violates DRY, and every policy change becomes many edits.

**Hybrid management.** Manage applications in Terraform and policies by hand. Rejected: incomplete automation and a split responsibility model that makes every change harder to reason about.

**Custom tooling.** Build tooling to handle the reusable-policy architecture. Rejected: a substantial maintenance burden that is out of scope for a homelab.

## Consequences

### Pros

- Removes the conflict between Cloudflare's reusable-policy model and Terraform's resource model
- Reduces Terraform configuration complexity and maintenance
- Uses a dashboard Cloudflare built specifically for Access management
- Avoids fragile import processes
- Leaves the working Access configuration undisturbed

### Cons

- Access configuration is not version-controlled
- Policy updates are manual
- No automated backup or restore of Access configuration
- Access changes sit outside the infrastructure deployment workflow

### Mitigations

- Access policies change infrequently, which limits the cost of manual management
- The dashboard covers policy management comprehensively
- Critical Access configuration can be documented in operational guides if needed
- Periodic configuration exports can serve as a manual backup

## Related

- ADR 0080: Cloudflare Account Full Infrastructure-as-Code, which superseded this decision once Cloudflare provider v5 could import reusable policies cleanly
