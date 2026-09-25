---
title: "Adopt Docker Compose for Container Orchestration"
number: 7
date: "2025-08-25"
status: "Accepted"
category: "Containers"
summary: "Chose Docker Compose over Kubernetes, Swarm, Nomad and Podman because a single-operator homelab values determinism and low overhead over cluster features."
ail: 2
---

## Context

Docker Compose has been the container layer here since around 2019; this ADR records that decision and the reasoning behind it.

The homelab runs roughly 25 services across:

- **A single bare-metal homelab server** and a **Hetzner VPS**.
- All services are already containerized and defined in a **single Compose file** with image digests and healthchecks.
- **Ansible** is the host/configuration orchestrator and CI/CD glue (GitHub Actions runs deploy/lint).
- External access is handled separately (see ADR 0012).
- Team size is **one**; priorities are **determinism**, **simplicity**, and **low operational overhead** over cluster features.

There is no current requirement for:

- Multi-node scheduling/HA, pod autoscaling, or complex service meshes.
- Horizontal scaling beyond a couple of machines.

ADR 0001 already establishes **Ansible** as the host/config workflow. This ADR focuses specifically on the **container orchestrator** choice.

## Decision

Adopt **Docker Compose** as the **container orchestration layer** for this environment, with Ansible and GitHub Actions driving lifecycle tasks (build/pull/deploy).

Operational policy:

- **Source of truth:** the Compose file is checked into the repo.
- **Determinism:** all images are **pinned by digest** (`@sha256`); Renovate manages updates.
- **Networking:** a default bridge network; host networking only where explicitly permitted (see ADR 0010).
- **Secrets:** kept out of version control; the repo holds placeholders only (see ADR 0011).
- **Backups:** bind mounts and named volumes are included in backups, plus app-specific dumps for stateful services.

## Rationale

- **Simplicity and speed:** Compose matches the scale and skills of a single-operator homelab and avoids the cognitive and operational load of Kubernetes or Nomad.
- **Deterministic deploys:** digest pinning plus Renovate yields safe, auditable changes with easy rollback.
- **Tight Ansible integration:** trivial to template environment files, lay down configs, and call `docker compose` idempotently.
- **Transparency:** one file describes the stack; easy to review in PRs and reason about failures.

## Alternatives Considered

- **Kubernetes (K3s, MicroK8s):**
  - \+ Strong HA primitives, ecosystem, CRDs.
  - − Significant complexity, additional controllers, learning curve, storage/ingress overhead; heavy for a single host plus a VPS.
- **Docker Swarm:**
  - \+ Simpler than Kubernetes, native to Docker.
  - − Limited project momentum and feature depth; tooling and docs are already standardized on Compose.
- **Nomad:**
  - \+ Simple scheduler with good ergonomics and multi-runtime support.
  - − Introduces another control plane and config domain without a strong need today.
- **Podman + Podman Compose / systemd units:**
  - \+ Rootless options, good on RHEL-like hosts.
  - − Diverges from existing Docker workflows and tooling; limited net benefit here.

## Consequences

**Positive:**

- Minimal moving parts; faster troubleshooting.
- Lower resource usage than a full control plane.
- Clear diff-based reviews for service changes.

**Negative / trade-offs:**

- No built-in cluster scheduler or HA.
- Rolling updates and zero-downtime patterns are manual where needed.
- Service discovery is limited to Compose networks (acceptable at current scale).

## Implementation Notes

- Keep Compose canonical in the repo; render real environment files on target hosts at deploy time.
- Renovate bumps **digests** and opens PRs, scoped to the docker-compose manager only. Digest and patch updates automerge immediately, minor updates automerge after a one-day age gate, both inside an overnight 01:00–06:00 ET window; majors are manual review only (policy per ADR 0008). PRs are labeled by update type and target host, and a few images get custom versioning rules (e.g., LinuxServer tags normalized to semver) or are excluded and updated by hand.
- Healthchecks are required for internet-facing and critical services.
- Prefer bind mounts for human-readable config; use named volumes for opaque state.

## Monitoring & Operations

- Status, metrics, and notifications are centralised.
- A nightly scheduled deploy runs once within the 01:00–06:00 America/New_York window, with manual workflows available for on-demand changes.
- Runbooks exist for key stacks.

## Review Triggers

Revisit this ADR if any of the following become true:

- Need for **multi-node** scheduling/HA or automated **autoscaling**.
- Strong requirement for **zero-downtime** rolling updates across many services.
- The team grows and benefits from declarative CRD-style workflows and multi-tenant policies.

## Related

- ADR 0001: Ansible orchestration
- ADR 0008: Image policy (digests + Renovate)
- ADR 0009: Docker socket proxy policy
- ADR 0010: Host networking guardrails
- ADR 0011: Secrets and repo hygiene
- ADR 0012: External access model
