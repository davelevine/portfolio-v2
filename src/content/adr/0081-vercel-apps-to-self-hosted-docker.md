---
title: "Migrate Vercel Applications to Self-Hosted Docker"
number: 81
date: "2026-07-14"
status: "Accepted"
summary: "Moved four Vercel-hosted apps onto the homelab's existing compose, secrets, and ingress model so there is one operational model again, while deliberately keeping the managed Neon database: self-host the compute, rent the database."
ail: 2
---

## Decision Drivers

- Four first-party applications ran on Vercel, outside every control the rest of the homelab takes for granted: no digest pinning, no runtime secret injection, no Ansible-managed lifecycle, no IaC-managed ingress
- The existing compose, Cloudflare Tunnel, and secrets stack already provides everything these apps need. Hosting them elsewhere gains nothing and costs a second, parallel operational model
- Vercel's platform primitives (`VERCEL_URL`, Vercel Cron, `adapter-auto`, per-deployment builds on the platform) had leaked into the application source, making the apps harder to move the longer they stayed
- The database question is separable from the hosting question. Answering it on its own terms avoided a driver rewrite and a Postgres operations burden

## Context

Four first-party applications ran on Vercel: an Umami analytics instance and one other app (both Next.js), plus Sharrr and one other app (both SvelteKit). All four used Neon Postgres, and the two SvelteKit apps also used object storage.

Every other homelab service runs under one consistent model: a digest-pinned image (ADR 0008) in a compose stack (ADR 0007), deployed by Ansible, with secrets injected at runtime, ingress through Cloudflare Tunnel, and scheduled work on systemd timers. These four apps sat outside all of it. Their deploys were opaque, their secrets lived in a web console, their crons were Vercel Cron entries, and their DNS pointed straight at Vercel's edge.

The cost of that split was real. Platform primitives had become bound into the application code: `@sveltejs/adapter-auto` resolving to a serverless target, `VERCEL_URL` read at build time to work out the origin, Vercel Cron as the only scheduler, and, most important, SvelteKit's `$env/static/private`, which **inlines secrets into the bundle at build time**. That last one is invisible and harmless while the platform builds privately for each deployment. It becomes a credential leak the moment a build produces a portable image.

One of these apps was already half-migrated. Sharrr's S3 backend had moved to the self-hosted VersityGW gateway (ADR 0074) while the app itself still ran on Vercel, so its uploads were already crossing back into the homelab.

### Problem Statement

Bring the four Vercel-hosted applications under the same deployment, secrets, ingress, and scheduling model as the rest of the homelab. Do it without taking on a Postgres operations burden, and without adding a platform layer whose IaC story is weaker than the existing one.

## Decision

Self-host all four applications as digest-pinned containers in the existing compose stack on the homelab server. **Keep Neon** as the database, moved to a standalone account. Add no new platform layer.

In practice:

- **Images** are built in GitHub Actions on GitHub-hosted x86 runners and published to GHCR, digest-pinned per ADR 0008. They're never built on the homelab server or on the self-hosted runners, because those runners use a different CPU architecture than the server and would produce the wrong images.
- **Ingress** for the public apps goes through the existing Cloudflare Tunnel pattern. The one internal-only app stays off it.
- **Scheduling**: Vercel Cron and one GitHub Actions cron are replaced by systemd timers that call each app's existing bearer-protected cron endpoint locally on the host.
- **Secrets** are injected at runtime into the compose environment. No secret is baked into an image, and none is written to disk on the host.
- **Application changes**, each made in the app's own repository: `adapter-auto` became `adapter-node`, the Next.js apps build with `output: 'standalone'`, `VERCEL_URL` was replaced by `ORIGIN`, and **every `$env/static/private` read was converted to `$env/dynamic/private`**.

The `$env/static/private` conversion is the load-bearing change. The images are published as **public** packages, the same as the homelab's other first-party images, so any private environment variable read statically would have been inlined into publicly pullable layers. Both SvelteKit apps read storage credentials and cron bearer tokens this way.

### Database: Neon Retained

The database was decided separately from hosting, and it came out the other way.

Neon stays, with the projects moved to a **standalone Neon account** outside the Vercel-managed organization. Measured WAN latency from the homelab to Neon's `us-east-1` region is **~10–15 ms per query**, which doesn't matter for these workloads. Self-hosting Postgres would have gained nothing and cost a rewrite of one app's `@neondatabase/serverless` driver (it speaks Neon's HTTP protocol, not the Postgres wire protocol), plus backup, point-in-time recovery, upgrades, and monitoring for another stateful service.

