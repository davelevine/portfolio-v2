---
title: Homelab IaC
tech:
  - Ansible
  - OpenTofu
  - Docker Compose
  - GitHub Actions
  - Tailscale
  - Cloudflare
  - Bitwarden Secrets Manager
  - Renovate
stack: ['Ansible', 'OpenTofu']
description: My homelab, defined in code. More than 70 self-hosted services across a bare-metal server and a Hetzner VPS, managed with Ansible, OpenTofu, and GitHub Actions.
summary: "My homelab, defined in code."

image: https://cdn.levine.io/uploads/images/gallery/2025-10/systems-architecture-diagram-dark-2025-10-10.webp
isFeatured: true

---

## Description

This is the repository behind my homelab. It runs more than 70 containerized services across a bare-metal Ubuntu server at home and a Hetzner VPS for the ones that need high uptime. A Raspberry Pi control node runs Ansible and a set of self-hosted GitHub Actions runners, so changes are made in the repository, checked in CI, and deployed from there.

The repository is private by design. The [decision records](/decisions/) are the public view into it, and I've written about how it came together in [Infrastructure as Code (IaC)](/writing/infrastructure-as-code/) and [Resolving Secrets at Deploy Time](/writing/secrets-at-deploy-time/).

## Key Takeaways

### Deployment

* [Ansible] configures every host from the control node, and [OpenTofu] provisions the VPS and manages DNS across multiple domains, Cloudflare tunnels, and firewall rules, with state stored in Cloudflare R2.
* [Renovate] opens pull requests for image updates. Allow-listed minor and patch updates merge automatically and roll out in a nightly maintenance window; major updates wait for review.
* Package updates run weekly across every host, followed by drift detection.

### Security

* Secrets live in [Bitwarden Secrets Manager] and are resolved at deploy time.
* Every pull request runs ansible-lint, Compose validation, and [KICS] security scans, and a gitleaks pre-commit hook stops secrets before they're committed.
* [Tailscale] connects the home network and the VPS, and Cloudflare Tunnels expose only select services.

### Reliability

* Backup age is checked daily across every host.
* Restores are tested on a schedule: monthly integrity checks for the home server, and a quarterly test that restores the VPS from its latest snapshot on a throwaway instance, validates the data, and tears it down.
* Gatus, Beszel, Ntfy, and Healthchecks.io handle monitoring and alerting.
* Written runbooks cover everything from break-glass access to a complete rebuild.

### Documentation

* A private documentation site covers every layer, from Ansible roles, Docker stacks, and OpenTofu to the network, NAS, and Home Assistant.
* More than 80 architecture decision records capture the reasoning behind each change, and CI validates them on every pull request that touches them.

  [Ansible]: https://www.ansible.com/
  [OpenTofu]: https://opentofu.org/
  [Bitwarden Secrets Manager]: https://bitwarden.com/products/secrets-manager/
  [Renovate]: https://github.com/renovatebot/renovate
  [KICS]: https://kics.io/
  [Tailscale]: https://tailscale.com/
