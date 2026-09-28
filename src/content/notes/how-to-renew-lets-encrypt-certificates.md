---
title: "How to Renew Let's Encrypt Certificates"
date: "2021-03-06T16:34:06+00:00"
description: "Let's Encrypt certificates are issued on an Ad hoc basis and are valid for 90 days. This can be batched via Cron to auto-renew every 90 days, although it can be done manually if need be."
topics:
  - networking
  - pfsense
ail: 0
---
Let's Encrypt certificates are issued on an Ad hoc basis and are valid for 90 days. This can be batched via Cron to auto-renew every 90 days, although it can be done manually if need be.

### Renewal

> **Abstract**
>
> - Log into [pfSense](https://pfsense.example.com) and navigate to **Service --&gt; Acme Certificates**
> - The **Certificates** page has all pertinent information related to each respective certificate.
> - There are two separate certificates to renew:
>   - **pfSense**
>     - Click on the **Issue/Renew** button to automatically generate a new certificate.
>     - Since the certificate is already in place within **Cert. Manager**, there is nothing further to do.
>   - **Diskstation (NAS)**
>     - Click on the **Issue** button.
>       - ******If this was the first time clicking this button, a string of text will be generated that will need to be added in a **TXT record** with the DDNS provider (NoIP).******
>     - Click the **Renew** button and a new certificate will automatically be generated.
>     - Since the certificate is already in place within **Cert. Manager**, there is nothing further to do.

### Cron

As mentioned earlier in the post, this can be batched to auto-renew every 90 days by using Cron.

> **Note**
>
> This will create a Cron job to automatically renew certificates each day at 3:16am.

* Navigate to **Services --&gt;** **Acme Certificates** and click **General**.
* Check the box for **Cron Entry**.

This can be verified in **Services --&gt; Cron** under **Cron Schedules**.


