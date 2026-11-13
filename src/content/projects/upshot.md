---
title: Upshot
tech:
  - Python
  - JavaScript
  - Cloudflare Workers
  - Workers KV
  - Claude Haiku
  - GitHub Actions
stack: ['Python', 'Cloudflare Workers']
description: A news digest for AI, security, infrastructure, software engineering and tech regulation. It reads a curated list of feeds, has an LLM keep only the stories worth reading, and summarizes each one in a sentence.
summary: "A tech news digest that keeps only the stories worth reading."

liveLink: https://upshot.levine.io
githubLink: https://github.com/davelevine/upshot
image: https://cdn.levine.io/uploads/images/gallery/2026-11/screenshot-light.webp
imageDark: https://cdn.levine.io/uploads/images/gallery/2026-11/screenshot-dark.webp
imageBorder: false
isFeatured: true

---

## Description

A news digest for AI, security, infrastructure, software engineering and tech regulation, inspired by [watch.edebost.com]. Every hour it reads a curated list of feeds and sends each new story to Claude Haiku, which gives it a category, a relevance score and a one-sentence summary. Stories that clear their category's bar are published, so a big day shows a handful and a slow day shows none. Once a day it also picks five weekly essentials, each with what to do about it.

There's no server or database. A scheduled GitHub Actions job commits a small JSON file, and a Cloudflare Worker serves the static page that renders it.

## Key Takeaways

* Each story is scored on its own, so its score never depends on what it was batched with. Repeats of a story already on the site are flagged by the model and checked in code.
* Stories about a flaw under active attack are tagged **Exploited**, with whether a patch is out. A story is flagged when a CVE it names is in CISA's [Known Exploited Vulnerabilities] catalog, or when the model says it reports exploitation and the words it quotes appear in the story. Supply-chain attacks are tagged **Compromised**, and the last week's flagged stories get their own list beside the essentials.
* A built-in reader opens each article with a few bullets on what happened. Every figure in a bullet must appear word for word in the article, or the bullet is dropped.
* Article text is extracted at build time with Mozilla's [Readability] and stored in [Workers KV], so the reader never fetches from publishers and nothing runs from the source page.
* Front end in plain JavaScript, with no framework or build step. The layout follows desktop feed readers, with what's been read kept in the browser.
* Runs on the free tiers of GitHub Actions and Cloudflare Workers, plus a Claude subscription through the Claude Code CLI.

  [watch.edebost.com]: https://watch.edebost.com/
  [Known Exploited Vulnerabilities]: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
  [Readability]: https://github.com/mozilla/readability
  [Workers KV]: https://developers.cloudflare.com/kv/
