---
title: "How to Secure Nginx"
date: "2021-03-06T17:00:45+00:00"
description: "This article will store links for how to secure Nginx for a nice balance between security and usability."
topics:
  - nginx
  - security
ail: 0
---
This article will store links for how to secure Nginx for a nice balance between security and usability.

### Securing Nginx

* [https://www.keycdn.com/blog/http-security-headers](https://www.keycdn.com/blog/http-security-headers)
* [https://gist.github.com/plentz/6737338](https://gist.github.com/plentz/6737338)
* [https://8gwifi.org/docs/nginx-secure.jsp](https://8gwifi.org/docs/nginx-secure.jsp)
* [https://www.keycdn.com/support/content-security-policy](https://www.keycdn.com/support/content-security-policy)

### Example

The following is the Nginx config file for this knowledge base, which makes use of parameters from all the aforementioned sites. It contains additional parameters for caching and other things, but should serve as a good example of a balanced configuration.

```nginx
fastcgi_cache_path /var/cache/nginx/bookstack/ levels=1:2 keys_zone=bookstack:100m inactive=24h;

server {
        listen 80;
        listen [::]:80;
        listen 443;

        server_name kb.example.com;

        ssl on;
        ssl_certificate     /etc/nginx/ssl/example.com.pem;
        ssl_certificate_key /etc/nginx/ssl/example.com.key;

        client_max_body_size 50m;

        root home/<user>/.config/appdata/bookstack/www;
        index index.php index.html index.htm;

        # Security Headers
                add_header X-Frame-Options SAMEORIGIN;
                add_header X-XSS-Protection "1; mode=block";
                add_header X-Content-Type-Options nosniff;
                add_header Referrer-Policy "no-referrer";
                add_header Feature-Policy strict-origin-when-cross-origin;
                add_header hide_server_tokens on;
                add_header Content-Security-Policy "default-src * data: 'unsafe-eval' 'unsafe-inline'" always;

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


