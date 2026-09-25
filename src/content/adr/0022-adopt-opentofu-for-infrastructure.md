---
title: "Adopt OpenTofu for External Infrastructure (Cloudflare, Hetzner, Tailscale)"
number: 22
date: "2025-08-29"
status: "Superseded"
category: "Infrastructure as Code"
summary: "Proposed OpenTofu to manage cloud resources (DNS, tunnels, VPS, ACLs) as code, so external infrastructure becomes portable, reviewable and rebuildable in hours instead of weeks."
supersededBy: 24
ail: 2
---

## Decision Drivers

- Portability across providers (reduce Hetzner lock-in)
- Reproducible rebuilds (hours, not weeks)
- Clear separation of concerns: Ansible (config) vs OpenTofu (infra)
- Policy-as-code for DNS, tunnels, ACLs, and firewalls
- CI safety (plan/apply gates) and reviewable diffs

## Context

The current state uses **Ansible** + **Docker Compose** for hosts and services. External dependencies (Cloudflare DNS and Access/Tunnels, the Hetzner VPS, Tailscale ACLs) are configured manually or ad hoc. This hinders portability, disaster recovery speed, and auditability.

## Decision

Adopt **OpenTofu** as the IaC tool for **external/cloud resources**. Start with a single environment and local state; evolve to a remote backend when needed.

This ADR was written as "Proposed." During implementation, a DNS issue that looked like an OpenTofu limitation led to a switch to Terraform (ADR 0024); that switch was later reversed once the root cause turned out to be in the configuration code (ADR 0034).

### Scope (initial)

- **Hetzner Cloud:** server, firewall, volumes, snapshots, floating IP (read-only outputs for Ansible)
- **Cloudflare:** zones/records, tunnels, Access policies
- **Tailscale:** ACLs/tags/exit-node policy as code

### Non-goals (initial)

- On-prem network gear provisioning
- App/service configuration (remains in Ansible/Compose)

## Technical Details

- **Layout:** a `terraform/` directory with reusable `modules/` and an `envs/prod/` environment holding providers, main, outputs, and variables.
- **CLI:** `tofu` (OpenTofu). Configs remain Terraform-compatible.
- **State:** local initially; evaluate a remote S3-compatible backend with locking later.
- **Secrets:** injected at runtime; never in version control.
- **CI:** lint/validate/plan on PR; manual apply when approved.
- **Interop:** expose outputs (e.g., DNS names) for Ansible consumption.

## Alternatives Considered

- **Do nothing / manual config:** lowest lift, poor DR and portability.
- **Pulumi:** rich language support; adds a new runtime and secrets story.
- **Terraform Cloud:** solid remote state and queues; external SaaS dependency with added cost and vendor coupling.

## Consequences

- **Positive:** portable, reviewable changes; faster DR; audit trail; fewer manual steps.
- **Negative:** a new toolchain to learn; need for process discipline (plans, reviews, state handling).

## Migration Plan

1. Scaffold the repo structure and Makefile targets (`init`/`plan`/`apply`/`fmt`/`validate`/`tflint`).
2. Add providers (`cloudflare`, `hcloud`, `tailscale`) with no-op config.
3. Start with read-only/dry resources or a new Cloudflare record to validate the workflow.
4. Gradually import existing records and objects (`tofu import`), one domain or system at a time.
5. Gate applies via PR review; document rollback (`tofu state` + version control).

## Security

- Secrets are never committed.
- Principle of least privilege for provider tokens (read/write scopes per use).

## Testing & Verification

- `tofu fmt -check`, `validate`, and `tflint` in CI.
- `tofu plan` required on PRs; applies only after approval.
- Post-apply smoke tests: DNS resolution, tunnel reachability, VPS access, Tailscale ACL enforcement.

## Rollback

- Revert commit, then `tofu plan` and `tofu apply`.
- For destructive changes (e.g., record deletes), prefer `lifecycle { prevent_destroy = true }` on critical resources and staged removals.
