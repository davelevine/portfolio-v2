---
title: "Visual Studio Code Server (code-server)"
date: "2021-03-06T15:54:44+00:00"
description: "This is a repository of all things related to VSCode Server, known from here out as code-server."
topics:
  - nginx
  - vscode
ail: 0
---
# Visual Studio Code Server (code-server)

This is a repository of all things related to VSCode Server, known from here out as code-server.

### NGINX

```nginx
fastcgi_cache_path /tmp/nginx_code levels=1:2 keys_zone=code:100m max_size=100m inactive=60m;
#fastcgi_cache_key "$scheme$request_method$host$request_uri";

server {
    listen 80;
    listen [::]:80;
    listen 443;
    server_name example.com;

    ssl on;
    ssl_certificate /etc/nginx/ssl/example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
      proxy_pass http://127.0.0.1:8444/;
      proxy_set_header Host $host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection upgrade;
      proxy_set_header Accept-Encoding gzip;
      gzip on;
      add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      expires off;
      proxy_max_temp_file_size 0;
    }

location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.3-fpm.sock;
        include fastcgi_params;

# Remove cookies which are useless for anonymous visitor and prevent caching
        fastcgi_ignore_headers Set-Cookie;
        fastcgi_ignore_headers Cache-Control;
#       proxy_hide_header Set-Cookie;
        # Add header for cache status (miss or hit)
        add_header X-Cache-Status $upstream_cache_status;

        fastcgi_cache code;
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

   location ~ ^/(code/|p/)/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:8444;
  }
}
```

### Issues

**Issue:** Unable to load code-server

* Loading code-server produced a black screen with a number of *.js and HTTP errors in the browser `Console`.
  * Specific errors included:
    * `net::ERR_HTTP2_PROTOCOL_ERROR 200`
    * `RR_HTTP2_PROTOCOL_ERROR 200`
    * `Failed to load resource: the server responded with a status of 404{}`

**Cause:** This was caused by the way resources were being loaded server side, specifically with NGINX.

**Resolution:** Resolved the issue by adding the following to the NGINX `server` block:

```nginx
gzip on;
add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
expires off;
proxy_max_temp_file_size 0;
```

### Resources

* [https://www.digitalocean.com/community/questions/chrome-console-error-net-err_http2_protocol_error-200-some-site-s-content-doesn-t-available](https://www.digitalocean.com/community/questions/chrome-console-error-net-err_http2_protocol_error-200-some-site-s-content-doesn-t-available)
* [https://mashiro.top/post/nginx-faq/](https://mashiro.top/post/nginx-faq/)


