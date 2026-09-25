---
title: "Switch from OpenTofu to Terraform for DNS Infrastructure"
number: 24
date: "2025-09-05"
status: "Superseded"
category: "Infrastructure as Code"
summary: "Switched DNS infrastructure from OpenTofu to Terraform after MX record priority fields kept failing, a problem later traced to the configuration code rather than OpenTofu."
supersedes: [22]
supersededBy: 34
ail: 2
---

## Decision Drivers

- OpenTofu compatibility issues with MX record priority fields
- Terraform's mature handling of `optional()` field specifications
- Better provider compatibility and stability for Cloudflare
- Simplified toolchain maintenance on the control node

## Context

Following ADR 0022's adoption of OpenTofu for Infrastructure as Code, multi-domain DNS management for Cloudflare was implemented. During implementation, persistent compatibility issues appeared with OpenTofu's handling of optional fields in variable definitions, specifically MX record priority fields.

**Technical issues encountered:**

- OpenTofu consistently failed with "priority is a required field" errors despite what looked like proper configuration
- Apparently different interpretation of `optional()` field behavior compared to Terraform
- Complex workarounds required for basic DNS record management

ADR 0034 later showed the real cause was in the configuration code (`try()` vs `lookup()` handling of the optional field), not OpenTofu itself.

## Decision

**Switch from OpenTofu to Terraform** for the DNS infrastructure management implementation.

**Scope:** Cloudflare DNS management (current implementation).
**Future scope:** maintain flexibility for other providers (Hetzner, Tailscale) as planned in ADR 0022.

## Technical Details

### Installation on the Control Node

Terraform was installed on the control node from HashiCorp's official apt repository.

### Configuration Compatibility

**Module structure remains identical:**

- Same HCL syntax and provider configurations
- Same variable definitions and resource blocks
- Same state file format and import procedures

**Key difference:**

- Terraform handled `priority = optional(number)` field definitions as expected
- No workarounds needed for MX record management

## Alternatives Considered

1. **Continue with OpenTofu + workarounds:**
   - Would require complex variable handling
   - Ongoing maintenance burden
   - Uncertain future compatibility
2. **Different IaC tool (Pulumi, CDK):**
   - Would require a complete rewrite of existing modules
   - New learning curve and different operational patterns
   - Inconsistent with existing toolchain preferences
3. **Manual DNS management:**
   - Eliminates the IaC benefits established in ADR 0022
   - Reduces disaster recovery capabilities

## Consequences

### Positive

- **Immediate resolution** of the MX record priority field issues
- **Mature provider ecosystem** with better Cloudflare support
- **Simplified operations**: no workarounds needed
- **Proven stability** for DNS management workloads
- **Maintains all benefits** outlined in ADR 0022 (portability, reproducibility, policy-as-code)

### Negative

- **Tool divergence** from the OpenTofu preference expressed in ADR 0022
- **Additional package** to maintain on the control node
- **Learning/documentation** needs to reflect Terraform specifics

## Migration Plan

**Completed:** migration accomplished with zero downtime.

1. Installed Terraform on the control node
2. Updated the provider lock file (`.terraform.lock.hcl`)
3. Verified configuration compatibility
4. Deployed all DNS records
5. Validated functionality across all domains

## Impact on ADR 0022

**ADR 0022 remains valid** for its architectural principles:

- Infrastructure as Code adoption
- Clear separation of concerns (Ansible vs IaC)
- Portability and reproducible rebuilds
- Policy-as-code for external resources

**Implementation tool changed:** OpenTofu → Terraform for DNS management.

## Future Considerations

- **Hetzner and Tailscale** implementations may still evaluate OpenTofu vs Terraform
- **Tool choice** should be made per provider based on compatibility
- **Terraform expertise** is now available for future IaC expansion

## Security

- Same security model as ADR 0022
- No secrets in version control

## Related

- ADR 0022: Adopt OpenTofu for Infrastructure as Code (original IaC decision)
- ADR 0034: Successful Terraform to OpenTofu Migration (reverses this decision)
