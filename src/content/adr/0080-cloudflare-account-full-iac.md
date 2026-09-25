---
title: "Cloudflare Account Full Infrastructure-as-Code"
number: 80
date: "2026-07-02"
status: "Accepted"
summary: "Brought the whole Cloudflare account under OpenTofu by importing every existing resource verbatim, and accepted documented gaps where a resource genuinely cannot round-trip rather than inventing workarounds."
supersedes: [28]
ail: 2
---

## Decision Drivers

- The Cloudflare account had grown a large surface of dashboard-only configuration (zone settings, rulesets, rate limits, R2, Workers, Zero Trust Access) with no version control, review gate, or drift detection
- DNS records and tunnels were already managed as code, leaving an inconsistent split where the rest of the account drifted freely
- Cloudflare provider v5 matured import support for rulesets, Access, and R2, removing the blockers documented in ADR 0028
- Some of the resources to be imported are sensitive, so state had to be encrypted before importing them

## Context

The homelab manages its cloud infrastructure with OpenTofu against a single multi-zone Cloudflare account. DNS records and Cloudflare Tunnels were already codified, but everything else was configured by hand in the dashboard: per-zone TLS and security settings, redirects, transform and cache rules, security-header rules, rate limiting, WAF custom rules, R2 buckets and their custom domains, Worker routing, and the Zero Trust Access surface.

Hand-managed configuration has no history, no plan-review gate, and no way to detect out-of-band changes. A dashboard edit is invisible until something breaks. As the account grew, the gap between the small codified core and the large uncodified remainder became the main source of untracked risk.

### Problem Statement

Bring the entire Cloudflare account under OpenTofu so the dashboard becomes read-only in practice: every change flows through a reviewed plan, drift is detectable, and the account's configuration is reproducible from the repository. Do this without disrupting live traffic, and without inventing clever workarounds where the provider or API genuinely cannot round-trip a resource.

### Why ADR 0028 No Longer Holds

ADR 0028 concluded that Cloudflare Access could not be managed by Terraform, citing reusable-policy update errors, assignment conflicts, and import-format complexity under the provider of the time. Provider v5 resolves this: reusable policies are first-class account-level resources, applications reference them by ID, and both import cleanly. The incompatibility ADR 0028 described is gone, so this ADR supersedes it for everything the provider can now round-trip. The few Access resources that still can't be imported cleanly stay manual, in keeping with ADR 0028.

## Decision

Manage the full Cloudflare account surface as code in the Cloudflare OpenTofu module. Delivery runs through a long-lived integration branch, one phase per pull request, and each phase is gated by a plan review before apply and a clean follow-up plan after. Every existing resource is **imported**, never recreated, and transcribed verbatim so the first plan after import is diff-free.

Phases, in order:

1. Zone settings (TLS, HTTPS, security, performance)
2. Single redirects
3. Response-header, request-transform, and cache rules
4. Rate limiting
5. R2 buckets, Worker routing, and R2 custom domains
6. OpenTofu native state and plan encryption, then Zero Trust Access

WAF custom rules had been codified just before this effort. DNS records and tunnels were already codified and did not change.

### State Encryption (Prerequisite)

Some Access resources are sensitive and would end up in state, so state was encrypted at rest before importing them, using OpenTofu's native state encryption (available from 1.7). The existing plaintext state was migrated in place through a temporary unencrypted fallback method, which was removed once the stored state object was confirmed to be ciphertext.

### Transcription and Import Method

Each phase used the same loop: list the live resources from the API, transcribe them verbatim into HCL, import each one, then iterate until `tofu plan` reports no changes. Where many resources share one shape, as zone settings and rate limits do, they're driven from a YAML data file. Where they vary, as Access applications do, they're written as individual resource blocks. Inventories taken from the dashboard were repeatedly wrong, so every phase re-checked the live API before writing code.

### Alternatives Considered

- **`cf-terraforming` bulk generation.** Rejected: its output depends on the provider version and still needs hand-reconciliation to reach a diff-free plan. It also has no way to encode the deliberate gaps below.
- **Continue manual management (status quo, ADR 0028).** Rejected: the untracked surface was the largest source of undetectable drift.
- **Force everything in, including resources whose secrets can't round-trip.** Rejected: the guiding principle was to accept a known gap rather than a clever hack.

## Consequences

### Pros

- The Cloudflare account is reproducible from the repository, and the dashboard is read-only in practice
- Every change flows through a reviewed plan, and out-of-band drift shows up on the next plan
- State is encrypted at rest
- Imports were diff-free, so bringing everything under code changed nothing live apart from a handful of harmless provider-default values written to state

### Cons

- More HCL to maintain, and some provider-version quirks to track, such as deprecated attributes with upstream replacements
- Some resources genuinely cannot be codified today and remain dashboard-managed
- Running `tofu` now fails without the encryption passphrase, so the standard wrapper is mandatory

### Deliberate Gaps: Known Gap Over Clever Hack

A small set of resources stays out of code on purpose, for three kinds of reason:

- **Write-only secrets.** Some resources carry a secret the API never returns, so a clean import is impossible without re-supplying it.
- **Attributes that never round-trip.** One resource has a computed attribute that the provider always shows as changing, and `ignore_changes` can't suppress it. Managing it would leave a permanently dirty plan.
- **Out of scope by design.** API tokens, billing, and resources already managed elsewhere.

### Mitigations

- Every gap is documented in the module's README and in the comments of the relevant resource file, so an operator knows what remains dashboard-managed and why
- Where a managed resource depends on a gapped one, it references it by ID, so the managed surface stays internally consistent
- The provider-default values were applied once and confirmed stable by a clean follow-up plan

## Related

- ADR 0028: Cloudflare Access Manual Management (superseded by this ADR)
- ADR 0034: Successful Terraform to OpenTofu Migration (the IaC foundation)
