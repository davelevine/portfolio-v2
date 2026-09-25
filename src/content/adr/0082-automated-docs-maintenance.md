---
title: "Automated Documentation Maintenance"
number: 82
date: "2026-07-23"
status: "Accepted"
summary: "Adopted a push-triggered, headless Claude agent that proposes documentation fixes as pull requests, fenced so it can never rewrite ADRs, touch its own guardrails, or open noise PRs."
ail: 2
---

## Decision Drivers

- Documentation was maintained entirely by hand, and keeping 171 markdown files current with a fast-moving repo had become an ongoing chore
- A separate dotfiles repo had proven an agent-maintained docs pipeline over roughly a month of production use
- Documentation drift is silent: nothing fails when a page goes stale, so it goes unnoticed until someone follows a wrong procedure
- ADRs are immutable records and must stay outside the agent's write scope

## Context

The docs tree holds 171 markdown files, 82 of them ADRs, published to
[wired.io](https://wired.io) by an Astro/Starlight site that lives in the same repository.
Every update was manual: noticing a service had changed, finding the affected pages, and
editing them.

A docs validation script already catches structural breakage such as dead relative links
and hardcoded service counts, but it can't detect the failure that actually matters, which
is a page that parses cleanly and describes something that's no longer true.

The dotfiles repo addressed the same problem with a four-part harness: a rule-dense agent
prompt, a push-triggered workflow running headless Claude, a validator acting as a hard
gate, and an auto-opened PR. Its defining discipline is that making no edit is the correct
outcome for most commits.

### Problem Statement

Keep documentation current with the repository without a human noticing drift first, while
guaranteeing the agent cannot falsify an ADR, leak a secret, or generate review noise on a
repository with high Renovate commit volume.

## Decision

Adopt the dotfiles harness, retargeted from a single HTML file to the markdown docs tree,
with the docs validation script plus the site build as the gate.

A maintainer instructions file defines the agent's scope: golden rules, the security
boundary, what each document type owns, house voice, the specific pairings that drift in
this repo, and a finish checklist. A docs-update workflow runs headless Claude on pushes
to `main` and opens a pull request only when something genuinely changed.

Three constraints do the real work:

**Existing ADRs are outside the write scope.** The only edit ever permitted to one is
setting its `## Status` line to `Superseded by ADR-XXXX`. A superseded decision gets a new
ADR, never a rewrite. Rewriting an ADR falsifies the record it exists to preserve.

**Doing nothing is a successful run.** Most commits here are dependency bumps, digest
updates, and behavior-preserving refactors with no documentation consequence. The prompt
names this as the load-bearing rule, because a docs PR on every push is noise, and noise
gets ignored, which defeats the pipeline entirely.

**The agent writes only the docs tree and the README.** The workflow fails if the docs
site source or the CI configuration was touched, so the agent cannot loosen its own
constraints or work around a rendering problem by editing the theme.

The docs validation workflow gains a job that builds the site on documentation PRs,
catching unresolvable slugs and render failures that the validation script doesn't cover.

### Alternative Approaches Considered

- **Scheduled full-tree audits** instead of push-triggered runs. Rejected: reviewing a
  whole-tree diff is far harder than reviewing "this commit changed this service, so this
  page moved with it", and the audit has no specific change to anchor its judgment to.
- **A required docs checkbox on every PR.** Rejected: it's the manual process with extra
  ceremony, and it degrades to reflexive ticking.
- **Letting the agent commit directly to `main`.** Rejected: documentation is published,
  and the pull request is the review boundary that makes the security scope enforceable
  rather than aspirational.

## Consequences

**Pros:**

- Routine documentation drift is corrected without a human noticing it first
- Every change arrives as a reviewable PR with a written rationale, never a silent commit
- The site build now gates documentation PRs, closing a class of breakage the validation
  script never covered
- Both docs workflows verify their own validator before trusting it

**Cons:**

- Agent runs consume plan usage on every qualifying push
- Requires an OAuth token stored as a repository secret, which expires and must be rotated
- The agent's judgment about what warrants an edit is not perfectly predictable, so the
  "do nothing" discipline needs watching over the first several runs
- A PR that nobody reviews is worse than no PR, so this adds a standing review obligation

**Mitigations:**

- `paths-ignore` excludes the docs tree, the docs site, CI configuration, and task notes,
  so the pipeline can't trigger on its own output
- A single concurrency group with `cancel-in-progress` means a burst of merges produces
  one run, not one per commit
- The workflow hard-fails if the agent modifies the docs site or CI configuration
- Both workflows run a positive control that asserts the validation script rejects a
  deliberately broken link. Without it, "no broken links found" is indistinguishable from
  "the checker never ran"
