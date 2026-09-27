---
title: "How to Remove B2 Bucket Prefix from Cloudflare CDN URL"
date: "2021-08-02T11:23:06-04:00"
description: "While doing some research on how to properly cache B2 images with Cloudflare, I came across an article on how to use B2 and Cloudflare Workers to effectively create a free image hosting service. This is not really something I need since the overwhelming majority of my photos are on Google Photos. However, the article did contain a section on using Cloudflare Workers to rewrite the CDN upload URL, which caught my interest."
topics:
  - cloudflare
  - workers
  - b2
ail: 0
---
While doing some research on how to properly cache B2 images with Cloudflare, I came across an article on how to use B2 and Cloudflare Workers to effectively create a [free image hosting service](https://jross.me/free-personal-image-hosting-with-backblaze-b2-and-cloudflare-workers/). This is not really something I need since the overwhelming majority of my photos are on Google Photos. However, the article did contain a section on using Cloudflare Workers to rewrite the CDN upload URL, which caught my interest.

The reason for doing such a thing is really not necessary, but does serve a few purposes...

* It creates a much cleaner URL by removing the `/file/<bucket-name>` part of the URL.
* It serves to hide which B2 bucket the content is being served from, effectively improving security.
* Remove some unnecessary headers returned by Backblaze B2 assets.
* Add basic CORS headers to allow embedding of images on external sites.
* Improve caching (both browser, and edge-cache) for images.

The end result is changing the URL from `https://subdomain.domain.com/file/<bucket-name>/test.txt` to `https://subdomain.domain.com/test.txt`.

## Workers Script

**Edit** (08/23/21): The original script was working fine only for images, but was not properly caching and serving video files after the URL rewrite. This was due to some of the code in the original script that was not properly suited for serving all types of content. I'm leaving the original script in place for reference, but will provide the new script as well. Most of the instructions are the same, although there are a few differences. While the differences are noted in this article, they are very specific in the GitHub link provided in the `References` section.

In order to make this work, do the following:

* Log into Cloudflare
* Open Workers
* Create a new Worker
* Remove the template script and add the following:

<details>
<summary>Original Worker Script</summary>

```javascript
'use strict';
const b2Domain = 'cdn.levine.io'; // configure this as per instructions above
const b2Bucket = 'my-bucket'; // configure this as per instructions above

const b2UrlPath = `/file/${b2Bucket}/`;
addEventListener('fetch', event => {
 return event.respondWith(fileReq(event));
});

// define the file extensions we wish to add basic access control headers to
const corsFileTypes = ['png', 'jpg', 'gif', 'jpeg', 'webp'];

// backblaze returns some additional headers that are useful for debugging, but unnecessary in production. We can remove these to save some size
const removeHeaders = [
 'x-bz-content-sha1',
 'x-bz-file-id',
 'x-bz-file-name',
 'x-bz-info-src_last_modified_millis',
 'X-Bz-Upload-Timestamp',
 'Expires'
];
const expiration = 31536000; // override browser cache for images - 1 year

// define a function we can re-use to fix headers
const fixHeaders = function(url, status, headers){
 let newHdrs = new Headers(headers);
 // add basic cors headers for images
 if(corsFileTypes.includes(url.pathname.split('.').pop())){
  newHdrs.set('Access-Control-Allow-Origin', '*');
 }
 // override browser cache for files when 200
 if(status === 200){
  newHdrs.set('Cache-Control', "public, max-age=" + expiration);
 }else{
  // only cache other things for 5 minutes
  newHdrs.set('Cache-Control', 'public, max-age=300');
 }
 // set ETag for efficient caching where possible
 const ETag = newHdrs.get('x-bz-content-sha1') || newHdrs.get('x-bz-info-src_last_modified_millis') || newHdrs.get('x-bz-file-id');
 if(ETag){
  newHdrs.set('ETag', ETag);
 }
 // remove unnecessary headers
 removeHeaders.forEach(header => {
  newHdrs.delete(header);
 });
 return newHdrs;
};
async function fileReq(event){
 const cache = caches.default; // Cloudflare edge caching
 const url = new URL(event.request.url);
 if(url.host === b2Domain && !url.pathname.startsWith(b2UrlPath)){
  url.pathname = b2UrlPath + url.pathname;
 }
 let response = await cache.match(url); // try to find match for this request in the edge cache
 if(response){
  // use cache found on Cloudflare edge. Set X-Worker-Cache header for helpful debug
  let newHdrs = fixHeaders(url, response.status, response.headers);
  newHdrs.set('X-Worker-Cache', "true");
  return new Response(response.body, {
   status: response.status,
   statusText: response.statusText,
   headers: newHdrs
  });
 }
 // no cache, fetch image, apply Cloudflare lossless compression
 response = await fetch(url, {cf: {polish: "lossless"}});
 let newHdrs = fixHeaders(url, response.status, response.headers);
 response = new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: newHdrs
 });

 event.waitUntil(cache.put(url, response.clone()));
 return response;
}
```

</details>

> **Important**
>
> Before deploying the Worker, tweak the `domain` and `bucket` variables at the top of the file with the domain this is hosted on, and the bucket name.

<details>
<summary>New Workers Script</summary>

```javascript
    /**
 * When requesting a file, adds the URL bits necessary in the background to get
 * it from a public B2 bucket.
 *
 * Also modifies requests for .boot, .cfg, and .pub to return the Content-Type
 * of `text/plain` (instead of the usual `application/octet-stream` or
 * `application/x-mspublisher`) that B2 would set for you automatically.
 *
 * For example:
 * You have a proxied CNAME `i.example.com` on CloudFlare pointing
 * to `f001.backblazeb2.com`.
 * To access `/test.txt` in the root of the bucket called `example-bucket`, the
 * URL would normally be `https://i.example.com/file/example-bucket/test.txt`
 * Installing this worker makes it so that the URL becomes simply
 * `https://i.example.com/test.txt`.
 */
async function handleRequest(request) {
    let url = new URL(request.url)
    // make sure you set B2_BUCKET_NAME as an environment variable
    url.pathname = `/file/${B2_BUCKET_NAME}${url.pathname}`
    let modified = new Request(url.toString(), request)
    let response = await fetch(modified, {
        cf: { cacheTtl: parseInt(CF_CACHE_TTL) }
    })
    let respURL = new URL(response.url)

    // customize Content-Type headers for various extensions here if you like
    if (/\.(pub|boot|cfg)$/.test(respURL.pathname)) {
        response = new Response(response.body, response)
        response.headers.set('Content-Type', 'text/plain')
    }
    return response
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
```

</details>

* Give the Worker a name (ex. B2CDN) and deploy the Worker.
* Open the **Settings** for the Worker script and enter the following:

| Variable name  | Value        |
|:--------------:|:------------:|
| B2_BUCKET_NAME | my-bucket |
| CF_CACHE_TTL   | 86400        |

* Open the `levine.org` site and navigate to the **Workers** tab.
* Add a new route.
* Set the route to `cdn.levine.io/*` and select the `B2CDN` Worker.

## Outcome

Using this worker, you can now strip the `/file/<bucket-name>/` section of the URL to produce URLs like `https://subdomain.domain.com/test.txt`, rather than `https://subdomain.domain.com/file/><bucket-name>/test.txt`. Once you've deployed this worker to your subdomain `subdomain.domain.com/*`, test that the new URLs are working. If the URLs are not being rewritten, clear the cache for the site.

## References

* <https://jross.me/free-personal-image-hosting-with-backblaze-b2-and-cloudflare-workers/>
* <https://github.com/davelevine/b2-remove-prefix>
* <https://gist.github.com/davelevine/229d3fc8d9c75d99c35950e564dbb907>


