---
title: "Successful Terraform to OpenTofu Migration"
number: 34
date: "2025-09-10"
status: "Accepted"
category: "Infrastructure as Code"
summary: "Moved infrastructure management back to OpenTofu after discovering that the bug which drove the earlier switch to Terraform was in the configuration code, not in OpenTofu."
supersedes: [24]
ail: 2
---

## Decision Drivers

- Successful resolution of the MX record priority field issues from ADR-0024
- Long-term open source independence and stability
- Community-driven development and feature implementation
- Proven compatibility with existing infrastructure configuration

## Context

Following ADR-0024's decision to switch from OpenTofu to Terraform due to MX record priority field compatibility issues, this migration re-evaluates and migrates back to OpenTofu. The original migration attempt (ADR-0022) encountered "priority is a required field" errors that were attributed to OpenTofu compatibility issues.

**Root Cause Analysis:** Investigation revealed that the original issue was likely code-related rather than an OpenTofu limitation. The previous implementation used `try(each.value.priority, null)` while the current working configuration uses `lookup(record, "priority", null)` with `priority = optional(number)` in variable definitions.

## Decision

**Migrate from Terraform to OpenTofu** for all infrastructure management, maintaining the current working DNS configuration patterns.

**Implementation completed:** All infrastructure migrated with zero downtime and no configuration changes required.

## Technical Implementation

### Migration Results

**State Migration:**

- `tofu init -migrate-state` completed successfully
- All providers (Cloudflare, Hetzner Cloud, Tailscale) initialized correctly
- No state corruption or compatibility issues

**Configuration Validation:**

- `tofu validate` passed without errors
- `tofu plan` showed "No changes. Your infrastructure matches the configuration."
- `tofu apply` completed successfully: "0 added, 0 changed, 0 destroyed"

**MX Record Verification:**

- All MX records with priority fields function correctly
- No "priority is a required field" errors encountered
- Validates that `optional(number)` and `lookup()` patterns work properly in OpenTofu

### Code Changes Required

Minimal changes were needed: the Makefile's binary variable switched from `terraform` to `tofu`, and the `required_version` constraint moved from Terraform's `>= 1.7.0` to OpenTofu's `>= 1.6.0`.

No changes were required to:

- Provider configurations (Cloudflare, Hetzner, Tailscale)
- Module structure and `terraform` blocks
- Variable definitions and resource configurations
- State file format (100% compatible)

## Benefits Realized

### Technical Benefits

- **Proven compatibility** with existing infrastructure patterns
- **MX record functionality confirmed**: the original ADR-0024 issue was code-related
- **Seamless migration** with zero infrastructure changes
- **Full feature parity** with the previous Terraform setup

### Strategic Benefits

- **Open source independence**: no vendor lock-in concerns
- **Community-driven development**: features based on user needs
- **Long-term stability**: MPL 2.0 license permanence under the Linux Foundation
- **Future-proofing** against potential commercial licensing changes

## Lessons Learned

### From the ADR-0024 Experience

1. **Tool evaluation should test exact configuration patterns**, not just basic functionality
2. **Function choice matters**: `lookup()` vs `try()` had different compatibility
3. **Version timing**: OpenTofu's `optional()` support has matured since initial attempts
4. **Code issues can masquerade as tool limitations**

### Migration Best Practices

1. **State compatibility** between Terraform and OpenTofu is excellent
2. **Provider ecosystem** works identically across both tools
3. **Rollback capability** is straightforward due to the shared state format
4. **Testing approach** should include full plan/apply validation

## Impact on Related Systems

### Repository Structure

- Directory structure remains unchanged
- Makefile updated to use the `tofu` command
- All existing documentation patterns continue to work

### CI/CD Workflows

- No immediate changes required to workflows
- Future documentation updates will reflect OpenTofu usage
- Workflow triggers and validation processes remain the same

### Operations

- All existing procedures continue to work
- `make` targets function identically with the OpenTofu backend
- No operator retraining required for day-to-day operations

## Rollback Considerations

**Easy rollback available:**

- Both tools use identical state file formats
- Configuration syntax is 100% compatible
- A single Makefile variable change reverts to Terraform
- No infrastructure changes needed for rollback

**Risk assessment:** Very low risk migration with a proven rollback path.

## Related

- ADR-0022: Adopt OpenTofu for Infrastructure as Code (initial adoption)
- ADR-0024: Switch from OpenTofu to Terraform (the migration this reverses)

## Future Considerations

- Monitor OpenTofu community development and feature releases
- Consider contributing to the OpenTofu ecosystem based on homelab needs
- Evaluate new OpenTofu-specific features not available in Terraform
- Update documentation to reflect OpenTofu as the standard tool