The homelab's instinct is to self-host. Here that instinct is wrong, and the split is deliberate: **self-host the compute, rent the database.**

### Alternatives Considered

- **Coolify.** The obvious candidate, and rejected. It was under consideration *specifically* because it advertises a Terraform provider, which promised to keep a PaaS-style layer inside the IaC model. On audit, that provider is not credible. The provider was the whole reason to adopt Coolify, and the existing Ansible, compose, tunnel, and secrets stack is already more infrastructure-as-code than Coolify with a broken provider would be. Adopting it would have added a platform to manage and reduced IaC coverage. **Don't reopen this without new evidence about the provider.**
- **Stay on Vercel.** Rejected. It leaves four apps permanently outside the homelab's operational model, and the platform coupling in the source was getting deeper.
- **Self-host Postgres.** Rejected, for the reasons above: a driver rewrite and another stateful service to operate, to save 10–15 ms per query.
- **Keep the Neon projects inside the Vercel-managed organization.** Rejected, and this is the sharpest trap in the whole migration. A Vercel-managed Neon database is owned by the Vercel *store*, and **deleting the store permanently deletes the database**. There is no transfer path. Moving to a standalone account first is what makes the eventual Vercel teardown safe instead of data-destroying.

## Consequences

### Pros

- All four apps now run under the same model as everything else: digest-pinned, Ansible-deployed, secrets injected at runtime, tunnel-fronted, timer-scheduled. The homelab has one operational model again, not two
- Secrets moved out of a vendor web console, and out of build artifacts entirely
- The apps are portable by construction. `adapter-node` plus an image configured at runtime runs anywhere, so the Vercel coupling that forced this migration can't quietly grow back
- Deploys are reviewable: an image digest in a compose file in a pull request, instead of a push-triggered build in a vendor dashboard

### Cons

- Four more services to run, patch, and monitor, and four more images for Renovate to track
- Public images. They contain no secrets (verified, below), but anyone can pull the application code and dependency tree
- The database is still a managed third-party service, so the homelab doesn't own its data end to end. That's deliberate, but it is a real dependency
- Cron reliability moves from a platform SLA to a systemd timer on a single host

### Mitigations and Hard-Won Lessons

- **The images were verified secret-free before the packages were made public.** Every layer and the config blob was unpacked and grepped for each runtime secret value, with a **positive control** (a value known to be present) checked in the same run. That wasn't ceremony. The first scan reported zero occurrences of everything *because it had silently downloaded zero bytes*: GHCR blob fetches redirect to a CDN, and the scan didn't follow them. Only the positive control told an empty scan apart from a clean one. A security check that returns nothing is worthless unless it can prove it looked.
- **Edge security rules only apply to proxied traffic.** A DNS-only record can have Cloudflare Access and WAF rules attached that have *never fired*. Switching it to a tunnel, which requires proxying, **turns them all on at once**. One app had exactly this: dormant edge rules that, left in place, would have put a login wall and a challenge page in front of the anonymous public users the app exists to serve. They were removed in the same change as the DNS switch. **Any DNS-only to tunnel migration must audit the host's edge rules first.** After cutover, they show up as a mysterious auth redirect that looks like a tunnel or CORS bug.
- **Container healthchecks must use the IPv4 loopback address, not `localhost`.** These apps bind IPv4 only, but inside the container `localhost` resolves to the IPv6 loopback first, so a `localhost` probe reports a healthy app as unhealthy.
- **A healthcheck is not a correctness check.** A database-free liveness probe proves the process is up, not that its configuration is right. One app's storage endpoint was set to a full URL where the app expected a bare hostname. It passed the image build, the healthcheck, and the cutover, then failed on the first real upload. For any setting that only a specific user action exercises, that action is the post-deploy test.
- **Rollback** is a DNS change. Each app's Vercel project stays deployed and working, so reverting a cutover means pointing the record back at Vercel.

**Deferred:** the Vercel projects and their original Neon databases are **not yet decommissioned**. Teardown waits until each app's rollback window closes, and goes in order: project, then store, then integration. **Deleting the store takes the Neon database with it.** It's the only data-destroying step in this effort, and it looks like routine cleanup.

## Related

- ADR 0007: Adopt Docker Compose for Container Orchestration (deployment substrate)
- ADR 0008: Image Policy: Digest Pinning with Renovate Merge Windows (image pinning and update policy)
- ADR 0074: Adopt VersityGW as Homelab S3 Gateway (Sharrr's S3 backend, self-hosted before the app was)
- ADR 0080: Cloudflare Account Full Infrastructure-as-Code (where the edge rules this migration had to audit are managed)
