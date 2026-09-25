---
layout: ../layouts/UsesLayout.astro
title: Uses | Dave Levine
description: The hardware, software, and stack Dave Levine uses.
heading: Uses
lede: >-
  The tools, services, and gear I use day-to-day, at work and at home, with links wherever I've
  written about them in more depth.
# Each item: name, optional text (writeup; inline Markdown).
sections:
  - title: Code
    items:
      - name: Paseo
        text: >-
          VS Code was my go-to for a number of years and I still use it when necessary, but I started
          using [Paseo](https://paseo.sh/) with Claude Code and it quickly became my daily driver.
      - name: Ghostty
        text: >-
          I was a die-hard iTerm2 user until I started using Ghostty. Once I started using it, there
          was no going back.
      - name: GitHub
        text: >-
          I've kicked around the idea of storing my code on Forgejo, but once I started using
          [GitHub Actions](/writing/infrastructure-as-code/), that idea went out the window. I back up
          certain repos to Forgejo locally, but GitHub is the primary spot where everything lives.
      - name: Astro
        text: >-
          This site is built with Astro. It's fast, it ships next to no JavaScript, and every page is
          just a Markdown file in a repo.
      - name: Cloudflare Pages
        text: >-
          My go-to for [static website hosting](/writing/jamstack/). I used Vercel for a while, but I
          always keep coming back to Cloudflare Pages. It just works.
      - name: Umami
        text: >-
          When I [went with Plausible](/writing/plausible/), I said I'd give Umami a try some day. Some
          day came. It's [self-hosted](/decisions/0081-vercel-apps-to-self-hosted-docker/),
          cookie-free, and the [stats](https://stats.levine.io/share/jcjtY60wzyLPBgAI/dave.levine.io)
          for this site are public if you're curious.
  - title: Homelab
    items:
      - name: System76 Meerkat
        text: >-
          The heart of my [homelab](/writing/category/homelab/). It runs Ubuntu and around 47 Docker
          services, from Plex and Audiobookshelf to this site's analytics. Intel Core i7-1260P
          (12 cores, 16 threads, up to 4.7 GHz, 18 MB cache), 64 GB of memory, and a 500 GB PCIe
          Gen4 SSD.
      - name: Hetzner CX33
        text: >-
          My VPS, [in Nuremberg](/decisions/0065-vps-ashburn-to-nuremberg/) since I
          [moved off DigitalOcean](/writing/migration-to-hetzner/). It runs the services that need to
          stay up even when the house doesn't, like the UniFi controller, behind Caddy. Once a
          quarter, a [CI job](/decisions/0070-quarterly-vps-restore-test/) boots its latest snapshot
          on a throwaway instance to prove the backups actually restore.
      - name: pfSense XG-7100 Desktop
        text: >-
          Set it and forget it. It handles routing, firewalling, DHCP, DNS, and ad blocking for every
          VLAN in the house, and backs up its own config to the NAS and R2. The last time I got
          clever with it, [it didn't go well](/writing/firewall-misconfiguration/).
      - name: Ubiquiti UniFi
        text: >-
          UniFi handles Wi-Fi and switching, while pfSense does the routing. I have two U7 Pro XG
          access points, two older AC Pros, and three switches, with a USW-48-PoE at the core. The
          controller runs [in Docker](/writing/digitalocean-migration/) on the Hetzner VPS.
      - name: Tailscale
        text: >-
          The glue that holds my network together, and the cornerstone of most of my homelab. Twenty
          machines share one tailnet, from hosts like the Hetzner VPS and pfSense to services like
          Gluetun that join on their own. It's how I reach everything from anywhere, and for private
          services, it's the only way in. The ACLs are
          [managed as code](/decisions/0022-adopt-opentofu-for-infrastructure/) like everything else.
      - name: Cloudflare
        text: >-
          All my DNS is hosted here, along with the tunnels that get traffic into my homelab. The
          [whole account](/decisions/0080-cloudflare-account-full-iac/) is managed with OpenTofu, so
          nothing gets changed by hand in the dashboard.
      - name: Cloudflare R2
        text: >-
          Every image on this site is served from R2. It's also where my
          [OpenTofu state](/writing/infrastructure-as-code/) and offsite backups live.
      - name: Home Assistant
        text: >-
          The hub for everything in the house that isn't a server. Heating and cooling, the alarm and
          cameras, lights, sprinklers, the vacuum, and energy usage all run through it, along with hooks
          into pfSense, UniFi, and the NAS. It runs on its own Raspberry Pi 5 and backs up every night
          to the NAS and offsite. If it's down, the whole house notices.

          It also runs my voice assistant: the [Ollama Cloud](https://ollama.com/cloud) API for conversation,
          [Groq](https://groq.com) for speech-to-text, and [ElevenLabs](https://elevenlabs.io) for the
          voice.
  - title: Writing
    items:
      - name: Journalistic
        text: >-
          A [micro-journaling app](/projects/journalistic/) I wrote from scratch, inspired by the
          [original Journalistic app](https://journalisticapp.com). Daily thoughts go in a few
          bullet points at a time, and since it's self-hosted, the data stays mine.
      - name: Paper
        text: >-
          For anything longer than a few bullet points. It's a
          [clean, distraction-free writing app](https://paper.pro) that stays out of the way, which
          is exactly what I want when I'm drafting.
      - name: Raycast Notes
        text: >-
          For quick, throwaway notes. It's a keystroke away, so I can jot something down without
          losing my train of thought.
  - title: Learning
    items:
      - name: Feedbin
        text: >-
          My RSS reader. Blogs, newsletters, and anything else worth following end up here, without
          an algorithm deciding what I see.
      - name: Audiobookshelf
        text: >-
          Self-hosted on the Meerkat, serving audiobooks and podcasts from the NAS. It's also the
          source of truth for my ebooks, which is what makes the Kobo setup below work.
      - name: Kobo Clara BW
        text: >-
          Every ebook in my Audiobookshelf library lands on it automatically, and
          [BookBridge](https://github.com/cporcellijr/bookbridge) keeps my place in sync between the audiobook and the ebook. I can listen on a walk and pick up
          reading on the same page that night.
  - title: Planning
    items:
      - name: Todoist
        text: >-
          Every task, big or small, ends up here. If it's not in Todoist, it's not getting done.
      - name: Fantastical
        text: >-
          The best calendar app I've found for the Mac. Typing out an event in plain English and
          having it land in the right place never gets old.
  - title: Tools & Utilities
    items:
      - name: Bitwarden
        text: >-
          My password manager, and with Secrets Manager, where my homelab's secrets live too. Nothing
          sensitive gets committed; it's all [resolved at deploy time](/writing/secrets-at-deploy-time/),
          with a [cached lookup](/decisions/0075-cached-secrets-lookup-plugin/) to keep Ansible runs
          reliable.
      - name: Raycast
        text: >-
          It replaced [Alfred](https://www.alfredapp.com/) for me. Launching apps is the least of what
          it does; between the extensions, clipboard history, and snippets, I'd have a hard time
          working without it.
      - name: Hammerspoon
        text: >-
          My window manager on macOS. It's scriptable in Lua, so windows go exactly where I want them
          with a keystroke instead of a drag.
      - name: Claude
        text: >-
          My go-to for thinking through problems, writing code, and regular sanity checks. Paired
          with Claude Code in Paseo, it's where most of my coding happens now, and it even
          [keeps my homelab docs current](/decisions/0082-automated-docs-maintenance/). I'm upfront
          about where it shows up in my writing, too: every post carries an [AI Level](/ail/).
  - title: Gear
    items:
      - name: Mac mini (2024)
        text: >-
          My desktop, and where most of my day happens. M4 Pro with a 14-core CPU and 20-core GPU,
          64 GB of unified memory, and a 1 TB SSD. It drives the LG ultrawide, and it's so small and
          quiet that I barely notice it's there.
      - name: MacBook Pro (2021)
        text: >-
          My laptop, and the machine I manage the homelab from. M1 Max with a 10-core CPU and 32-core
          GPU, 32 GB of unified memory, and a 500 GB SSD. Years in, it still handles everything I
          throw at it.
      - name: LG 40WP95C-W
        text: >-
          40 inches of curved 5K2K (5120 × 2160) is enough room that I don't miss a second monitor.
          A single Thunderbolt cable handles video, USB, and up to 96W of power, so the desk stays
          clean.
  - title: Workspace
    items:
      - name: Herman Miller Embody
        text: >-
          I'm a huge believer in the whole "buy once, cry once" mentality. I'd rather drop a large sum
          of money on something that's going to bring me comfort or protection instead of paying
          multiple times for cheap things that will just never do the job right. That goes double for
          anything that goes between me and the ground, and a chair I'm in for most of the day is at
          the top of that list. It's the most comfortable chair I've owned.
      - name: Uplift V2 4-Leg Standing Desk
        text: >-
          I switch between sitting and standing throughout the day. The 4-leg frame is rock solid,
          even at full standing height.
---

I got this idea from [Daniel Miessler](https://web.archive.org/web/20230329001503/https://danielmiessler.com/uses/) and decided to borrow from it.
