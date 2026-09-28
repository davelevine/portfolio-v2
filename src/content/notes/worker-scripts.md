---
title: "Worker Scripts"
date: "2021-08-04T16:51:10-04:00"
description: "This page will be used as a reference for all Cloudflare Workers scripts."
topics:
  - cloudflare
  - workers
ail: 0
---
This page will be used as a reference for all Cloudflare Workers scripts.

## Scripts

<details>
<summary>b2cdn</summary>

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

<details>
<summary>b2cdn-old</summary>

```javascript
'use strict';
const b2Domain = 'cdn.levine.io'; // configure this as per instructions above
const b2Bucket = 'my-bucket'; // configure this as per instructions above

const b2UrlPath = `/file/${b2Bucket}/`;
addEventListener('fetch', event => {
 return event.respondWith(fileReq(event));
});

// define the file extensions we wish to add basic access control headers to
const corsFileTypes = ['png', 'jpg', 'gif', 'jpeg', 'webp', 'mp4'];

// backblaze returns some additional headers that are useful for debugging, but unnecessary in production. We can remove these to save some size
const removeHeaders = [
 'x-bz-content-sha1',
 'x-bz-file-id',
 'x-bz-file-name',
 'x-bz-info-src_last_modified_millis',
 'X-Bz-Upload-Timestamp',
 'Expires'
];
const expiration = 86400; // override browser cache for images - 1 day

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
  // cache other things the same
  newHdrs.set('Cache-Control', "public, max-age=" + expiration);
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

<details>
<summary>mkdocs</summary>

```javascript
const base = "https://docs.levine.org"
const statusCode = 301

async function handleRequest(request) {  
    const url = new URL(request.url)  
    const { pathname, search } = url
  
  const destinationURL = base + pathname + search
  
  return Response.redirect(destinationURL, statusCode)
}

addEventListener("fetch", async event => {
    event.respondWith(handleRequest(event.request))
})
```

</details>

<details>
<summary>parked</summary>

```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  /**

* Respond to the request
* @param {Request} request
   */
  async function handleRequest(request) {
  
  let modifiedHeaders = new Headers()

    modifiedHeaders.set('Content-Type', 'text/html')
    modifiedHeaders.append('Pragma', 'no-cache')
  
    return new Response(maintenancepage, {headers: modifiedHeaders})
  }
  let maintenancepage = `

  <!doctype html>
  <title>Site Maintenance</title>
  <style>
    body {
          text-align: center;
          padding: 150px;
          background: url('https://cdn.levine.io/uploads/images/gallery/2021-07/scaled-1680-/us9bDXP8mvzQCl8f-cshong-idt3b9dzjsq-unsplash-2400x1349.jpg') no-repeat center center fixed;
          background-size: cover;
          -webkit-background-size: cover;
          -moz-background-size: cover;
          -o-background-size: cover;
        }

      .content {
          background-color: rgba(255, 255, 255, 0.75); 
          background-size: 100%;      
          color: inherit;
          padding: 1px 100px 10px 100px;
          border-radius: 15px;        
      }

    h1 { font-size: 40pt;}
    body { font: 20px IBM Plex Serif, serif; color: #333; }
    article { display: block; text-align: center; width: 75%; margin: 0 auto; }
    a:hover { color: #333; text-decoration: none; }
  </style>

 <article>
        <h1>We&rsquo;ll be back soon!</h1>
          <p>This page is currently unavailable as it's undergoing maintenance.</p>
          <p>Please check back soon...</p>
          <p>You can use <span style="color: #000000;"><strong><a style="color: #000000;" href="https://cachedview.com/">https://cachedview.com/</a></strong></span> in the mean time.</p>
          <p>&mdash; <B><font color="red">{</font><B>Dave</B><font color="red">}</font></p>
  </article>
  `;
```

</details>

<details>
<summary>plausible</summary>

```javascript
const ScriptName = '/js/script.js';
const Endpoint = '/api/event';

const ScriptWithoutExtension = ScriptName.replace('.js', '')

addEventListener('fetch', event => {
    event.passThroughOnException();
    event.respondWith(handleRequest(event));
})

async function handleRequest(event) {
  const pathname = new URL(event.request.url).pathname
  const [baseUri, ...extensions] = pathname.split('.')

  if (baseUri.endsWith(ScriptWithoutExtension)) {
      return getScript(event, extensions)
  } else if (pathname.endsWith(Endpoint)) {
      return postData(event)
  }
  return new Response(null, { status: 404 })
}

async function getScript(event, extensions) {
    let response = await caches.default.match(event.request);
    if (!response) {
        response = await fetch("https://plausible.io/js/plausible." + extensions.join("."));
        event.waitUntil(caches.default.put(event.request, response.clone()));
    }
    return response;
}

