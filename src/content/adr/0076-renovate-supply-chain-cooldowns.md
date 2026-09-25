---
title: "Renovate Supply-Chain Cooldowns"
number: 76
date: "2026-05-10"
status: "Accepted"
summary: "Raised Renovate's minimum release age on auto-merged dependency updates to 3–7 days so registries have time to catch and yank compromised releases before they reach production."
ail: 2
---

## Decision Drivers

- Recent npm and container-registry supply-chain attacks have propagated via compromised maintainer accounts publishing patch releases
- Registry security advisories typically catch malicious releases within 24–72 hours, but the previous config skipped the age gate on docker-compose and GitHub Actions patches
- The deploy path for automerged patches had no human in the loop, so a poisoned release could reach production before the registry caught up
- ADR-0008 documented a "1–3 day delay" for minor releases, which no longer matches the current threat model

## Context

Renovate manages dependency updates across docker-compose, GitHub Actions, Terraform, and a custom regex manager for KICS. The original cooldown policy was set by ADR-0008, which framed digest and patch updates as "eligible for automerge after CI passes" and minor updates as "merge after a 1–3 day delay window." That policy was written in August 2025, before the wave of high-profile npm and container supply-chain attacks that followed.

Two attacks in particular shaped this revision: the shai-hulud npm worm and the September 2025 chalk/debug compromise. Both propagated through patch releases from maintainer accounts that had been taken over (credential phishing, session hijacking). Both were yanked from the registry within hours of being detected. But "within hours" still leaves a window where a Renovate config that automerges on a 0-day age gate could ship the poisoned release straight to production.

The homelab config had this exact shape: docker-compose patches and GitHub Actions patches both had `minimumReleaseAge: null` (skip the age gate entirely), and minor updates had only a 1-day delay. That made the registry's security response the only line of defense, and gave it no time to act.

### Problem Statement

The previous Renovate cooldown values trusted that a malicious release would be detected and yanked before any of the homelab's automerged PRs could land. That assumption no longer holds against the current threat model, where attackers specifically target patch-version automerge paths because they're the most likely to deploy without review.

## Decision

Raise `minimumReleaseAge` on the four automerged rules so the registry has time to flag malicious releases before they land in main:

| Rule | Before | After |
| --- | --- | --- |
| docker-compose patch | `null` (skip age gate) | 5 days |
| docker-compose minor | 1 day | 7 days |
| github-actions patch | `null` (skip age gate) | 3 days |
| github-actions minor | 1 day | 3 days |

Container images get longer cooldowns than GitHub Actions because container registries see more frequent maintainer-account compromises and have more lag in advisory propagation. Patches get shorter cooldowns than minors because patch releases are more likely to contain real CVE fixes worth shipping promptly.

### What Stays Unchanged

- **Digest pins remain at `null`.** Pinning by digest is the defense, not the risk surface. A digest update simply locks a known image content hash, so an age gate adds no protection.
- **GHCR and LSCR-specific overrides further down the rule chain still reset patch and minor age to `null` for those registries.** Those registries don't expose the timestamp metadata Renovate needs to enforce age gates; setting a non-null `minimumReleaseAge` on them would block updates indefinitely. This means the new docker-compose cooldowns only apply to non-GHCR/LSCR images (Docker Hub, Quay, etc.).
- **Terraform rules unchanged.** Same registry timestamp limitation.
- **Existing per-image version pins unchanged.** These were already locked down for other reasons.
- **Major updates already require manual review across all managers.** No change needed.

### Relationship to ADR-0008

ADR-0008 established the overall image policy framework: digest pinning, automerge eligibility tiers, change windows, CVE response. That framework remains accurate and load-bearing. This ADR updates only the specific cooldown values in the Renovate policy section of that ADR, replacing the "1–3 day delay" for minors with the values above and adding cooldowns to the previously uncovered patch path. ADR-0008 is not superseded as a whole.

### Alternative Approaches Considered

- **Disable automerge entirely.** Maximum safety, but every dependency update would require manual review. The homelab averages dozens of Renovate PRs per month; the operator load would be significant and most of the reviews would be rubber-stamping safe patches. Rejected as disproportionate.
- **Shorter cooldowns (1–2 days across the board).** Closer to the original policy but doesn't meaningfully change the threat exposure, since malicious releases are sometimes detected only after several days. Rejected for not actually moving the needle.
- **Socket Security as the only line of defense, no cooldown change.** Socket inspects package contents at PR time and flags suspicious behavior, which catches a different class of attack than cooldowns do. The two layers are complementary, not redundant. Adopting both is cheap; relying on only one leaves a gap.

## Consequences

**Pros:**

- Automerged updates now wait long enough that registry advisories have a realistic chance to flag malicious releases before they land
- No operator workflow changes: Renovate still creates and merges PRs autonomously, just with a longer wait
- The threat-model reasoning is documented for future operators who might wonder why the values are higher than the registry-default minimums
- Pairs cleanly with Socket Security (PR-time content inspection) for defense in depth

**Cons:**

- Routine patches take 5 days longer to land. For a homelab with no SLA pressure, this is a non-issue, but it does mean a slightly older container image runs on average
- CVE-driven patches that genuinely need to ship faster still wait the cooldown unless an operator manually merges the Renovate PR (which is always available)
- The cooldown only applies to registries Renovate has timestamp data for, leaving GHCR/LSCR/Terraform images outside this protection layer

**Mitigations:**

- For urgent CVE fixes, operators can manually merge Renovate PRs at any time, bypassing the cooldown
- GHCR/LSCR images that lack timestamp gating are protected by digest pinning (ADR-0008) and the manual review requirement on majors
- Socket Security covers the content-inspection gap regardless of registry timestamp availability
- Periodic review of advisories on the dependency dashboard catches anything that did slip through

## Related

- ADR-0004: Original adoption of Renovate for dependency updates
- ADR-0008: Image policy framework; this ADR updates its cooldown values
