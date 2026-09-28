---
title: "Hosting with S3, ACM, CloudFront & Cloudflare"
date: "2021-03-06T14:36:44+00:00"
description: "This will be a write-up of how I was able to host my portfolio on AWS by using S3 static website hosting, Amazon Certificate Manager \\(ACM\\), CloudFront CDN and Cloudflare for DNS."
topics:
  - aws
  - s3
  - cloudflare
ail: 0
---
# Hosting with S3, ACM, CloudFront & Cloudflare

> **Warning**
>
> This article has been deprecated as all my static websites are hosted on Cloudflare. Documentation on this can be found [here].

[here]: /cloud-computing/cloudflare/pages/cloudflare-pages/

This will be a write-up of how I was able to host my portfolio on AWS by using S3 static website hosting, Amazon Certificate Manager (ACM), CloudFront CDN and Cloudflare for DNS.

> **Note**
>
> As of this writing, my domain ([iamdavelevine.com](https://iamdavelevine.com)) resides on Namecheap as this is where it was purchased. The domain is not yet 60 days old and therefore cannot be transferred. Once 60 days has been reached, this domain will be transferred to AWS Route 53. At this point, Cloudflare will be removed as well.

### S3 Static Hosting

In order to accomplish this, I took advantage of S3 static website hosting. This allows static assets such as an HTML file to be hosted without requiring the additional complexity of having a web server.

After editing an HTML template I forked on [Github](https://github.com/davelevine/my_portfolio), the HTML file and additional assets were ready to be uploaded to S3.

> **Required Steps**
>
> - Log into AWS
> - Navigate to S3
> - Create two buckets
>     - [www.iamdavelevine.com](http://www.iamdavelevine.com) (Primary)
>     - [iamdavelevine.com](http://iamdavelevine.com) (Redirect)
> - In the Primary bucket, upload the HTML/CSS files.
> - In **Properties**, enable **Bucket Versioning** and **Default Encryption**.
> - Scroll down to **Static Website Hosting** and do the following:
>     - Set it to **Enabled**.
>     - Set **Hosting Type** to **Hosting a Static Website**.
>     - Index document should be **index.html**
>     - Save the changes.
> - Go to **Permissions** and temporarily allow all public access. This will be turned off later, but is necessary right now.
> - Add the following to **Bucket Policy:**

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::www.hranicka.cz/*"
    ]
}
```

* Scroll down to **Cross-origin resource sharing (CORS)** and add the following:

```JSON
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

> **Required Steps (continued)**
>
> - Save any changes and move into the **Redirect** bucket.
> - In the **Redirect** bucket, everything should be the same as the **Primary** bucket, except for **Static Website Hosting**. This should be set to the following:
>   - Enable static hosting.
>   - Hosting type should be set to **Redirect requests for an object**.
>   - Host name should be [**www.iamdavelevine.com**](http://www.iamdavelevine.com).
>   - Protocol should be set to **https**.
> - Save the changes.

At this point, the website should be accessible through the endpoint links, but is not yet able to be accessed through the custom domain.

### ACM

Since the static website is being redirected to https by default, a valid SSL/TLS cert will be required. This brings ACM into the mix.

* Navigate to **Certificate Manager** and request a new certificate.
* Add the applicable domain names and set the validation method to DNS.

> **Note**
>
> Domain names should be [iamdavelevine.com](https://iamdavelevine.com) & [www.iamdavelevine.com](https://www).

* Certificate Manager will provide CNAME values that will need to be added to Cloudflare DNS.

### Cloudflare

Since the domain is currently using Cloudflare Nameservers for DNS, the CNAME values provided by ACM will need to be added to Cloudflare DNS.

* Open the domain in Cloudflare and navigate to the **DNS** tab.
* Add a record and select **CNAME**.
* Add the two values provided by ACM and change the proxy status to **DNS Only**. This will bypass Cloudflare and allow for serving content exclusively through AWS.

### CloudFront

At this point, ACM should show that the CNAME values are showing **Success**. Once this is done, the certificate will be generated automatically. With this completed, CloudFront will need to be used in order to distribute content.

> **Required Steps**
>
> - Navigate to **CloudFront** and create a new distribution for the **Primary** bucket.
> - There are a number of settings, but only the following should be modified:
>     - **Origin Domain Name:** &lt;S3 Bucket Endpoint&gt;
>     - **Origin ID:** Should be auto populated.
>     - **Viewer Protocol Policy:** Redirect HTTP to HTTPS.
>     - **Alternate Domain Names:** [www.iamdavelevine.com](http://www.iamdavelevine.com)
>     - **SSL Certificate:** Custom SSL
>       - Click the empty box and select the certificate that was created in ACM.
>     - **Default Root Object**: Index.html
>     - Enter **Static Website** as the comment, then click **Create Distribution**.
> - Create a second distribution with the same settings as above, but for the **Redirect** bucket. The following should be changed from the **Primary** distribution:
>     - **Alternate Domain Names:** [iamdavelevine.com](http://iamdavelevine.com)
>     - **Default Root Object:** blank
> - Once the distributions have been deployed, another CNAME needs to be created in Cloudflare to point to the CloudFront domain name for each distribution.

Navigate back to Cloudflare and add a new CNAME for the following:

> **Abstract**
>
> - **Primary**:
>     - **Name:** www
>     - **Target:** CloudFront domain name
> - **Redirect:**
>     - **Name:** [iamdavelevine.com](http://iamdavelevine.com)
>     - **Target:** CloudFront domain name

At this point, the portfolio should be accessible through the custom domain name. The only thing left to do is secure the S3 buckets.

### S3 Bucket Policy

In order to prevent unauthorized access to either S3 bucket, we need to lock it down with a bucket policy.

* Navigate to S3 and start with the **Primary** bucket.
* Edit the **Bucket Policy** and add the following:

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "2",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity EXXXXXXXXXXXXX"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::www.iamdavelevine.com/*"
        }
    ]
}
```

* Save the changes.
* Edit **Block Public Access** and block all public access to the bucket. This is necessary since nothing in the bucket should be accessible to anything except CloudFront.
* Repeat the steps for the **Redirect** bucket, but use the following **Bucket Policy**:

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "2",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity EXXXXXXXXXXXXX"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::iamdavelevine.com/*"
        }
    ]
}
```

### Conclusion

This is a very cheap and fairly easy way to host a static website. In my case, it's perfect for hosting a portfolio. Any changes made to the HTML file can still be re-uploaded to the **Primary** S3 bucket and will automatically be distributed by CloudFront. There may be some delay with caching, but this can be done by following these [instructions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html).

### References

* [https://stackoverflow.com/a/42869783](https://stackoverflow.com/a/42869783)
* [https://stackoverflow.com/questions/22668121/creating-an-s3-bucket-policy-that-allows-access-to-cloudfront-but-restricts-acce](https://stackoverflow.com/questions/22668121/creating-an-s3-bucket-policy-that-allows-access-to-cloudfront-but-restricts-acce)
* [https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html\#example-bucket-policies-cloudfront](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html#example-bucket-policies-cloudfront)
* [https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
* [https://medium.com/@channaly/how-to-host-static-website-with-https-using-amazon-s3-251434490c59](https://medium.com/@channaly/how-to-host-static-website-with-https-using-amazon-s3-251434490c59)
* [https://medium.com/@hranicka/hosting-a-static-website-amazon-s3-cloudflare-127b57a13461](https://medium.com/@hranicka/hosting-a-static-website-amazon-s3-cloudflare-127b57a13461)
* [https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html)


