---
title: NSF.net
tech:
  - Astro
  - Markdown
  - JavaScript
  - Pagefind
  - Tailwind CSS
stack: ['Astro']
description: A historical reference site for NSFNET, the National Science Foundation's backbone network, hosted on the domain it originally ran under. Every statement is drawn from the published record and cites its source.
summary: "A sourced history of NSFNET, on its original domain."

liveLink: https://nsf.net
image: nsf-net/nsf-net-light.webp
imageDark: nsf-net/nsf-net-dark.webp
isFeatured: true

---

## Description

NSFNET was the National Science Foundation's backbone network. It ran from 1985 until 1995, and the commercial internet grew out of it. NSF.net was registered on November 5, 1986, making it the third .net domain ever registered. [I bought it in 2022](/writing/nsfnet/), and this site is what it hosts now.

The account is drawn from the published record: Merit Network's final report, the relevant RFCs, and contemporaneous institutional histories. Every statement can be checked against the document it came from, and every source is given both live and, where one exists, as an archived snapshot.

## Key Takeaways

* Built with [Astro] as a static site, with the prose in plain Markdown.
* Sources live in a single registry. The bibliography is generated from it, and a citation check fails the build if the prose links a source that isn't registered.
* Figure credits and licenses live in one place, so an image can't carry different attribution on different pages.
* Full-text search with [Pagefind], built at compile time and run entirely in the browser.
* Set in [IBM Plex], a nod to IBM's role operating the backbone with MCI and Merit Network.
* Design based on [Quiet Pages], reworked for reference material.

  [Astro]: https://astro.build
  [Pagefind]: https://pagefind.app
  [IBM Plex]: https://www.ibm.com/plex/
  [Quiet Pages]: https://github.com/xocothemes/quietpages
