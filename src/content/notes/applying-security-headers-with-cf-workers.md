---
title: "Applying Security Headers with Cloudflare Workers"
date: "2022-03-20T23:41:23-04:00"
description: "HTTP security headers are a fundamental part of website security. Upon implementation, they protect you against the types of attacks that your site is most likely to come across. These headers can protect against attacks such as cross site scripting (XSS), code injection, clickjacking, etc."
topics:
  - cloudflare
  - workers
ail: 0
---
HTTP security headers are a fundamental part of website security. Upon implementation, they protect you against the types of attacks that your site is most likely to come across. These headers can protect against attacks such as cross site scripting (XSS), code injection, clickjacking, etc.

Putting them into practice, however, is not always easy. Depending on what application or server configuration you're working with, it may not even be possible to deploy security headers.

Scott Helme summarizes the difficulty of deploying security headers in the following quote from his [blog](https://scotthelme.co.uk/security-headers-cloudflare-worker/):

> **Quote**
>
> To set a security header on one of your responses you generally need to be able to access server configuration or possibly application code to insert it from there. These are levels of access that are not always available to you on certain hosting platforms. Take [Ghost Pro](https://ghost.org/), where my blog is hosted, or [GitHub Pages](https://pages.github.com/) as great examples. On these platforms, and many others like them, you only get to control the HTML content of pages you serve which is just fine for many, but it does make it impossible to deploy security headers.

In order to work around this, we can leverage [Cloudflare Workers](https://workers.cloudflare.com). Because Workers allows you to deploy and run code, you can leverage it to apply custom processing to requests and responses to your site.

## Security Headers

There are a number of ways that security headers can be deployed to your website. Cloudflare has an [example template](https://developers.cloudflare.com/workers/examples/security-headers/) that can be used to modify headers accordingly. This is a great starter template and can be leveraged for your site.

However, it should be noted that this can be a restrictive policy because it may restrict elements of your website or application from loading. In my testing, certain CSS elements would not load due to having a Content Security Policy that was a bit too restrictive.

In order to get around this, I had to modify the Content Security Policy to include `unsafe-eval` and `unsafe-inline` values. This may or may not work for your situation. The [Security Headers](https://securityheaders.com) website will cap your score at an `A` regardless of what the rest of your policy is set to. Scott Helme has a good [article](https://scotthelme.co.uk/can-you-get-pwned-with-css/) on the limitations of not including `unsafe-eval` and `unsafe-inline` in your Content Security Policy.

## In Practice

I tried applying two different Content Security Policies to my [search engine](https://search.cc). The Cloudflare example template included the `unsafe-eval` and `unsafe-inline` values while Scott Helme's didn't. The Cloudflare example template ended up capping me at an `A` on [securityheaders.com](https://securityheaders.com), which was expected. Scott Helme's did not include these values and allowed me to achieve an `A+`.

The complete headers can be found below. Details on setting up the Worker can be found on Scott Helme's [blog post](https://scotthelme.co.uk/security-headers-cloudflare-worker/).

## Templates

<details>
<summary>Cloudflare Template</summary>

```javascript
const DEFAULT_SECURITY_HEADERS = {
  /*
    Secure your application with Content-Security-Policy headers.
    Enabling these headers will permit content from a trusted domain and all its subdomains.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    */
    "Content-Security-Policy": "default-src * 'unsafe-eval' 'unsafe-inline' https://search.cc",

  /*
    You can also set Strict-Transport-Security headers.
    These are not automatically set because your website might get added to Chrome's HSTS preload list.
    Here's the code if you want to apply it:
    */
    "Strict-Transport-Security" : "max-age=63072000; includeSubDomains; preload",
  /*
    Permissions-Policy header provides the ability to allow or deny the use of browser features, such as opting out of FLoC - which you can use below:
  */
    "Permissions-Policy": "interest-cohort=()",
  /*
    X-XSS-Protection header prevents a page from loading if an XSS attack is detected.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
    */
  'X-XSS-Protection': '0',
  /*
    X-Frame-Options header prevents click-jacking attacks.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
    */
  'X-Frame-Options': 'DENY',
  /*
    X-Content-Type-Options header prevents MIME-sniffing.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
    */
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp; report-to="default";',
  'Cross-Origin-Opener-Policy': 'same-site; report-to="default";',
  'Cross-Origin-Resource-Policy': 'same-site',
};
const BLOCKED_HEADERS = ['Public-Key-Pins', 'X-Powered-By', 'X-AspNet-Version'];
addEventListener('fetch', event => {
  event.respondWith(addHeaders(event.request));
});
async function addHeaders(req) {
  let response = await fetch(req);
  let newHeaders = new Headers(response.headers);

  const tlsVersion = req.cf.tlsVersion;
  // This sets the headers for HTML responses:
  if (newHeaders.has('Content-Type') && !newHeaders.get('Content-Type').includes('text/html')) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  Object.keys(DEFAULT_SECURITY_HEADERS).map(function (name) {
    newHeaders.set(name, DEFAULT_SECURITY_HEADERS[name]);
  });

  BLOCKED_HEADERS.forEach(function (name) {
    newHeaders.delete(name);
  });

  if (tlsVersion !== 'TLSv1.2' && tlsVersion !== 'TLSv1.3') {
    return new Response('You need to use TLS version 1.2 or higher.', { status: 400 });
  } else {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
}
```

</details>

<details>
<summary>Scott Helme's Template</summary>

```javascript
const securityHeaders = {
        "Content-Security-Policy": "upgrade-insecure-requests",
        "Strict-Transport-Security": "max-age=1000",
        "X-Xss-Protection": "1; mode=block",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        'Cross-Origin-Embedder-Policy': 'require-corp; report-to="default";',
        'Cross-Origin-Opener-Policy': 'same-site; report-to="default";',
        'Cross-Origin-Resource-Policy': 'same-site',
        "Permissions-Policy": "interest-cohort=()",
    },
    sanitiseHeaders = {
        Server: ""
    },
    removeHeaders = [
        "Public-Key-Pins",
        "X-Powered-By",
        "X-AspNet-Version"
    ];

async function addHeaders(req) {
    const response = await fetch(req),
        newHeaders = new Headers(response.headers),
        setHeaders = Object.assign({}, securityHeaders, sanitiseHeaders);

    if (newHeaders.has("Content-Type") && !newHeaders.get("Content-Type").includes("text/html")) {
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    Object.keys(setHeaders).forEach(name => newHeaders.set(name, setHeaders[name]));

    removeHeaders.forEach(name => newHeaders.delete(name));

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

addEventListener("fetch", event => event.respondWith(addHeaders(event.request)));
```

</details>

## Verdict

Whether or not you decide to use security headers is entirely up to you and your situation. While it's definitely best practice to include them whenever possible, it may be more practical to include only certain headers.

For my use case, I decided to use Scott Helme's template. So far, I've seen no downside to using it. There were no performance hits or any unintended consequences in my testing. Give it a try and see what works for you.

## References

* <https://scotthelme.co.uk/security-headers-cloudflare-worker/>
* <https://github.com/securityheaders/security-headers-cloudflare-worker>
* <https://content-security-policy.com/>
* <https://owasp.org/www-project-secure-headers/>
* <https://developers.cloudflare.com/workers/examples/security-headers/>
* <https://scotthelme.co.uk/can-you-get-pwned-with-css/>
* <https://web.dev/security-headers/>


