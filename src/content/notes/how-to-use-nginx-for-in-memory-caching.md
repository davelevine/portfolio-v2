---
title: "How to use Nginx for in-memory caching"
date: "2021-03-06T21:42:11+00:00"
description: "This article will discuss requirements needed to add in-memory caching for all Nginx configuration files."
topics:
  - nginx
  - caching
ail: 0
---
This article will discuss requirements needed to add in-memory caching for all Nginx configuration files.

### What is in-memory caching?

In-memory caching is a technique that allows Nginx to cache content to memory instead of a disk. Because memory is faster than disk, the cached content can be served that much faster.

### How to Utilize in-memory caching

In order to utilize in-memory caching through Nginx, you first need to determine how much free RAM you have available. This will help with figuring out how much RAM can be allocated towards caching. This can be found by running `free -h` in a terminal.

```shell
              total        used        free      shared  buff/cache   available
Mem:           3.9G        1.4G        702M         17M        1.7G        2.2G
Swap:            0B          0B          0B
```

On my VPS on DigitalOcean, I currently have 1gb of RAM allocated for caching, amounting to 25% of my total RAM. The mileage may vary depending on the amount of RAM available.

Once the amount of available RAM has been determined, the Nginx config files will need to be modified in order to utilize `tmpfs`, which is a file system that lives in memory. Because this is being configured for Nginx, we'll be using the `/var/cache/nginx/` directory.

Although `tmpfs` already exists, we need to mount it in RAM. This can be done with the following command:

```bash
sudo mount -t tmpfs -o size=2G tmpfs /var/cache/nginx/
```

This will create the RAM storage, but in it's current state, it won't persist after a reboot. In order to do this, `tmpfs` needs to be added to the `/etc/fstab` file. This can be done with the following steps:

* Navigate to `/etc/fstab` with `sudo nano /etc/fstab`.
* Add the following to the bottom of the file:

```shell
tmpfs /var/cache/nginx/ramcache tmpfs defaults,size=1G 0 0
```

* Save and exit

This will now allow `tmpfs` to persist in RAM after a reboot.

### Modifying Nginx Configs

With `tmpfs` not created in RAM, Nginx can be be configured to utilize the space.

Since all services utilizing Nginx are currently configured to use either fast_cgi or proxy_pass, the following steps can be taken in order to properly configure Nginx:

* Navigate to `/etc/nginx/sites-available/*.conf`
* Within the Nginx config file, either add the following line at the top of the config file or modify the cache_path:

```nginx
fastcgi_cache_path /var/cache/nginx/<service>/ levels=1:2 keys_zone=<service>:10m inactive=60m;
```

* Ensure the following exists within the PHP location block:

```nginx
fastcgi_cache_key $scheme$request_method$host$request_uri;
fastcgi_cache_revalidate on;
fastcgi_cache_background_update on;
fastcgi_cache_use_stale error timeout invalid_header updating http_500;
fastcgi_ignore_headers Cache-Control Expires Set-Cookie;
```

* Save and exit, then restart Nginx

```bash
sudo systemctl reload nginx
```

Once this has been completed, Nginx will automatically use the mounted storage for cache.

### References

* [https://websiteforstudents.com/improve-nginx-cache-performance-with-tmpfs-on-ubuntu/](https://websiteforstudents.com/improve-nginx-cache-performance-with-tmpfs-on-ubuntu/)
* [https://www.nginx.com/blog/nginx-high-performance-caching/](https://www.nginx.com/blog/nginx-high-performance-caching/)
* [https://danielmiessler.com/blog/nginx-caching-tempfs/](https://danielmiessler.com/blog/nginx-caching-tempfs/)
* [https://danielmiessler.com/blog/wordpress-nginx-speed-guide/](https://danielmiessler.com/blog/wordpress-nginx-speed-guide/)


