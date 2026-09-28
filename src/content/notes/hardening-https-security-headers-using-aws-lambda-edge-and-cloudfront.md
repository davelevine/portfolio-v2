---
title: "Hardening HTTPS Security Headers using AWS Lambda@Edge and CloudFront"
date: "2021-03-06T14:36:44+00:00"
description: "By default, hosting a static website in S3, using CloudFront as a CDN and using an AWS SSL/TLS cert does not automatically add security headers. This can be accomplished by using Lambda@Edge."
topics:
  - aws
  - cloudfront
  - lambda
ail: 0
---
By default, hosting a static website in S3, using CloudFront as a CDN and using an AWS SSL/TLS cert does not automatically add security headers. This can be accomplished by using Lambda@Edge.

### Getting Started

Prior to adding security headers to a site, if you were to check the site's posturing on [securityheaders.com], you'd find that the site will categorically receive an F rating. It will automatically check for the following security headers:

* *X-Content-Type-Options;*
* *Content-Security-Policy;*
* *X-Frame-Options;*
* *X-XSS-Protection;*
* *Referrer-Policy;*
* *Feature-Policy;*

This won't make the site bulletproof by any means, but it will prevent it from a whole lot of abuse.

### Implementation

The following is taken from an article on this topic I found on Medium:

During the lifecycle of a http request/ response, CloudFront dispatches **four** **events:**

1. Viewer Request_Allows to execute code when CloudFront receives a http request from a viewer. The trigger of this event occurs before processing the request itself._
2. Viewer Response_Allows to execute code immediately before returning the response object to the viewer._
3. Origin Request_Triggered when CloudFront forwards a request to the Origin. If the requested object is in the edge cache already, no code execution occurs._
4. Origin Response_Dispatched right after CloudFront gets a response from the Origin and before the object is cached in the response._

These four events can be hooked and associated to **Lambda@Edge,** an extension of AWS Lambda, that lets you execute functions to customize the content CloudFront delivers. You can author Lambda@Edge functions in one region, **US-East-1** (*N. Virginia*), and then execute them globally.

### Lambda@Edge

Lambda@Edge runs within the traditional Lambda section of AWS. Once in this section, do the following:

* Create a new function
* Select **Use a Blueprint** and then filter for the **CloudFront** blueprints.
* Choose the **cloudfront-modify-response-header** blueprint as the template for the function.
* Give it a name and set the **Execution Role** to **Create a new role from AWS policy templates.** This allows for using the recommended AWS policy template.
* Enter a role name - I named mine **iamdavelevine.com-lambda**.
* Lambda automatically adds the policy template **Basic Edge Lambda permissions** because I chose a **CloudFront blueprint** as the basis for the function. This policy template adds execution role permissions that allow CloudFront to run the Lambda function.
* Create the function.
* Once in the **Designer** section, select the function name and scroll down to the function code.
* The template can be replaced by one of two templates; one from the AWS docs and one from a Medium article I found. Both will get the job done, although the Medium template is more comprehensive:

#### AWS Template

```nginx
'use strict';
exports.handler = (event, context, callback) => {

    //Get contents of response
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    //Set new headers
    headers['strict-transport-security'] = [{key: 'Strict-Transport-Security', value: 'max-age= 63072000; includeSubdomains; preload'}];
    headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"}];
    headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}];
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}];
    headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}];
    headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}];

    //Return modified response
    callback(null, response);
};
```

#### Medium Template

```nginx
'use strict';

exports.handler = async (event, context, callback) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

    headers['Strict-Transport-Security'] = [{
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    }];

    headers['X-XSS-Protection'] = [{
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    }];

    headers['X-Content-Type-Options'] = [{
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    }];

    headers['X-Frame-Options'] = [{
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    }];

    headers['Referrer-Policy'] = [{ key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' }];

    headers['Content-Security-Policy'] = [{
        key: 'Content-Security-Policy',
        value: 'upgrade-insecure-requests;',
    }];

    // Craft the Feature Policy params based on your needs.
    // The settings below are very restrictive and might produce undesiderable results
    headers['Feature-Policy'] = [{
        key: 'Feature-Policy',
        value: 'geolocation none; midi none; notifications none; push none; sync-xhr none; microphone none; camera none; magnetometer none; gyroscope none; speaker self; vibrate none; fullscreen self; payment none;',
    }];

    // The Expect-CT header is still experimental. Uncomment the code only if you have a report-uri
    // You may refer to report-uri.com to setup an account and set your own URI
    // headers['Expect-CT'] = [{
    //     key: 'Expect-CT',
    //     value: 'max-age=86400, enforce, report-uri="https://{{ your_subdomain }}report-uri.com/r/d/ct/enforce'",
    // }];
    callback(null, response);
};
```

* Since I chose the Medium template, the original template code can be replaced with the Medium template.
* Select **Save** to update the code.

### Adding a CloudFront Trigger

At this point, the code is ready to go, but it won't be executed once a request is made to the CloudFront distribution. Because the AWS docs really capture it well, the following is taken from them:

* In the **Designer** section of the page, choose **CloudFront.**
* Scroll down to the **Configure triggers** section of the page, then choose **Deploy to Lambda@Edge**.
* On the Deploy to Lambda@Edge page, under Configure CloudFront trigger, enter the following information:

#### Distribution

* The CloudFront distribution ID to associate with the function. In the drop-down list, choose the distribution ID.

#### Cache behavior

* The cache behavior to use with the trigger. For this example, leave the value set to *, which means the distribution’s default cache behavior.

#### CloudFront event

* The trigger that specifies when the function runs. The security headers function should run whenever CloudFront returns a response from the origin. So in the drop-down list, choose Origin response.

* Under **Confirm deploy to Lambda@Edge**, select the check box.
* Select **Deploy** and wait for the function to replicate. This can be verified by going to CloudFront and waiting until the distribution(s) change from **In Progress** to **Deployed**.

### Confirmation

Once this has been completed, the easiest way to verify the headers are in place is to go to [securityheaders.com] and enter the domain name. Mine came back with an **'A'** rating, which is fine since I didn't add a permissions policy to the template. Additionally, the Lambda monitoring dashboard can be checked to confirm the functions are being invoked.

[securityheaders.com]: http://securityheaders.com

### References

* [https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html)
* [https://medium.com/faun/hardening-the-http-security-headers-with-aws-lambda-edge-and-cloudfront-2e2da1ae4d83](https://medium.com/faun/hardening-the-http-security-headers-with-aws-lambda-edge-and-cloudfront-2e2da1ae4d83)
* [https://stackoverflow.com/questions/51002710/how-to-restrict-cloudfront-access-to-my-domain-only](https://stackoverflow.com/questions/51002710/how-to-restrict-cloudfront-access-to-my-domain-only)


