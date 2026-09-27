---
title: "How to Redirect Domains Using Cloudflare Workers"
date: "2021-05-08T09:38:53-04:00"
description: "Redirecting requests from one domain to another is something I would normally accomplish by way of nginx, however, this is something I can't make use of with Cloudflare Pages (Jamstack). Most of my domains with a static site would use a **Page Rule** to accomplish this. This involves creating a Forwarding Rule to create a 301 redirect from one domain to another."
topics:
  - cloudflare
  - workers
ail: 0
---
Redirecting requests from one domain to another is something I would normally accomplish by way of nginx, however, this is something I can't make use of with Cloudflare Pages (Jamstack). Most of my domains with a static site would use a **Page Rule** to accomplish this. This involves creating a Forwarding Rule to create a 301 redirect from one domain to another.

The problem comes in when you exceed 3 redirects. I only need one more so buying additional redirects in blocks of five at $5 per block isn't worth it.

To get around this, I made use of Cloudflare Workers.

Cloudflare Workers is a serverless environment used to augment an existing environment by running scripts as needed. Cloudflare gives a generous 100,000 runs per day (at the time of this writing) which is more than enough for my needs.

My example will be redirecting traffic from a non-www domain (<https://levine.org>) to a www domain (<https://docs.levine.org>).

## Cloudflare Workers

* Open the **levine.org** site in Cloudflare dashboard.
* Go to the **Workers** tab.
* Click **Manage Workers** -> **Create a Worker**
* Delete the existing demo script and add the following code:

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

* To test it's working properly, click the **Send** button for the Workers domain. It should generate the following:

```properties
301 Moved Permanently

content-length:
    0
location:
    https://docs.levine.org/
```

* Once completed, all previous steps should result in the following:

![x5kJTmUspEa3OYwj-screen-shot-2021-05-08-at-9-20-23-am.png](https://cdn.levine.io/uploads/images/gallery/2021-05/x5kJTmUspEa3OYwj-screen-shot-2021-05-08-at-9-20-23-am.png)

* Once confirmed, navigate back to the **Workers** tab within the **levine.org** site.
* Click **Add Route**

![eOWq10uqAyBxkJ46-screen-shot-2021-05-08-at-9-22-20-am.png](https://cdn.levine.io/uploads/images/gallery/2021-05/eOWq10uqAyBxkJ46-screen-shot-2021-05-08-at-9-22-20-am.png)

* Set the route to `levine.org/*`
* Select the worker created in the previous steps.
* Click **Save**

## Resources

* <https://stackoverflow.com/questions/64766046/redirect-from-one-domain-to-another-in-cloudflare-workers-does-not-work>
* <https://developers.cloudflare.com/workers/examples/redirect>


