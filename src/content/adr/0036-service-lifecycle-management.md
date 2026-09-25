---
title: "Establish Service Lifecycle Management Through First Service Removal"
number: 36
date: "2025-09-14"
status: "Accepted"
summary: "Removed seven unused services in one pass and set explicit removal criteria, because idle services still cost updates, monitoring and configuration sprawl."
ail: 2
---

## Decision Drivers

- Maintenance overhead from unused services
- Resource optimization across infrastructure
- Need for a systematic service removal process
- First service removal since adopting IaC practices

## Context

Since adopting Infrastructure as Code practices, the homelab has grown to include numerous Docker services across two hosts (the homelab server and the VPS). Over time, some services became unused or redundant, creating maintenance overhead without providing value. This is the first systematic removal of services since beginning the IaC journey, which required establishing criteria and a process for service lifecycle management.

### Problem Statement

Seven services across both hosts are no longer actively used but continue consuming resources and requiring maintenance. A systematic approach is needed to remove them safely while establishing criteria for future lifecycle decisions.

### Services Identified for Removal

**VPS:**

- **Binternet**: Pinterest-like interface, unused
- **Voyager**: Lemmy reader, unused after switching platforms

**Homelab server:**

- **Bitplay**: audio/media player, functionality replaced by other tools
- **ConvertX**: file conversion utilities, unused
- **Send**: file sharing service, unused
- **Send Redis**: supporting database for Send
- **Ultimate-tab**: browser tab manager, unused

## Decision

Remove the seven unused services and establish systematic service lifecycle management practices for future decisions.

Criteria for service removal:

- **Usage analysis:** no active usage over 6+ months
- **Functional redundancy:** capabilities available through other services
- **Maintenance overhead:** regular updates, security patches, and monitoring required
- **Resource optimization:** CPU, memory, storage, and network resources consumed
- **Configuration complexity:** multiple touchpoints across Ansible, Caddy, and DNS

The removal process includes cleanup across Docker Compose, Ansible templates, Caddy reverse proxy rules, DNS routing, and architecture documentation.

### Alternative Approaches Considered

- **Service hibernation:** keep configurations but stop containers.
  - Rejected: still requires maintenance and monitoring overhead.
- **Gradual removal:** remove services one by one over time.
  - Rejected: increases coordination overhead and partial-state complexity.
- **Usage monitoring first:** implement detailed analytics before removal.
  - Rejected: clear evidence of non-usage was already available through logs.

## Consequences

**Pros:**

- Reduced maintenance burden with fewer services to update and monitor
- Simpler configuration management with cleaner Ansible templates
- Freed CPU, memory, and storage capacity
- More accurate documentation, with architecture diagrams reflecting reality
- A repeatable methodology for future service lifecycle decisions

**Cons:**

- A removed service must be restored from git history if needed again
- Significant documentation effort for comprehensive cleanup
- Potential for missing edge-case dependencies during removal

**Mitigations:**

- All changes tracked in version control, enabling rollback
- Systematic testing of remaining services after removal
- Watch for requests to removed services to catch missed dependencies
- Document the process in the operations guides for future reference
