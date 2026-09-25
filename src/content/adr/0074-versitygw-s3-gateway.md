---
title: "Adopt VersityGW as Homelab S3 Gateway"
number: 74
date: "2026-04-23"
status: "Accepted"
summary: "Replaced MinIO, whose open-source upstream was archived, with VersityGW, a maintained Apache-2.0 gateway built for exactly the homelab's pattern of serving a POSIX directory over S3."
supersedes: [13]
ail: 2
---

## Decision Drivers

- MinIO's open-source repository was archived on 2026-02-13 and is no longer maintained. The company has moved entirely to AIStor, a commercial product. Staying on MinIO means running unmaintained storage software indefinitely
- The homelab's actual S3 usage is a thin facade over a POSIX directory, which is exactly the shape VersityGW is designed for
- A four-phase pilot validated functional parity for every active consumer
- A maintained, Apache-2.0 alternative exists and fits the use case, so there's no reason to carry a dead upstream forward

## Context

The homelab has used MinIO for S3-compatible object storage since ADR 0013. The actual footprint is narrow:

- A single instance on the homelab server, backed by a network share from the NAS, not distributed mode
- One active consumer: Sharrr's cleanup job, which purges its bucket on a daily retention schedule
- Lifecycle rules for aborting incomplete multipart uploads and expiring old versions
- A web console used for occasional manual inspection

The deployment uses none of MinIO's bigger features: erasure coding, distributed mode, bucket notifications, advanced replication. For a POSIX-to-S3 gateway, nearly all the complexity MinIO brings is a tax on features nobody uses.

MinIO's upstream history over 2025 and 2026 rules out "keep using MinIO" as a long-term path:

- **Early 2025**: the admin console and management GUI were removed from the community edition, and administration moved to the commercial tier
- **October 2025**: MinIO stopped publishing Docker images and pre-built binaries for the community edition, so distribution became source-only
- **2026-02-12**: the flagship repository's README was changed to `THIS REPOSITORY IS NO LONGER MAINTAINED`, pointing users at AIStor
- **2026-02-13**: the repository was archived

The running image was already a third-party rebuild, not an upstream release. Future CVEs in the MinIO codebase will not be fixed upstream. Staying on MinIO would only postpone this decision, not remove it.

