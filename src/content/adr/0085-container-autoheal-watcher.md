---
title: "Self-Hosted Autoheal Watcher for Unhealthy Containers"
number: 85
date: "2026-08-13"
status: "Accepted"
summary: "Added a small systemd-supervised host script that restarts unhealthy-but-running containers that opt in with a label, because Docker's restart policy ignores failing healthchecks and the usual autoheal sidecar was unmaintained and needed the Docker socket inside a container."
ail: 2
---

## Decision Drivers

- Docker's `restart:` policy reacts only to a container exiting, never to a failing healthcheck, so an `unhealthy`-but-running container is left wedged indefinitely
- The stack already defines healthchecks on most services, so the failure signal exists and is simply not acted on
- Any fix should avoid adding an unmaintained third-party image and avoid mounting the Docker socket into a container

## Context

Every service in the compose stacks sets `restart: unless-stopped` via shared anchors, and most define a healthcheck. But Docker treats those two facts independently: the restart policy fires on a non-zero *exit*, while the healthcheck only flips a container's status to `unhealthy`. A container that deadlocks (process alive, healthcheck failing) satisfies the restart policy, since it never exited, and stays broken until someone notices and restarts it by hand. That's the one self-healing gap left in an otherwise reconciled stack.

### Problem Statement

Close the unhealthy-but-running gap for the services where a restart is the correct remediation, without adding fragile dependencies or new socket exposure, and without auto-restarting services where a restart would cause collateral damage.

### willfarrell/autoheal Was Evaluated First

The usual answer is the `willfarrell/autoheal` sidecar: a container that watches the Docker socket and restarts anything labeled unhealthy. It works and is effectively feature-complete (the Docker health API it wraps hasn't changed), but it was rejected here for three reasons. It's an unmaintained third-party image (no releases in roughly a year) pulled into a stack that otherwise digest-pins and audits every image. It requires mounting the Docker socket into a container, which the KICS scan flags and which widens the blast radius of a container compromise. And "what restarts the watcher?" resolves to *another container*, which is weaker supervision than the platform already offers.

## Decision

Run a self-hosted watcher instead: a ~20-line shell loop that polls `docker ps --filter health=unhealthy --filter label=autoheal=true` and restarts each match. It ships through the Ansible automation role as a `Type=simple`, `Restart=always` systemd service, so **systemd (PID 1) is the supervisor**: the strongest watcher on the box, with no second container involved. It runs on the host and talks to Docker directly, so no container has to mount the socket.

Scope is **opt-in per service** via the `autoheal=true` label, not blanket:

- Network-namespace owners (`gluetun`, `gatus`) must never be auto-restarted. A restart orphans every sidecar sharing their network namespace, a failure mode already seen with the Gatus/Tailscale sidecar.
- A mid-transcode Plex or a download client in the middle of a transfer shouldn't be bounced on a transient health blip.

The initial allowlist is a conservative set of stateless web and API services plus the reverse proxies. The label sits next to each service definition, so the policy is visible where the service is defined, and the set grows by adding the label. A per-container cooldown (five minutes by default) keeps a persistently unhealthy service from restart-looping, and Docker's own `start_period` grace means a just-started container is never a target. The watcher is enabled per host.

### Alternative Approaches Considered

- **The `willfarrell/autoheal` sidecar.** Rejected, as above: an unmaintained image, the socket inside a container, and a container watching containers.
- **Migrating to Podman for native `--health-on-failure=restart`.** Rejected as wildly disproportionate: it swaps the entire container runtime to gain one behavior a 20-line script provides.
- **Blanket autoheal with an exclusion list.** Rejected in favor of opt-in. The cost of a wrong auto-restart (a namespace owner, a database mid-write) is higher than the cost of a missed one, so the safe default is "off unless labeled."

## Consequences

- Containers that wedge while running now recover on their own within a sweep interval, for the opted-in set, with no new external dependency and no socket mounted into any container.
- One more host service to keep enabled. The nightly automation reconcile re-asserts it, and systemd restarts it if it crashes.
- Coverage is only as wide as the label set. This is deliberate: the allowlist grows as services prove safe to bounce, rather than starting broad and discovering the exceptions in production.
- The watcher's own liveness isn't yet on a dead-man's switch; systemd supervision is the current backstop. A Healthchecks ping per sweep is a natural later addition if a down watcher needs to page.

## Related

- ADR 0015: systemd-based job scheduling.
