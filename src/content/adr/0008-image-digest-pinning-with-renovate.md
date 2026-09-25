---
title: "Image Policy: Digest Pinning with Renovate Merge Windows"
number: 8
date: "2025-08-25"
status: "Accepted"
category: "Containers"
summary: "Pinned every container image by tag plus digest and tiered Renovate automerge by update type, so deploys are deterministic, rollbacks are one-line reverts, and only major upgrades need human review."
ail: 2
---

## Context

The stack runs roughly 25 containers defined in a single Compose file. Reliability and quick rollback matter more than chasing "latest." Renovate is already in use for dependency updates (see ADR 0004), but the **image immutability and update policy** needed to be formalized to ensure deterministic deploys and predictable change windows.

Operational facts:

- Images are referenced with **tags for readability** and **`@sha256` digests for immutability**.
- GitHub Actions run lint/checks and perform **nightly deployments**.
- Services have **healthchecks** and documented **runbooks**.

## Decision

Adopt the following **container image policy**:

1. **Pin every image by digest** in the Compose file.
   - Prefer `repo:tag@sha256:<digest>` so humans see the tag and the digest guarantees immutability.
2. **Renovate policy** for Docker images:
   - **Digest updates and patch releases:** eligible for **automerge** after CI passes.
   - **Minor releases:** merge after a **1–3 day delay** window (no automerge).
   - **Major releases:** **manual review** only.
3. **Change windows and cadence:**
   - Nightly deployment runs once within the **01:00–06:00 America/New_York** window to apply merged updates.
   - Out-of-band deploys are allowed via a manual workflow.
4. **Security:**
   - If a critical CVE affects a current digest, Renovate's PR to a new digest is prioritized and can be merged immediately after CI.
5. **Rollback:**
   - Revert the digest to the previously known-good commit and redeploy.

## Rationale

- **Determinism:** digests eliminate tag drift and ensure reproducible rollbacks.
- **Safety:** small, frequent, digest-only changes reduce blast radius; major upgrades get human review.
- **Clarity:** keeping the tag alongside the digest preserves upstream context in reviews.
- **Automation:** Renovate creates focused PRs; CI plus healthchecks catch obvious regressions.

## Alternatives Considered

- **Tags only (e.g., `:1.42`):**
  - \+ Simpler lines; familiar.
  - − Not immutable; rollbacks can fetch different bits; harder audits.
- **`:latest`:**
  - \+ Zero maintenance.
  - − Non-deterministic; risky; debugging and rollback pain.
- **Private registry image locking:**
  - \+ Strong control, air-gap readiness.
  - − Overkill for homelab scale; extra infrastructure to maintain.

## Consequences

**Positive:**

- Predictable, auditable deploys; easy diffs.
- Faster response to CVEs: merge the new digest immediately.
- Rollback is trivial (revert a line).

**Trade-offs:**

- Occasional digest-churn PRs from Renovate.
- Major upgrades require manual testing and review.

## Implementation Notes

- **Compose policy:** every service image line includes an explicit tag and digest.
- **Linting:** CI should fail if a line is missing a digest.
- **Renovate config:** Docker datasources use `rangeStrategy: pin` with `pinDigests` enabled. Separate package rules then set automerge on for digest/patch updates, off with a two-day stability delay for minors, and off with a "needs review" label for majors.
- **Operational flow:** Renovate opens PRs per the rules above; CI runs Compose lint and optionally a smoke test; merged changes are picked up by the nightly deploy; healthchecks and the dashboard confirm the result.
- **Rollback:** `git revert` the Renovate PR (or edit the digest back), then redeploy.

## Monitoring & Validation

- Use the Homepage/Beszel dashboards; verify healthchecks are green post-deploy.
- For stateful services, keep a small functional smoke test (e.g., HTTP 200 on key endpoints).

## Review Triggers

Revisit this ADR if:

- Team or infrastructure scales such that **cluster orchestration** becomes necessary (see ADR 0007 review triggers).
- Supply-chain requirements demand **SBOMs**, **signed images**, or a private registry mirror.
- CI adds **integration tests** that warrant changing automerge thresholds.

## Related

- ADR 0004: Dependency automation
- ADR 0007: Container orchestration (Compose)
- ADR 0009: Socket proxy policy
- ADR 0010: Host networking guardrails
- ADR 0011: Secrets and repo hygiene
- ADR 0076: Renovate supply-chain cooldowns (later updated this policy's delay values)
