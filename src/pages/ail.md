---
layout: ../layouts/AilLayout.astro
title: AI Influence Level | Dave Levine
description: How Dave Levine labels AI involvement in what he publishes.
heading: AI Influence Level
lede: How I label the AI involvement in what I publish.
# Optional: a highlighted commitment box above the levels.
# commitment: Everything I write myself is AIL 2 or below. Anything higher is labelled.
badges:
  - text: "Posts without AI-generated images show a single level:"
    ail: 1
  - text: "If AI was used for images, the badge shows both:"
    ail: 1
    ailImages: 3
levels:
  - title: Human only
    tag: No AI involved
    text: I thought it, wrote it, and edited it myself.
  - title: Human created, AI reviewed
    tag: Minor AI assistance
    text: I wrote all of it, then asked an AI what was unclear or inconsistent. No new ideas came from the AI.
    examples:
      - Grammar and clarity suggestions
      - Catching inconsistencies
      - '"This part is confusing" feedback'
  - title: Human created, AI edited
    tag: AI influenced
    text: I wrote it, but kept something the AI changed.
    examples:
      - A reworked paragraph I was stuck on
      - A better structure
      - A gap it pointed out, and how to fill it
  - title: Human outlined, AI created
    tag: My thinking, AI's writing
    text: I decided what it should say and how it should be structured. The AI wrote it from that, and I went back and forth until it was right.
    examples:
      - A detailed brief with specific requirements
      - Several rounds of revision
  - title: Human defined, AI created
    tag: AI authored from my idea
    text: The idea was mine, but the AI made most of the decisions about how it turned out. I reviewed and approved it.
    examples:
      - A rough idea or loose brief
      - The AI decides the details
  - title: AI only
    tag: AI defined
    text: The AI produced it and I published it as-is.
---

Everything I publish is marked with an **AI Influence Level (AIL)**, a scale created by [Daniel Miessler](https://danielmiessler.com/blog/ai-influence-level-ail). I borrowed the idea from [Michael Heap](https://michaelheap.com/ail/). The point is simple: you should know how much of what you're reading came from me.
