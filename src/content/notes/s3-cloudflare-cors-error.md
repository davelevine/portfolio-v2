---
title: "How to Resolve S3 Access-Control-Allow-Origin Header Error"
date: "2021-03-19T21:43:10-04:00"
description: "This will be a copy/paste article on how to allow Cloudflare Analytics to work properly when used with a static website hosted in S3. Although the article does not reference Cloudflare specifically, the solution does allow Cloudflare Analytics to work properly once implemented."
topics:
  - aws
  - s3
  - cloudflare
ail: 0
---
This will be a copy/paste article on how to allow Cloudflare Analytics to work properly when used with a static website hosted in S3. Although the article does not reference Cloudflare specifically, the solution does allow Cloudflare Analytics to work properly once implemented.

## CORS

If you're trying to publicly distribute files from an Amazon S3 bucket, you may have come across this error in the past:

>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at your-s3-bucket.com. (Reason: CORS request did not succeed).

In the new (2020) S3 interface/dashboard, you need to write the header as a JSON. This code will fix the S3 Access-Control-Allow-Origin Header, allowing for GET requests from any domain.

```JSON
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

This code is placed in the Cross-origin resource sharing (CORS) section of the permissions tab for your specific bucket. On the dashboard, it would look like this:

![ae74b590-image.png](https://cdn.levine.io/uploads/images/gallery/2021-03/scaled-1680-/AaNdvFostpa52G8r-ae74b590-image.png)

## Reference

<https://isotropic.co/fix-aws-s3-access-control-allow-origin-header-error>


