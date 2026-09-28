---
title: "How to Create & Download Droplet Snapshots"
date: "2023-01-24T22:48:28-05:00"
description: "One of the more difficult things to avoid when working with any vendor is vendor lock-in. In some instances, it's impossible to avoid, but avoiding it wherever possible is always a good approach."
topics:
  - digitalocean
ail: 0
---
One of the more difficult things to avoid when working with any vendor is vendor lock-in. In some instances, it's impossible to avoid, but avoiding it wherever possible is always a good approach.

I recently looked into the feasibility of migrating my DigitalOcean droplet to another hosting provider and found that it's harder than it seems. I found one approach, however, that can serve as an alternative to the built in snapshot capabilities of DigitalOcean.

## How To

> **Warning**
>
> It's worth noting that the following approach will take significant space on your server's hard drive. You should ensure there is enough room prior to beginning.

In order to make this work, you'll need to perform the following:

* SSH into your instance.

```shell
local$ ssh $USER@$SERVER_IP
```

* Create a new backup directory, then navigate into it.

```shell
server# mkdir -p /backups
server# cd /backups
```

* Generate a `.tar.gz` of your entire file system

```shell
server# tar -zcvpf /backups/img.tar.gz --directory=/ --exclude=proc --exclude=sys --exclude=dev/pts --exclude=backups .
```

* Once completed, assuming you have Python installed, serve the file over HTTP and download it

```shell
# python2
server# python -m SimpleHTTPServer [port]

# python3
server# python3 -m http.server [port]

local$ wget http://$SERVER_IP:8000/img.tar.gz
```

## References

* <https://www.reddit.com/r/webhosting/comments/475a9b/is_there_a_way_to_download_digital_ocean_server/d0af3o4/?context=3>
* <https://www.pythonforbeginners.com/modules-in-python/how-to-use-simplehttpserver>

