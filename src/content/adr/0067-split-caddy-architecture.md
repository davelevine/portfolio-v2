---
title: "Split Caddy Architecture with Explicit DNS Records"
number: 67
date: "2026-02-05"
status: "Accepted"
category: "Infrastructure as Code"
summary: "Split the single reverse proxy into one on the VPS and one at home, routed by explicit per-service DNS records, cutting home-service latency from ~360 ms to ~11 ms and removing the VPS as a single point of failure."
ail: 2
---

## Decision Drivers

- Transatlantic double-hop latency (~360 ms) for home service requests
- A single point of failure for accessing home services
- Simpler DNS resolution without split-DNS complexity

## Context

A single Caddy instance on the VPS in Nuremberg, Germany served as the reverse proxy for **all** services, including those running on the homelab server and the NAS at home in the US. Every request to a home service incurred a transatlantic double hop: phone to the VPS (~90 ms), VPS to the home server (~90 ms), and the same two legs back, for roughly 360 ms of overhead.

Beyond latency, this architecture made the VPS a single point of failure for home services: if the VPS went down, local services were unreachable even though they were running.

### Problem Statement

The single-Caddy architecture created two issues:

1. **Latency penalty.** Every request to 25+ home services crossed the Atlantic twice.
2. **Fragile architecture.** A VPS outage blocked access to local services running at home.

## Decision

Split Caddy into two instances: a VPS Caddy for VPS-local services, and a local Caddy on the homelab server for home services. Use explicit per-service Cloudflare DNS records to route clients directly to the correct Caddy instance over Tailscale.

### Target Architecture

- **Before:** phone → VPS (Nuremberg) → VPS Caddy → home server → and back, ~360 ms
- **After:** phone → local Caddy via Tailscale (~5 ms) → home server (~1 ms) → and back, ~11 ms

### Implementation

**Caddy split:**

| Instance    | Location               | Serves                                     |
| ----------- | ---------------------- | ------------------------------------------ |
| VPS Caddy   | Hetzner (Nuremberg)    | The handful of services running on the VPS |
| Local Caddy | Homelab server (home)  | 20+ home services plus 5 NAS services      |

Each instance is rendered from its own Ansible template, one per host.

**DNS strategy:** rather than split DNS, each service gets an explicit record, managed in code alongside the rest of the DNS zone, that points at whichever Caddy instance serves it.

Protected services still rely on a single, centrally hosted sign-in on the VPS, so the first request of a session crosses the Atlantic once; subsequent requests are served locally.

### DNS Alternatives Considered

1. **Tailscale split DNS plus CoreDNS.** The migration plan proposed this as an option, using CoreDNS on the homelab server as a restricted nameserver to override specific subdomains. Rejected because it added complexity (a CoreDNS container, Tailscale admin configuration, custom hosts files) when explicit records achieve the same result with fewer moving parts.
2. **Dual wildcard records.** Point the wildcard at both Caddy instances. Rejected because round-robin DNS sent 50% of requests to the wrong instance.
3. **Tailscale MagicDNS only.** Rejected because vanity domain URLs wouldn't work.

## Consequences

**Pros:**

- ~360 ms → ~11 ms latency for home service requests (97% reduction)
- Home services stay reachable even if the VPS is down
- Simpler DNS, with a single source of truth in the DNS zone definitions
- No split-DNS infrastructure to maintain (no CoreDNS, no custom nameserver configuration)
- The VPS Caddyfile shrank from 400+ lines to ~100

**Cons:**

- Two Caddyfiles to maintain instead of one
- Adding a new service requires updating both DNS and a Caddyfile
- Sign-in for protected local services still crosses the Atlantic (once per session)

**Mitigations:**

- Ansible templates keep both Caddyfiles consistent and reproducible
- Clear documentation for adding new services
- A wildcard record is retained as a VPS fallback for new services

## Related

- ADR 0035: Original migration from Nginx Proxy Manager to Caddy
- ADR 0065: VPS migration to the EU, which introduced the transatlantic hop