async function postData(event) {
    const request = new Request(event.request);
    request.headers.delete('cookie');
    return await fetch("https://plausible.io/api/event", request);
}
```

</details>

<details>
<summary>search</summary>

```javascript
const base = "https://search.cc"
const statusCode = 301

async function handleRequest(request) {  
    const url = new URL(request.url)  
    const { pathname, search } = url
  
  const destinationURL = base + pathname + search
  
  return Response.redirect(destinationURL, statusCode)
}

addEventListener("fetch", async event => {
    event.respondWith(handleRequest(event.request))
})
```

</details>

<details>
<summary>securityheaders</summary>

```javascript
const DEFAULT_SECURITY_HEADERS = {
    /*
    Secure your application with Content-Security-Policy headers.
    To avoid introducing breaking changes, these headers are not automatically set. 
    Read more here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    */
    /*
    You can also set Strict-Transport-Security headers. 
    These are not automatically set because your website might get added to Chrome's HSTS preload list.
    Here's the code if you want to apply it:
    "Strict-Transport-Security" : "max-age=63072000; includeSubDomains; preload",
    */
    /*
    X-XSS-Protection header prevents a page from loading if an XSS attack is detected. 
    Read more here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
    */
    "X-XSS-Protection": "1; mode=block",
    /*
    X-Frame-Options header prevents click-jacking attacks. 
    Read more here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
    */
    "X-Frame-Options": "DENY",
    /*
    X-Content-Type-Options header prevents MIME-sniffing. 
    Read more here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
    */
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    'Cross-Origin-Embedder-Policy': 'require-corp; report-to="default";',
    'Cross-Origin-Opener-Policy': 'same-site; report-to="default";',
    "Cross-Origin-Resource-Policy": "same-site",
}
const BLOCKED_HEADERS = [
    "Public-Key-Pins",
    "X-Powered-By",
    "X-AspNet-Version",
]
addEventListener('fetch', event => {
    event.respondWith(addHeaders(event.request))
})
async function addHeaders(req) {
    let response = await fetch(req)
    let newHeaders = new Headers(response.headers)


    const tlsVersion = req.cf.tlsVersion
    // This sets the headers for HTML responses: 
    if (newHeaders.has("Content-Type") && !newHeaders.get("Content-Type").includes("text/html")) {
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        })
    }


    Object.keys(DEFAULT_SECURITY_HEADERS).map(function (name) {
        newHeaders.set(name, DEFAULT_SECURITY_HEADERS[name]);
    })


    BLOCKED_HEADERS.forEach(function (name) {
        newHeaders.delete(name)
    })


    if (tlsVersion != "TLSv1.2" && tlsVersion != "TLSv1.3") {
        return new Response("You need to use TLS version 1.2 or higher.", { status: 400 })
    } else {
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        })
    }
}
```

</details>

<details>
<summary>technicality</summary>

```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  /**
   * Respond to the request
   * @param {Request} request
   */
  async function handleRequest(request) {
  
  let modifiedHeaders = new Headers()
   
    modifiedHeaders.set('Content-Type', 'text/html')
    modifiedHeaders.append('Pragma', 'no-cache')
  
    return new Response(maintenancepage, {headers: modifiedHeaders})
  }
  let maintenancepage = `
   
  <!doctype html>
  <title>Site Maintenance</title>
  <script defer data-domain="technicality.com" data-api="/data/api/event" src="/data/js/script.js"></script>
  <style>
    body { 
          text-align: center; 
          padding: 150px; 
          background: url('https://cdn.levine.io/uploads/images/gallery/2021-07/scaled-1680-/us9bDXP8mvzQCl8f-cshong-idt3b9dzjsq-unsplash-2400x1349.jpg') no-repeat center center fixed;
          background-size: cover;
          -webkit-background-size: cover;
          -moz-background-size: cover;
          -o-background-size: cover;
        }
   
      .content {
          background-color: rgba(255, 255, 255, 0.75); 
          background-size: 100%;      
          color: inherit;
          padding: 1px 100px 10px 100px;
          border-radius: 15px;        
      }
   
    h1 { font-size: 40pt;}
    body { font: 20px IBM Plex Serif, serif; color: #333; }
    article { display: block; text-align: center; width: 75%; margin: 0 auto; }
    a:hover { color: #333; text-decoration: none; }
  </style>
 
 <article>
        <h1>Coming soon!</h1>
          <p>This page is currently unavailable as it's undergoing maintenance.</p>
          <p>Please check back soon...</p>
          <p>&mdash; <B><font color="red">{</font><B><span style="color: #000000;"><strong><a style="color: #000000;" href="mailto:contact@technicality.com">Dave</a></strong></span></B><font color="red">}</font></p>
  </article>
  `;
```

</details>

