---
title: "Accessing my Homelab with Tailscale and Nginx Proxy Manager"
date: "2024-06-20T12:27:40-04:00"
description: "For a number of years now, I've made almost exclusive use of Cloudflare Tunnels for remote access to my homelab. While I still make use of them for a few things, I've never been totally happy with the setup."
topics:
  - networking
  - tailscale
ail: 0
---
> To preface this post, I want to make it absolutely clear that I LOVE Cloudflare and all that it has to offer. Their free plan is practically giving away the store, and it's a fantastic offering. What this post will hope to amount to is a different approach to securing my homelab.
>
> Instead of running my private services through Cloudflare and securing them accordingly, I'm now running them through Tailscale so they're only exposed while connected to my Tailnet.
>
> With all that out of the way, let's dive in.

For a number of years now, I've made almost exclusive use of [Cloudflare Tunnels](https://www.cloudflare.com/products/tunnel/) for remote access to my homelab. While I still make use of them for a few things, I've never been totally happy with the setup.

For starters, although I almost certainly barely register on Cloudflare, I still don't like the idea of all my traffic being shuttled through Cloudflare. While [not technically true](https://security.stackexchange.com/questions/177291/why-cloudflare-is-a-mitm-attack), Cloudflare can be considered a giant man-in-the-middle (MITM) attack. Outside of that, while my sites have nearly always been available, I've had caching issues with a number of my domains. This is probably my fault with the way I've configured things, but regardless, I've spent an awful lot of time fiddling with things I didn't need to. Because of this, I've started looking for alternatives.

Enter [Tailscale](https://tailscale.com).

## Leveraging Tailscale

I've already written about the benefits of using Tailscale when integrating it with my NAS. I also use it for a number of other systems for remote and secure access. While it's been invaluable for accessing machines on my homelab, it never really clicked for me that I could also access my services exclusively via Tailscale.

What I didn't understand at the time was how exactly this would work. I understand the mechanics of exposing services via DNS on Cloudflare, but it didn't really click for me how I could do this with Tailscale. Just by coincidence, I watched a [video](https://www.youtube.com/watch?v=Vt4PDUXB_fg) that Alex from Tailscale made on what I wanted to do.

The problem is that for the life of me, I just couldn't get the hang of [Caddy](https://caddyserver.com/) with Tailscale. I think it's one of those things that's easier than I realize, but I just don't have the time to invest in learning. Luckily, I became pretty good at Nginx before I discovered Cloudflare Tunnels. I'd seen a lot about [Nginx Proxy Manager](https://nginxproxymanager.com) on Reddit over the years, but hadn't tried it out. I figured it's just a frontend for making Nginx easier to use, and I was right.

To make things a bit quicker to get going, I watched another [video](https://www.youtube.com/watch?v=2fA6u9eahNw) on how to get things going. I don't particularly like Brett from Raid Owl; he's overly sarcastic and his tone is patronizing, but the information made sense and helped things click.

## Nginx Proxy Manager

Something I had some concerns about was backing up my Nginx configurations. As Nginx Proxy Manager doesn't have a [native backup](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/1529), I needed to ensure that if I was going to do this, I wanted to make it as easy as I could to get back up and running if disaster strikes.

