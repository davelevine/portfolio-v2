---
title: "Declarative *arr Application Config via the REST API"
number: 83
date: "2026-07-27"
status: "Accepted"
category: "Automation"
summary: "Reconciled Lidarr's application settings over its REST API from Ansible, because those settings live in its database where file templating can't reach and Configarr didn't fit Lidarr."
ail: 2
---

## Decision Drivers

- Lidarr's container was fully codified while every setting that makes it work was not, so a rebuild from the repo produced a running but unconfigured application
- The settings live in Lidarr's database, which no file-templating approach can reach
- Configarr, the obvious off-the-shelf answer, turned out not to fit Lidarr

## Context

The compose file pins Lidarr's image by digest and sets its mounts, network address, user and group IDs, and healthcheck. The reverse-proxy vhost, the dashboard widget, the directory permissions Lidarr depends on, and a timer that sweeps its stuck queue are all managed too.

None of that describes the application. Indexers, download clients, the root folder, track naming, and the media-management options live inside Lidarr's database and are reachable only through the REST API. Restoring the repo onto a fresh host produced a Lidarr that started cleanly and did nothing: no indexers, no download clients, no library path.

The gap covered three indexers, two download clients, the root folder, the track naming scheme, and the media-management block, with several API keys and a client secret embedded in it.

### Problem Statement

Bring Lidarr's application configuration under version control without a file-templating path to the data, without a tool that fits the workload, and without moving secrets into the repository.

### Configarr Was Evaluated First

Configarr syncs TRaSH Guides custom formats and quality profiles into \*arr applications and was already used for Sonarr and Radarr. Extending it to Lidarr was the first candidate, and it was rejected on four counts:

- Its Lidarr support is documented as **experimental**, with an explicit "support could be dropped in the future" warning.
- That support targets **Lidarr v2**. This instance runs a v3 plugins-branch build, a major version ahead.
- **TRaSH Guides publishes no Lidarr data at all**, so the pinned-revision sync model that gives Configarr its value has nothing to pull. Every definition would be hand-written locally.
- The instance has **zero custom formats**, so the surface Configarr manages amounted to two simple quality profiles and one metadata profile.

Configarr would have covered the cheapest part of the gap while leaving every secret-bearing and structural resource untouched.

## Decision

Reconcile Lidarr's application configuration over its REST API from Ansible, with the desired state declared in host variables and the reconciler living in the role that deploys the compose stacks.

This follows the precedent the role already sets for application-level config (SABnzbd, Homepage, Forgejo): a toggle-gated include, off by default and enabled per host. The difference is the transport. Those three edit files on disk; this one speaks HTTP to a running container, so it probes first and no-ops with a warning when Lidarr isn't up, which keeps a first-ever deploy safe without reordering the role.

Four properties do the real work.

**Reconciliation is additive.** Declared resources are created or updated. Anything Lidarr has that Ansible doesn't declare is reported as a warning and left alone. Full reconciliation would catch UI drift, but a typo in host variables would then delete a working indexer on the next deploy. Detection is worth less than that risk.

**Secrets are excluded from drift detection.** Lidarr returns them masked as `********`, so comparing against them would report drift on every run forever. The cost is that a rotated key is invisible to the comparison, so pushing one needs an explicit force flag. That escape hatch is the price of never reporting phantom drift.

**A placeholder guard fails safe.** A secret-manager entry that exists but still reads `CHANGEME` causes its resource to be skipped with a warning, rather than writing the placeholder over a working key. This let the change ship before one of the keys was populated.

**Declared fields merge over existing ones** rather than replacing the field array wholesale, so a field Lidarr knows about but host variables don't declare keeps its value instead of silently resetting to a default.

Quality profiles, metadata profiles, and custom formats stay UI-managed and are documented as manual settings, the same way the Configarr setup already treats Radarr's delay profile.



## Consequences

### Positive

- A rebuild reproduces a working Lidarr, not an empty one.
- UI drift in any declared setting is corrected on the next deploy, and is visible as a plan before it's applied.
- Two credentials moved into the secret manager.
- The reconciler is written against a generic provider shape, so Sonarr, Radarr, and Prowlarr could adopt it without new machinery.

### Negative

- Declared state is transcribed from a live instance, so it needs re-checking when a Lidarr upgrade adds or renames fields. The drift report makes that visible rather than silent.
- Rotating a secret needs an explicit flag, which is easy to forget. The runbook documents it.
- Field names mirror Lidarr's API exactly, including its typos (`normalizedSeach`), which reads oddly in host variables but keeps the mapping one-to-one and greppable.

### Neutral

- Configarr keeps managing Sonarr and Radarr. The two approaches coexist, split by application rather than by concern.

## Related

- ADR 0068: the host-variable domain-file layout the declared state follows.