[VersityGW](https://github.com/versity/versitygw) is an Apache-2.0 S3 gateway built for serving a POSIX directory over S3. It is actively maintained and speaks S3 at the protocol level, so the `aws` CLI and SDKs work unchanged. It keeps bucket state directly on the filesystem, stores object metadata as extended attributes, and ships an optional WebUI for browsing buckets and admin tasks.

### The Pilot

A four-phase pilot ran VersityGW beside MinIO on the homelab server:

- **Phase 1**: stood up VersityGW alongside MinIO, on a separate backend path
- **Phase 2**: validated basic S3 operations, a 120 MB multipart round trip (checksums matched), IAM scoping through bucket policies, and the WebUI. It also turned up two constraints: VersityGW requires extended attributes, which rules out the network-share backend, and it does not support S3 ACLs, only bucket policies
- **Phase 3**: declarative bucket and policy rendering through Ansible, moving Sharrr's cleanup job from `mc` to the `aws` CLI, and a scheduled multipart-abort cleanup job to replace MinIO's lifecycle rules
- **Phase 4**: switched the public S3 endpoint over to VersityGW and brought up the WebUI. MinIO stayed running with no active consumers until its formal decommission

### Problem Statement

MinIO's open-source upstream is end-of-life. Choose a maintained S3-compatible gateway that keeps per-application IAM, bucket-scoped access control, and lifecycle cleanup, without inheriting unmaintained server software.

## Decision

Adopt **VersityGW** as the homelab's S3 gateway and decommission MinIO in a follow-up.

Shape of the deployment:

- **Image**: digest-pinned and Renovate-managed, following ADR 0008
- **Backend**: a POSIX directory on local NVMe. The NAS network share can't host it, because VersityGW needs Linux extended attributes and a share mounted without Unix extensions returns `operation not supported`
- **IAM**: accounts are rendered declaratively from Ansible variables, with a dedicated admin account for day-to-day WebUI use and a separate least-privilege account per application
- **Access control**: **bucket policies only**. VersityGW returns `AccessControlListNotSupported` on `PutBucketAcl`, so each application gets access through a policy on its bucket that names its account as an allowed principal
- **Declarative buckets**: the bucket list and each bucket's policy live in one Ansible variable. A rendered script creates missing buckets and applies policies after each deploy
- **Lifecycle cleanup** runs outside the gateway, replacing MinIO's lifecycle rules:
  - A daily retention purge, run from a scheduled GitHub Actions workflow
  - A daily multipart-abort cleanup across all buckets, run by a systemd timer on the host
- **WebUI**: its advertised gateway URL points at the existing HTTPS S3 endpoint, so the browser-side requests stay HTTPS and avoid mixed-content blocks

### Alternatives Considered

- **Stay on MinIO.** Not viable long-term: upstream is archived, the running image is a third-party rebuild, and CVE fixes won't land anywhere. Rejected.
- **Fork MinIO and maintain it in-house.** Possible, but a homelab's usage doesn't justify that maintenance burden when an alternative with the same shape exists. Rejected.
- **Move all S3 to a managed provider (AWS, Backblaze B2, Cloudflare R2).** Journalistic already uses Cloudflare R2, and that choice stands. Moving homelab-local S3 off the host would add egress costs, tie local services to internet availability, and give up the latency of local storage. Rejected for the homelab-local case, kept where it already fits.
- **SeaweedFS.** A more featureful distributed blob store, but the wrong shape for a single host: it needs master and volume servers, a whole separate operational surface. Rejected.
- **Garage.** An actively developed S3 gateway that came up in the community discussion after MinIO's archival. Rejected for this round because VersityGW's POSIX-backend model fits the "thin facade over a directory" pattern more tightly, and the pilot had already validated it end to end. Worth revisiting if VersityGW ever hits a similar dead end.
- **Remove the S3 layer and expose POSIX paths directly.** Sharrr expects signed S3 URLs for browser uploads and downloads. Removing the S3 facade would break things on the consumer side without simplifying anything on the server side. Rejected.

## Consequences

### Pros

- Apache-2.0 license, with no feature removals to plan around
- The backend matches the homelab pattern directly, so there's no unused complexity to work around
- The standard `aws` CLI and SDKs replace MinIO's `mc`, dropping a niche dependency
- The WebUI covers the day-to-day administration the MinIO console used to handle
- IAM is rendered declaratively from Ansible, with no imperative per-environment policy steps
- Clear separation between emergency-only credentials and the account used for routine administration

### Cons

- The backend can't live on the NAS network share, so storage had to move to local disk
- No S3 ACL support. Access control is bucket-policy-only, which flips the mental model from "policy attached to user" to "policy attached to bucket, listing users"
- No built-in lifecycle management. Retention and multipart-abort cleanup run as external scripts and timers rather than server-side rules
- Admin tooling built around `mc` has to be reworked for the `aws` CLI or `s3cmd`
- The WebUI's browser-side requests must go to an HTTPS S3 endpoint (the mixed-content constraint)
- New hostnames on DNSSEC-signed zones take about ten minutes before the first ACME certificate is issued, while the zone re-signs. Documented, but worth budgeting for

### Mitigations

- The backend moved to local NVMe up front, in Phase 2, and that is the permanent configuration
- Bucket policies live in a single place, so the per-bucket model is as declarative as MinIO's per-user model was, just inverted
- Two focused cleanup jobs replace MinIO's lifecycle rules, and each uses only the credentials its job needs
- The deploy pipeline was hardened to detect compose-file drift and either self-heal or fail loudly
- Rollback is clean: revert the cutover, point the endpoint back at MinIO, and restore Sharrr's previous credentials. MinIO stayed in place and working throughout the transition

## Related

- ADR 0007: Adopt Docker Compose for Container Orchestration (deployment substrate)
- ADR 0008: Image Policy: Digest Pinning with Renovate Merge Windows (image pinning pattern)
- ADR 0013: MinIO IAM and Bucket Lifecycle (superseded by this ADR, not published)
