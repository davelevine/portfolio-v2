---
title: "How to Use a Root Domain as a CNAME for UptimeRobot"
date: "2021-07-04T19:09:17-04:00"
description: "I recently bought the status.cc domain to use for my UptimeRobot dashboard. Uptime Robot allows for utilizing a custom domain for the status page instead of their more generic url. As great as this has been for me, I've only ever used it with subdomains."
topics:
  - cloudflare
ail: 0
---
I recently bought the [status.cc] domain to use for my UptimeRobot dashboard. Uptime Robot allows for utilizing a custom domain for the status page instead of their more [generic url]. As great as this has been for me, I've only ever used it with subdomains.

Having a domain such as [status.cc] speaks for itself, so having a subdomain like [status.status.cc] doesn't make any sense. This is problematic, however, because a limitation of UptimeRobot's custom domain service is that it's limited to subdomains.

To work around this, I was able to prefix the domain with `www` to get around this limitation. This solved the subdomain problem, but would normally require explicitly typing [www.status.cc], which is a bit annoying in a modern setting. To get around this, I added a permanent redirect to automatically redirect so that [status.cc] automatically becomes [www.status.cc].

[status.cc]: https://status.cc
[generic url]: https://stats.uptimerobot.com/rYO3jsvYJ
[status.status.cc]: https://status.status.cc
[www.status.cc]: https://www.status.cc

## How-To

In order to accomplish this, I needed to do the following:

### UptimeRobot

* Log into UptimeRobot and select **Status Pages**.
* In **Custom Domain**, input `www.status.cc`.
* Save the new custom domain.

### Cloudflare

* Log into Cloudflare and navigate to the `status.cc` domain.
* Open **DNS** and add the following two records:

| Type  | Name      | Content               | TTL  | Proxy status |
|:-----:|:---------:|:---------------------:|:----:|:------------:|
| CNAME | status.cc | www.status.cc         | Auto | Proxied      |
| CNAME | www       | stats.uptimerobot.com | Auto | Proxied      |

* Configure the remaining Cloudflare settings as per usual.

## Outcome

At this point, navigating to <https://status.cc> should automatically redirect to <https://www.status.cc>, which works around the subdomain requirement by making `www` the subdomain.

## References

* <https://replit.com/talk/learn/How-to-use-a-custom-domain/8834?order=votes>

    Search the page for `root domains`, which brings up the appropriate result. Should the page ever get removed for any reason, the post text is as follows:

    > Since CNAME doesn't support root domains, you will have to change the name in Freenom to www. Then, when you're linking the domain on repl.it, type in www.cma-chat.cf. It should work then.

* <https://blog.uptimerobot.com/introducing-public-status-pages-yay/#create-custom-domain>


