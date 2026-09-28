---
title: "Cloudflare Workers Parking Page with Analytics"
date: "2021-07-29T22:31:01-04:00"
description: "I purchased the domain technicality.com, although I currently don't have anything to serve on it. Because of this, I'm currently parking the domain. With the domain being hosted on Cloudflare, I want to serve the parking page, but I'm curious to know if such a domain would log any traffic. While doing this is not difficult, I wouldn't be able to add the tracking snippet to a header as the parking page is being served through Workers."
topics:
  - cloudflare
  - workers
  - plausible
ail: 0
---
I purchased the domain [technicality.com](https://technicality.com), although I currently don't have anything to serve on it. Because of this, I'm currently parking the domain. With the domain being hosted on Cloudflare, I want to serve the parking page, but I'm curious to know if such a domain would log any traffic. While doing this is not difficult, I wouldn't be able to add the tracking snippet to a header as the parking page is being served through Workers.

## Workers

Due to this, I created a new script with minor tweaks for this site compared to the domains on my other parking page. The script is as follows:

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
    body { font: 20px Helvetica, sans-serif; color: #333; }
    article { display: block; text-align: left; width: 75%; margin: 0 auto; }
    a:hover { color: #333; text-decoration: none; }
  </style>
 
 <article> 
        <h1>We&rsquo;ll be back soon!</h1>
          <p>This page is currently unavailable as it's undergoing maintenance.</p>
          <p>Please check back soon...</p>
          <p>You can use <span style="color: #000000;"><strong><a style="color: #000000;" href="https://cachedview.com/">https://cachedview.com/</a></strong></span> in the mean time.</p>
          <p>&mdash; <B><font color="red">{</font><B><span style="color: #000000;"><strong><a style="color: #000000;" href="mailto:contact@technicality.com">Dave</a></strong></span></B><font color="red">}</font></p>
  </article>
  `;
```

Once the script was created, I did the following to enable it:

* Open the `technicality.com` domain
* Select **Workers**
* Select **Add Route**
* Set the route to `www.technicality.com` and select the **technicality** Worker.

This allowed for the parking page to be enabled. The next step was to enable Plausible Analytics.

## Plausible Analytics

Since the Plausible Workers script already exists, it was simply a matter of applying the script to the `technicality.com` domain.

* Open the `technicality.com` domain
* Select **Workers**
* Select **Add Route**
* Set the route to `*.technicality.com/data/*` and select the **plausible** Worker.

Once completed, add the domain to [plausible.io](https://plausible.io).


