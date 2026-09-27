---
title: "How to Check SSL Validity of Cloudflare Domain"
date: "2021-03-06T15:08:08+00:00"
description: "This article will list the appropriate command to check the validity of an SSL certificate applied to a Cloudflare domain."
topics:
  - cloudflare
ail: 0
---
This article will list the appropriate command to check the validity of an SSL certificate applied to a Cloudflare domain.

### Syntax

```shell
~ curl -vso /dev/null https://davelevine.io/
```

```shell
*   Trying 2606:4700:30::681b:a20f...
* TCP_NODELAY set
* Connected to davelevine.io (2606:4700:30::681b:a20f) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/cert.pem
  CApath: none
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
} [222 bytes data]
* TLSv1.2 (IN), TLS handshake, Server hello (2):
{ [100 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [2188 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [116 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [37 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Client hello (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Client hello (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-ECDSA-CHACHA20-POLY1305
* ALPN, server accepted to use h2
* Server certificate:
*  subject: C=US; ST=CA; L=San Francisco; O=Cloudflare, Inc.; CN=davelevine.io
*  start date: Oct 26 00:00:00 2019 GMT
*  expire date: Oct  9 12:00:00 2020 GMT
*  subjectAltName: host "davelevine.io" matched cert's "davelevine.io"
*  issuer: C=US; ST=CA; L=San Francisco; O=CloudFlare, Inc.; CN=CloudFlare Inc ECC CA-2
*  SSL certificate verify ok.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle 0x7f8edc804400)
> GET / HTTP/2
> Host: davelevine.io
> User-Agent: curl/7.54.0
> Accept: */*
> 
* Connection state changed (MAX_CONCURRENT_STREAMS updated)!
< HTTP/2 520 
< date: Thu, 31 Oct 2019 12:58:55 GMT
< content-type: text/html; charset=UTF-8
< set-cookie: __cfduid=d77ae4db5c790c4f8a69a00dad923d6a81572526735; expires=Fri, 30-Oct-20 12:58:55 GMT; path=/; domain=.davelevine.io; HttpOnly; Secure
< cache-control: no-store, no-cache
< cf-cache-status: DYNAMIC
< strict-transport-security: max-age=15552000; includeSubDomains; preload
< x-content-type-options: nosniff
< alt-svc: h3-23=":443"; ma=86400
< expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
< set-cookie: cf_ob_info=520:52e5cd9e2af9bd21:PHL; path=/; expires=Thu, 31-Oct-19 12:59:25 GMT
< set-cookie: cf_use_ob=443; path=/; expires=Thu, 31-Oct-19 12:59:25 GMT
< expires: Thu, 01 Jan 1970 00:00:01 GMT
< cache-control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
< pragma: no-cache
< server: cloudflare
< cf-ray: 52e5cd9e2af9bd21-PHL
< 
{ [782 bytes data]
* Connection #0 to host davelevine.io left intact
```


