---
title: "Cloudflare Workers Parking Page"
date: "2021-07-09T15:14:35-04:00"
description: "The following HTML template is being used with Cloudflare Workers to display a domain parking page as needed. The domains that are currently using it are:"
topics:
  - cloudflare
  - workers
ail: 0
---
The following HTML template is being used with Cloudflare Workers to display a domain parking page as needed. The domains that are currently using it are:

* [encoded.org](https://encoded.org)
* [haroldsauto.com](https://haroldsauto.com)
* [technicality.com](https://technicality.com)

> **Info**
>
> The `technicality.com` domain is using an almost identical parking page except that it contains an additional line in the script for Plausible tracking.

## Parking Page

```html
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
          background: url('https://cdn.levine.io/uploads/images/gallery/2021-07/scaled-1680-/7nCMOz3XHSWkoz7T-senja-death-star.jpg') no-repeat center center fixed; 
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
    body { font: 20px Helvetica, sans-serif; color: #333; }
    article { display: block; text-align: left; width: 75%; margin: 0 auto; }
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

## Reference

* <https://technicalramblings.com/blog/how-to-setup-a-cloudflare-worker-to-show-a-maintenance-page-when-ca-backup-plugin-is-running/>
* <https://www.resdevops.com/2018/03/20/cloudflare-workers-maintenance-mode-static-page/>
* <https://developers.cloudflare.com/workers/examples/return-html>
* <http://webredir.vip.gandi.net/>
* <https://developers.cloudflare.com/workers/examples/return-html>


