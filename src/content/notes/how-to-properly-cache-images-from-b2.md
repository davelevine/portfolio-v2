---
title: "How to Properly Cache Images Hosted on Backblaze B2"
date: "2021-07-29T14:05:43-04:00"
description: "Because I use Cloudflare to manage my domains and Backblaze for backups, it only made sense to take advantage of their Bandwidth Alliance for creating my own CDN. This has been incredibly helpful for image hosting for this knowledge base, however, I recently noticed that caching wasn't working as it should."
topics:
  - cloudflare
  - b2
ail: 0
---
Because I use Cloudflare to manage my domains and Backblaze for backups, it only made sense to take advantage of their [Bandwidth Alliance] for creating my own CDN. This has been incredibly helpful for image hosting for this knowledge base, however, I recently noticed that caching wasn't working as it should.

[Bandwidth Alliance]: https://www.cloudflare.com/bandwidth-alliance/

## The Problem

The overall problem started when I was adding a parking page for a domain I recently purchased, [technicality.com]. The background image was hosted on B2 and the image was supposed to be cached by Cloudflare. However, each time the page loaded, it would pull the image from the origin instead of the cache. I checked this [knowledge base] and found it was doing the same thing.

Additionally, on [levine.org], each reload would fetch `search.json` from the origin. This slowed down each page load considerably, especially on the initial load. By default, Cloudflare does not cache JSON files without being forced by a Page Rule.

After doing a lot of research, I realized there were three things that I needed to do that weren't configured...

* Configure CORS in B2 for the bucket everything is stored in.
* Add cache-control to the bucket in B2.
* Reconfigure the **Page Rules** on Cloudflare.

[technicality.com]: https://technicality.com
[knowledge base]: https://levine.org
[levine.org]: https://levine.org

## The Solution

### CORS

* Log into Backblaze and open **Buckets**
* Find the **my-bucket** bucket and open **CORS Rules**

* Change the CORS setting from `Do not share any files with any origin` to `Share everything in this bucket with every origin`.[^1]

[^1]: Since bucket access is already restricted through Cloudflare as well as in B2, I'm not very worried about using this setting. However, it would not be my first choice in a Production environment.

### Cache-Control

* Log into Backblaze and open **Buckets**
* Open **Bucket Settings**
* In the **Bucket Info** section, add the following:

`{"cache-control":"max-age=86400"}`

> **Warning**
>
> This step may not be necessary as it's likely being overriden by the Page Rules on Cloudflare. However, it can't hurt to have this added to the bucket as a failsafe in case any Page Rules on Cloudflare change at any point.

### Page Rules

* Log into Cloudflare and open the `levine.org` domain.
* Navigate to **Page Rules**
* Since the CDN content doesn't change very frequently, it will have the following rules:

> **cdn.levine.io/***
>
> * **Browser Cache TTL**: a day
> * **Cache Level**: Cache Everything
> * **Edge Cache TTL**: a month
> * **IP Geolocation Header**: On
> * **Origin Cache Control**: On

Having the **Origin Cache Control** option set to On will control what assets Cloudflare, and the browser, will cache.

> **kb.levine.org/***
>
> * **Auto Minify**: Select HTML/CSS/JS
> * **Browser Cache TTL**: 30 minutes
> * **Cache Level**: Cache Everything
> * **Edge Cache TTL**: 2 hours

The cache level can likely be set to Standard, however, since the cache TTL for both the browser and edge are set to the minimum, it's likely not going to be a problem with updates made to the site. Should it interfere with new content loading, I'll adjust it accordingly.

## Postmortem

Once these adjustments were made, images and additional content are now being cached appropriately. This took a lot of trial and error, but was a worthwhile exercise that has now improved page load speed tremendously.

## References

* <https://community.cloudflare.com/t/cache-images-from-backblaze-b2/63104/7>
* <https://community.cloudflare.com/t/solved-origin-cache-control-and-expires-headers-have-no-effect-cloudflare-is-incompatible-with-imunify360-solution-disable-webshield/7858*5>
* <https://gist.github.com/charlesroper/f2da6152d6789fa6f25e9d194a42b889>
* <https://community.cloudflare.com/t/what-is-origin-cache-control/30606>
* <https://stackoverflow.com/questions/11560101/caching-json-with-cloudflare>
* <https://gist.github.com/davelevine/795df9e7d14aabda4d1bdfc6b66158bc>


