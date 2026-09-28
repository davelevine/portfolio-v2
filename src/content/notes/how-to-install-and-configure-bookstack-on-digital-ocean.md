---
title: "How to Install & Configure Bookstack on DigitalOcean"
date: "2021-03-06T15:54:44+00:00"
description: "This article will describe how to install Bookstack hosted on Digital Ocean, as well as the configuration needed to install an origin certificate for the web server."
topics:
  - digitalocean
  - bookstack
  - docker
ail: 0
---
# How to Install & Configure Bookstack on DigitalOcean

This article will describe how to install Bookstack hosted on Digital Ocean, as well as the configuration needed to install an origin certificate for the web server.

### Hosting on Digital Ocean

Log into Digital Ocean and create a new Droplet. Instructions on how to do this can be found at the following link:

[https://www.digitalocean.com/docs/droplets/how-to/create/](https://www.digitalocean.com/docs/droplets/how-to/create/)

In this example, the Droplet used was the $10/month Standard Droplet. This provides the following:

* 2GB / 1 CPU
* 50GB / SSD
* 2000GB / Transfer

The new Droplet will be given a public IP address. This will allow for accessing the Droplet via SSH.

The default SSH port has been changed to <port>. The new syntax for logging in via SSH is `ssh <user>@203.0.113.10 -p <port>`.

### Install Bookstack

For the purposes of my setup, I installed Bookstack using the Ubuntu 16.04 script, simply because I'm more familiar with NGINX than Apache.

* Log into the Ubuntu Droplet via SSH as either the Root user, or any other user with Sudo permissions.
* Once logged in via SSH, run the following commands as Root:

```shell
# Ensure you have read the above information about what this script does before executing these commands.

# Download the script
wget https://raw.githubusercontent.com/BookStackApp/devops/master/scripts/installation-ubuntu-16.04.sh

# Make it executable
chmod a+x installation-ubuntu-16.04.sh

# Run the script with admin permissions
sudo ./installation-ubuntu-16.04.sh
```

* The script will prompt for the domain to be used. This information will be configured during the automated setup of NGINX. For my use, I used levine.xyz
* Let the script finish running. Once finished, it will display the default login credentials for Bookstack, along with the link to access Bookstack.

When I ran the script, I was only provided a link with the public IP address and not the domain I provided. This didn't affect my ability to access Bookstack via the provided domain, but I did have errors with the web server because of the way SSL is configured for the domain by way of Cloudflare.

### Configure Proxy

Although the Droplet is hosted on Digital Ocean, the domain is registered to Cloudflare. In order to use them both in conjunction with one another, the Droplet will need to be proxied accordingly.

* Make note of the public IP address provided by Digital Ocean, as it will be needed in order to proxy on Cloudflare.
* Log into Cloudflare and navigate to the DNS panel.
* Add the following:

| **Type** | **Name** | **Content** | **TTL** | **Proxy Status** |
| :---: | :---: | :---: | :---: | :---: |
| A | levine.xyz | 203.0.113.20 | Auto | Proxied |

* Make note of the Cloudflare Nameservers, as they'll need to be provided to Digital Ocean.

| **Type** | **Value** |
| :---: | :---: |
| NS | mitch.ns.cloudflare.com |
| NS | tara.ns.cloudflare.com |

* Navigate back to Digital Ocean, select the Droplet and select **Add a Domain**.
* Add levine.xyz and select **Add**.
* Select **Manage Domain** and make note of the Nameservers automatically added to the domain.
* Edit each Nameserver and add the Cloudflare Nameservers to each entry.
* Delete the 3rd Nameserver since there are only two Cloudflare Nameservers.
* The **DNS Records** for the domain should now look like the following:

| Type | Hostname | Value | TTL (in seconds) |
| :---: | :---: | :---: | :---: |
| NS | levine.xyz | mitch.ns.cloudflare.com | 1800 |
| NS | levine.xyz | tara.ns.cloudflare.com | 1800 |

* The domain will now be proxied accordingly, but will still be accessible because SSL has not yet been configured on the web server.

### Cloudflare Origin Server Configuration

In order to configure the web server to allow SSL, an origin certificate will be needed from Cloudflare.

* Navigate to Cloudflare and select the **SSL/TLS** panel, then select **Origin Server**.
* Create an **Origin Certificate.**
* Select **Let Cloudflare Generate a Private Key and a CSR**.
* Set the **Private Key Type** to **ECDSA**.
* Leave the default hostnames, and set the **Certificate Validity** accordingly.
  * In my setup, I left the Certificate Validity at the default of 15 years.
* Select **Next** and allow the certificates to generate.

Make sure **NOT** to close the certificate information until the private key has been entered into a configuration file. The private key will not be able to be obtained again if the window is closed, and a new certificate will need to be generated.

### NGINX Configuration

SSH into the Droplet as Root in order to update the NGINX configuration with the Cloudflare Origin Server certificate information.

```shell
# SSH into the Droplet as Root

DavesMBP% ssh do-docker

Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-165-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

0 packages can be updated.
0 updates are security updates.

New release '18.04.3 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


Last login: Sat Oct 19 23:50:42 2019 from 198.51.100.7
root@docker-s-2vcpu-4gb-nyc1-01:~# cd /etc/nginx/

# Make a new directory for the SSL certificates

root@docker-s-2vcpu-4gb-nyc1-01:~# mkdir /etc/nginx/ssl

# Create the certificate file (.pem)

root@docker-s-2vcpu-4gb-nyc1-01:~# nano levine.xyz.pem
```

```properties
-----BEGIN CERTIFICATE-----
<redacted>
-----END CERTIFICATE-----
```

```shell
# Create the private key (.key)

root@docker-s-2vcpu-4gb-nyc1-01:~# nano levine.xyz.key
```

```properties
-----BEGIN PRIVATE KEY-----
<redacted>
-----END PRIVATE KEY-----
```

```shell
# Edit the NGINX host file for Bookstack

root@docker-s-2vcpu-4gb-nyc1-01:/etc/nginx/ssl# cd /etc/nginx/sites-available/
root@docker-s-2vcpu-4gb-nyc1-01:/etc/nginx/sites-available# nano bookstack

# The Bookstack host file should look as follows:
```

```nginx
fastcgi_cache_path /var/cache/nginx/bookstack/ levels=1:2 keys_zone=bookstack:100m inactive=24h;

server {
        listen 80;
        listen [::]:80;
        listen 443;

        server_name levine.xyz;

        ssl on;
        ssl_certificate     /etc/nginx/ssl/levine.xyz.pem;
        ssl_certificate_key /etc/nginx/ssl/levine.xyz.key;
        ssl_client_certificate  /etc/nginx/ssl/origin-pull-ca.pem;
        ssl_verify_client on;

        client_max_body_size 50m;

        root home/<user>/.config/appdata/bookstack/www;
        index index.php index.html index.htm;

        # Security Headers
                add_header X-Frame-Options SAMEORIGIN always;
                add_header X-XSS-Protection "1; mode=block" always;
                add_header X-Content-Type-Options nosniff always;
                add_header Referrer-Policy "no-referrer" always;
                add_header Feature-Policy strict-origin-when-cross-origin;
                add_header hide_server_tokens on;
                add_header Content-Security-Policy "default-src * data: 'unsafe-eval' 'unsafe-inline'" always;
                add_header X-Download-Options "noopen" always;
                add_header X-Permitted-Cross-Domain-Policies "none" always;
                add_header X-Robots-Tag "none" always;

        # Remove X-Powered-By, which is an information leak
                fastcgi_hide_header X-Powered-By;

        location / {
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header Host $http_host;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $connection_upgrade;
                proxy_pass http://127.0.0.1:6875;
                proxy_buffering off;
        }

          location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/var/run/php/php-fpm.sock;
                include fastcgi_params;
                fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;

        # Remove cookies which are useless for anonymous visitor and prevent caching
                fastcgi_ignore_headers Set-Cookie;
                fastcgi_ignore_headers Cache-Control;
                # proxy_hide_header Set-Cookie;
        # Add header for cache status (miss or hit)
                add_header X-Cache-Status $upstream_cache_status;
        # Add test header for cache control
                add_header Cache-Control "Public";
                expires 1y;

        fastcgi_cache bookstack;
        # Default TTL: 1 day
        fastcgi_cache_valid 200 60m;
        # Cache 404 pages for 1h
        fastcgi_cache_valid 404 1h;
        # use conditional GET requests to refresh the content from origin servers
        fastcgi_cache_revalidate on;
        proxy_buffering on;
        # Allows starting a background subrequest to update an expired cache item,
        # while a stale cached response is returned to the client.
        fastcgi_cache_background_update on;
        # Bypass cache for errors
        # fastcgi_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504;
        }

        location ~ ^/(bookstack/|p/)/ {
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto https;
                proxy_pass http://127.0.0.1:6875;
        }
}
```

```shell
# Check the NGINX config file and reload NGINX

root@docker-s-2vcpu-4gb-nyc1-01:/etc/nginx/sites-available# nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
root@docker-s-2vcpu-4gb-nyc1-01:/etc/nginx/sites-available# service nginx reload
```

Once NGINX has been reloaded, navigate to [levine.xyz](https://levine.xyz)[](https://levine.xyz) and confirm that the page loads properly with SSL/TLS.

## Configuration (.env file)

<details>
<summary>.env</summary>

```properties
# Application key
# Used for encryption where needed.
# Run `php artisan key:generate` to generate a valid key.
APP_KEY=REDACTED

# Application Timezone
# Changed from UTC on 9/23/21 at 23:11 EST
# APP_TIMEZONE=America/New_York

# Application URL
# Remove the hash below and set a URL if using BookStack behind
# a proxy, if using a third-party authentication option.
# This must be the root URL that you want to host BookStack on.
# All URL's in BookStack will be generated using this value.
APP_URL=https://www.levine.xyz

# Database details
DB_HOST=<cluster-host>
DB_PORT=25060
DB_DATABASE=bookstack
DB_USERNAME=ghost
DB_PASSWORD=REDACTED

# Mail system to use
# Can be 'smtp', 'mail' or 'sendmail'
MAIL_DRIVER=smtp

# Cache & Session driver to use
# Can be 'file', 'database', 'memcached' or 'redis'
CACHE_DRIVER=file
SESSION_DRIVER=file

# SMTP mail options
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null

# S3 Storage
STORAGE_TYPE=s3
STORAGE_S3_KEY=REDACTED
STORAGE_S3_SECRET=REDACTED
STORAGE_S3_BUCKET=my-bucket
STORAGE_S3_REGION=us-east-1

# B2 Storage
#STORAGE_TYPE=s3
#STORAGE_S3_KEY="REDACTED"
#STORAGE_S3_SECRET="REDACTED"
#STORAGE_S3_BUCKET="my-bucket"
#STORAGE_S3_ENDPOINT="s3.us-west-001.backblazeb2.com"
#STORAGE_URL="https://s3.us-west-001.backblazeb2.com/my-bucket

# Storage URL prefix
# Used as a base for any generated image urls.
# An s3-format URL will be generated if not set.
STORAGE_URL=false

# Okta SSO
# Replace the below (including '{}' braces) with your okta APP_ID and APP_SECRET and BASE_URL.
OKTA_APP_ID=<okta-app-id>
OKTA_APP_SECRET=REDACTED
# The base URL is the URL from step 1 but with everything after the domain (okta.com) removed.
OKTA_BASE_URL=https://identity.levine.org
```

</details>

### CSS

<details>
<summary>CSS</summary>

```css
@import url('https://fonts.googleapis.com/css?family=Roboto:400,700,900');
  
/* background stuff */
html {background-color: #282b36;}
body {font-family: "Roboto", sans-serif!important;background-color: #282b36;}
html.shaded {background-color: #282a36;}
.flex.sidebar+.flex.content{background-color: #282a36;}
.flex.sidebar {background-color: #282a36;}
body.shaded {background-color: #282a36;}
.toolbar-container {background-color:#282a36}
.search-box input{background-color:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.3)}
hr{background-color:rgba(0,0,0,.2)}
.page-list .page {border-left: 5px solid #8be9fd}
.page-list h5{border-left: 5px solid #8be9fd}
.faded-small, .primary-background-light {background-color: #282a36;}
.floating-toolbox{background-color:#282a36}
.editor-toolbar{background-color:#282a36;border-bottom:1px solid rgba(0,0,0,.2);}
.title-input.page-title .input{background-color:#282a36;}
#markdown-editor .markdown-editor-wrap {background-color: #282a36;}
.card{  background-color: #282a36;box-shadow:none}
.comment-box {background-color: #333644;}

/* text stuff */
body{color: #f8f8f2;}
.text-page {color: #8be9fd;}
.text-book {color: #50fa7b;}
.text-chapter {color: #ffb86c;}
.text-primary, p.primary, p .primary, span.primary:hover, .text-primary:hover, .text-button, .text-button:hover, .text-button:focus {color: #f8f8f2;}
h1, h2, h3, h4, h5, h6 {color: #f8f8f2;}
.page-content h1{text-transform:uppercase}
h1.break-text{text-transform:uppercase}
h1 {font-weight: 900}
h2, h3, h4, h5, h6 {font-weight: 700}
.faded a, .faded button, .faded span, .faded span>div {color: #f8f8f2;}
.entity-list .page.draft .text-page {color: #bd93f9;}
.card .entity-list-item:not(.no-hover):hover {background-color: #787878 !important;}
.card .entity-list-item:not(.no-hover):hover .text-muted {color: white !important;}
.setting-list-label {color: #999;}
.tag-item .tag-value {background-color: rgba(255, 255, 255, 0.1);}
.tag-item a {color: #f8f8f2;}
.text-small {color: #777 !important;}

/* border changes */
header {border-bottom: 0;}
.flex.sidebar+.flex.content {border-left: 0;}
.card h3{ border-bottom:0}
#sidebar .scroll-body.fixed{border-left: 1px solid #6272a4}
.fake-input, .input-base, input[type=date], input[type=email], input[type=number], input[type=password], input[type=search], input[type=text], input[type=url], select, textarea{border: 1px solid #44475a;color: #f8f8f2;background-color: rgba(0,0,0,.2);}
.activity-list-item {border-bottom:1px solid rgba(0,0,0,.2)}
.page-list .chapter {border-left: 5px solid #ffb86c;}
.floating-toolbox{border:0}
#markdown-editor .markdown-editor-wrap{border: 1px solid rgba(0,0,0,.2);}

/* other changes */
code {color:#50fa7b;background-color:#44475a}
.code-base, code, span.code {border: 1px solid #6272a4;border-radius: 0px;}
.button.pos, input[type=button].pos, input[type=submit].pos {background-color: #50fa7b;color: #282a36;text-transform: uppercase;border: 1px solid #52a256;vertical-align: top;}
table.table tr:hover {background-color: #44475a;}
table.table tr {border-bottom: 1px solid rgba(0,0,0,.2);}
blockquote{border-left: 4px solid #8be9fd;background-color: #44475a;}

/* scrollbar
*********************************/
.scrollbar{margin-left: 30px;float: left;height: 300px;width: 65px;background: #F5F5F5;overflow-y: scroll;margin-bottom: 25px;}
.force-overflow{min-height: 450px;}
#wrapper{text-align: center;width: 500px;margin: auto;}
#style-2::-webkit-scrollbar-track{-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);border-radius: 10px;background-color: #F5F5F5;}
#style-2::-webkit-scrollbar{width: 12px;background-color: #F5F5F5;}
#style-2::-webkit-scrollbar-thumb{border-radius: 10px;-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);background-color: #D62929;}

/* sidebar
******************************
pages */
.book-tree .sidebar-page-list .page {color: #8be9fd!important;}
.book-tree .sidebar-page-list .list-item-page {border-left: 5px solid #8be9fd;}
/* chapters */
.book-tree .sidebar-page-list .chapter {color: #ffb86c!important;}
.book-tree .sidebar-page-list .list-item-chapter {border-left: 5px solid #ffb86c;}
/* books */
.book-tree .sidebar-page-list .book {color: #50fa7b!important;}
.book-tree .sidebar-page-list {border-left: 5px solid #50fa7b;}

.input-base.invalid, .input-base.neg, .invalid.fake-input, .neg.fake-input, input.invalid[type=date], input.invalid[type=email], input.invalid[type=number], input.invalid[type=password], input.invalid[type=search], input.invalid[type=text], input.invalid[type=url], input.neg[type=date], input.neg[type=email], input.neg[type=number], input.neg[type=password], input.neg[type=search], input.neg[type=text], input.neg[type=url], select.invalid, select.neg, textarea.invalid, textarea.neg {border: 1px solid #ff5555;}

.text-neg, p .neg, p.neg, span.neg {color: #ff5555;}

.dropdown-container ul {background-color: #282a36;box-shadow: 0 0 2px 0 rgba(0,0,0,.1);border-radius: 1px;border: 1px solid #44475a;color: #f8f8f2;}
.dropdown-container ul a, .dropdown-container ul button {color:#f8f8f2}
.text-primary, p.primary, p .primary, span.primary:hover, .text-primary:hover, a, a:hover, a:focus, .text-button, .text-button:hover, .text-button:focus {color: #f8f8f2;}
.dropdown-container ul a:hover {background-color: #44475a;}
.outline>input:active, .outline>input:focus {border-bottom: 2px solid #8be9fd;}
.card.drag-card>div .outline input {background-color: #282a36;color:#f8f8f2}
.card.drag-card .handle {background-color:#282a36;}
.card.drag-card {border: 1px solid #44475a;}
.card.drag-card .drag-card-action:hover, .card.drag-card .handle:hover {background-color: #44475a;}

pre {background-color: #44475a;border: 1px solid #ddd;}
pre:after {width: 0px;border-right:0}

.sortable-page-list li {border: 1px solid #6272a4;}
.sortable-page-list, .sortable-page-list ul {background-color: #282b36;}
.well {background-color: #282a36;border:0;}
.button.outline.page {border-color: #8be9fd;color: #8be9fd;}
.button.outline.book {border-color: #50fa7b;color: #50fa7b;}

.featured-image-container {background: none}
.floating-toolbox .tabs {border-right: 1px solid #44475a;}
.scroll-box {border: 1px solid #44475a;}
.scroll-box .scroll-box-item {border-bottom: 1px solid #44475a;}

::-webkit-scrollbar {width: 10px;}
::-webkit-scrollbar-track {background: #282a36;}
::-webkit-scrollbar-thumb {background: #44475a;}
::-webkit-scrollbar-thumb:hover {background: #50fa7b;}
.floating-toolbox .tabs svg {fill: rgba(248, 248, 242, 1);}

.entity-selector .entity-list > div {background-color:#282a36;}
.entity-selector .entity-list {color:#f8f8f2;background-color: #282a36}

/* WSIWYG editor fixes */
#tinymce {background-color: #282a36!important;}
.mce-container, .mce-container *, .mce-widget, .mce-widget *, .mce-reset {background-color: #282a36!important;}
.mce-menubtn button {color: #f8f8f2!important;}
.mce-ico {color:#f8f8f2!important;}
.mce-grid-border a:hover, .mce-grid-border a.mce-active {border-color: #8be9fd;background: #bdd6f2;}
.mce-menu-item.mce-selected .mce-text, .mce-menu-item.mce-selected .mce-ico {color: #f8f8f2!important;}
.mce-widget, .mce-textbox {color: #ffffff!important;}
.mce-label {text-shadow: none!important;}
.popup-body {background-color: #282a36!important;}
th {background-color: #44475a}
.pos .svg-icon {fill:#282a36}

ul > li > a {color: #8be9fd!important}
.page-content > div > a {color: #8be9fd!important}

@page{
    margin:0cm!important;
    size: A4
}

@media print {
  html, body {
    width: 210mm;
    height: 297mm;
  }
```

</details>

The application primary color is `#0288D1`.

## Troubleshooting

### How to Fix Broken Images after Migrating BookStack to a New Domain

This is a very specific case, but one I encountered recently when converting Bookstack from a dedicated VM to a container. In doing this, I also changed the location of the images from being hosted locally to being hosted on AWS S3. Because the Bookstack data lives in the Managed MySQL database hosted on DigitalOcean, it wasn't affected, but the image locations did not automatically update.

The article this query came from mentions that there's an [issue requesting an admin feature to help with this](https://github.com/BookStackApp/BookStack/issues/1225) on BookStack's git page.

The following is a query that can be run in order to automatically update the image location domain.

```sql
UPDATE pages
SET     html =
        REPLACE(
            REPLACE(
                html, 'http://YOUR.OLD.URL', 'https://YOUR.NEW.URL'),
                'https://YOUR.OLD.URL', 'YOUR.NEW.URL');
UPDATE images
SET     url =
        REPLACE(
            REPLACE(
                url, 'http://YOUR.OLD.URL', 'https://YOUR.NEW.URL'),
                'https://YOUR.OLD.URL', 'YOUR.NEW.URL');
```

### References

* [https://www.bookstackapp.com/docs/admin/installation/\#ubuntu-1604](https://www.bookstackapp.com/docs/admin/installation/#ubuntu-1604)
* [https://stackoverflow.com/questions/57775861/cloudflare-digital-ocean-server-nginx-proxy-flow-not-working](https://stackoverflow.com/questions/57775861/cloudflare-digital-ocean-server-nginx-proxy-flow-not-working)
* [https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls](https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls)
* [https://www.digicert.com/csr-ssl-installation/nginx-openssl.htm\#ssl_certificate_install](https://www.digicert.com/csr-ssl-installation/nginx-openssl.htm#ssl_certificate_install)
* [https://kb.zensoft.hu/migrating-your-bookstack-app-to-a-new-domain/](https://kb.zensoft.hu/migrating-your-bookstack-app-to-a-new-domain/)


