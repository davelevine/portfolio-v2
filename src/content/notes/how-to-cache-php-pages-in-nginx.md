---
title: "How to Cache PHP Pages in Nginx"
date: "2021-03-06T21:42:11+00:00"
description: "This article will discuss how to cache PHP pages in Nginx, allowing for a much faster load time, particularly for static content."
topics:
  - nginx
  - php
  - caching
ail: 0
---
This article will discuss how to cache PHP pages in Nginx, allowing for a much faster load time, particularly for static content.

### Pre-requisites

* Nginx
* a website using PHP (you can apply most parts to other sites by replacing `fastcgi_` with `proxy_` in the settings)
* a bit of bravery to test in production

### Caching

First of all we need to create a new cache path. **Outside of any `server` block** add the following:

```nginx
fastcgi_cache_path /var/cache/nginx levels=1:2 keys_zone=bookstack:10m inactive=60m;
fastcgi_cache_key "$scheme$request_method$host$request_uri";
```

_more about_ [_fastcgi_cache_path_](https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_cache_path) _and_ [_fastcgi_cache_key_](https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_cache_key)

`key_zone` has to be a unique name, `10m` limits the size of the keys (not the cache) to 10MB which allows to store around 80000 pages. `levels=1:2` instucts Nginx to store files in directories like `/c/29/b7f54b2df7773722d382f4809d65029c` which avoids having too many files in one directory (which might be very slow on some file systems). Data not accessed for 60 minutes (`inactive=60m`) gets deleted.

`fastcgi_cache_key` indicates how the key of the cache is made up. Two requests for the same key are cached as one file. If your website differs by the language of the visitors browser (like this one), then you might want to add the `AcceptLanguage` HTTP header. Keep in mind that this makes the cache much less effective as the chances that two visitors have the exact same Language preferences are slim.

```nginx
fastcgi_cache_key "$scheme$request_method$host$request_uri$http_accept_language";
```

Next we need to edit the PHP section of your Nginx config.

`fastcgi_cache bookstack` tells Nginx to use the cache created above. `fastcgi_cache_valid 200 60m` limits the caching to 60 minutes and only for requests not failing (200 status code).

By default PHP sends a `cache-control: no-cache, private` header instructing to not cache any pages. To override this we need to ignore this header (`fastcgi_ignore_headers Cache-Control`). Also sites sending Cookies are not cached by default, so we ignore this too. This of course breaks login and other interactive things on the site, but this doesn't matter for a static website like this one. Last we add a custom header to the requests to make the status of the cache (`HIT` or `MISS`) public.

```nginx
location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.3-fpm.sock;
        fastcgi_cache bookstack;
        fastcgi_cache_valid 200 60m;
        fastcgi_ignore_headers Cache-Control;
        fastcgi_ignore_headers Set-Cookie;
        add_header X-Cache-Status $upstream_cache_status;
}
```

Afterwards don't forget to save the config and reload Nginx to apply the changes (after checking the validity of the config with `sudo nginx -t`)

### References

* [https://guides.lw1.at/books/how-to-cache-a-php-page-using-nginx/page/caching](https://guides.lw1.at/books/how-to-cache-a-php-page-using-nginx/page/caching)
* [https://www.tecmint.com/cache-content-with-nginx/](https://www.tecmint.com/cache-content-with-nginx/)
* [https://www.techrepublic.com/article/how-to-cache-static-content-on-nginx/](https://www.techrepublic.com/article/how-to-cache-static-content-on-nginx/)


