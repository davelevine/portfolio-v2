---
title: "Cloudflare Pages"
date: "2021-03-14T23:28:32-04:00"
description: "This article will detail the hosting for static sites utilizing Jamstack."
topics:
  - cloudflare
  - pages
ail: 0
---
This article will detail the hosting for static sites utilizing Jamstack.

## Jamstack

Jamstack is, at its core, an architecture used to create static sites. Because static sites largely have no dependencies and are generated on the fly, they're much faster and have a smaller attack surface. Additional information can be found on the [Jamstack website](https://jamstack.org/).

I also wrote an entire blog post on my experience with Jamstack that can be found [here](https://www.daveindigital.com/posts/jamstack/).

## My Configuration

I currently have a handful of sites hosted using Jamstack. They are as follows:

| Name                      | Site Generator | CDN        | URL                             | Build command |
|:-------------------------:|:--------------:|:----------:|:-------------------------------:|:-------------:|
| About Me                  | Jekyll         | GitHub     | <https://iam.davelevine.io>     | N/A           |
| Be Here Now               | Hugo           | Cloudflare | <https://inspire.davelevine.io> | Hugo          |
| Blog                      | Hugo           | Cloudflare | <https://www/daveindigital.com> | Hugo          |
| Cloud Dashboard [^1]      | HTML           | Cloudflare | <https://cloud.encoded.net>     | N/A           |
| Docs [^2]                 | MkDocs         | Cloudflare | <https://docs.levine.org>       | mkdocs build  |
| Jackson                   | Hugo           | Cloudflare | <https://www.jacksonlevine.com> | Hugo          |
| Resume                    | Hugo           | Cloudflare | <https://dave.levine.io>       | Hugo          |

[^1]: Cloud Dashboard was created entirely in HTML.  
[^2]: Docs deployments are currently paused on Cloudflare Pages. Active deployments have been migrated to Cloudflare Workers.

## References

- [https://github.com/matcornic/hugo-theme-learn/issues/125#issuecomment-363576875](https://github.com/matcornic/hugo-theme-learn/issues/125#issuecomment-363576875)
- [https://koz.io/ghost-to-hugo/](https://koz.io/ghost-to-hugo/)
- [https://blog.oscarmorrison.com/setting-up-ghost-and-s3/](https://blog.oscarmorrison.com/setting-up-ghost-and-s3/)
- [https://www.starfallprojects.co.uk/posts/deploy-mkdocs-netlify/](https://www.starfallprojects.co.uk/posts/deploy-mkdocs-netlify/)
- [https://gohugo.io/getting-started/quick-start/](https://gohugo.io/getting-started/quick-start/)
- [https://www.nedmcclain.com/static-ghost-site/](https://www.nedmcclain.com/static-ghost-site/)


