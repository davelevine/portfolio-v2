---
title: Resolving Secrets at Deploy Time
category: Homelab
categories:
    - Security
    - Ansible
date: "2026-09-24T12:00:00Z"
description: This post covers a secrets decision I got wrong in my homelab, and why resolving secrets at deploy time turned out to be the better trade.
ail: 3
---

## Summary

About a year ago, I made a decision about how my scheduled jobs get their secrets, and I was pretty proud of it at the time. It was consistent with everything else in my homelab, and it checked a box I'd wanted to check for a long time, which was no secrets sitting on disk on any of my hosts.

A few months ago, I reversed it. It's not that anything broke, per se, but rather that when I finally sat down and thought it through, I realized I'd made things worse in the name of making them better. This post is about how I got there and what I'd do differently.

## Background

When I moved my homelab over to [Ansible](https://www.ansible.com/), I also moved my secrets into a proper secrets manager. Most things fell into place nicely. My container deployments and my infrastructure code both look up their secrets from the control node at the moment they run, so nothing sensitive ever lands on the machines they deploy to. I liked that a lot.

Scheduled jobs were the odd ones out. Things like backups and small maintenance tasks run on [systemd timers](https://wiki.archlinux.org/title/Systemd/Timers), and they were still getting their credentials from environment files that Ansible wrote to disk during a deploy. Everything else was fetching secrets at runtime and these jobs weren't, and it bugged me more than it probably should have.

So I "fixed" it. I changed the jobs to fetch their own secrets right before they ran, called it consistency, and moved on.

## The Problem

Here's the thing about fetching a secret at runtime...something has to log in to the secrets manager to do the fetching. On the control node, that's fine, because the control node is supposed to have that kind of access. A timer that fires in the middle of the night on some other host, hours after the last deploy, is a different story. The only way that works is if the access token lives on that host.

In my case, the only token I had was the one that could read everything. So to keep a handful of scoped credentials off disk, I'd put the key to the whole vault on disk instead, in several places.

When I finally wrote it out, it was hard to argue with:

- **Before:** a few individual secrets on disk, each of which could do one specific thing.
- **After:** no individual secrets on disk, and one token that could read every secret I have.

Anyone who could read one of those files could read the other. The file permissions were the same either way. The only thing that changed was how much someone would get if they got in, and it went up, not down.

## Where I Went Wrong

I think the mistake was treating "fetch at runtime" as one idea and applying it everywhere, when it means very different things depending on where the code runs.

When Ansible renders a config for a container, it's running on the control node, which already has access to the vault. Nothing new gets handed out to anyone. A scheduled job runs on its own schedule, on its own host, long after the deploy is done. Making it fetch "at runtime" means shipping credentials out to that host. I was chasing consistency between two things that only looked alike from far away.

Once I started digging, a few other problems showed up that I hadn't thought about the first time around:

- **The tool doing the fetching wasn't managed.** The client the jobs used to talk to the secrets manager had been installed by hand, and nothing in my Ansible code put it there. If I'd rebuilt one of those hosts, every scheduled job on it would've broken, and there'd be nothing in the repo to tell me why.
- **Every job run depended on someone else's API.** If the secrets manager had a bad few minutes, a backup could fail for reasons that had nothing to do with the backup.
- **Failures showed up at the worst time.** A secrets problem would surface whenever the job happened to run, instead of during a deploy when I was actually sitting there watching.

## What I Did Instead

The fix was to resolve secrets at deploy time. The control node already has access to the vault, so during a deploy, it looks up the secrets each job needs and hands the host only those values. The jobs never talk to the secrets manager, and the vault token never leaves the control node. It also let me delete a fair bit of code, which is never a bad sign.

That said, it's not free, and I don't want to pretend otherwise. Secret values are back on disk, which is exactly what I set out to avoid in the first place. The difference is that now I'm making that trade on purpose:

- **Less exposure.** Someone who could read those files before could read the token. Now they'd get a few scoped credentials instead of everything.
- **Rotation takes a deploy.** Changing a secret now means updating it in the vault and running a deploy, where before the next job run would've just picked it up. For credentials that change a couple of times a year, that's an easy trade. For something that rotates constantly, it wouldn't be.
- **Stale values stick around.** If I change a value in the vault and don't deploy, the job keeps using the old one until it stops working. That's something I have to remember, not something the system remembers for me.

In my case, all of those are fine. They might not be for everyone.

## What I'd Do Differently

The biggest thing I took away from this is that "no secrets on disk" was never really the goal. The real question is what someone can do if they get their hands on whatever is on disk. If that answer is worse for the thing you're putting there than for the things you're keeping off, you've made it worse, no matter how clean it looks on paper.

These are the questions I ask myself now before I settle on how something gets its secrets:

- What credential does this need on the host, and what else can that credential get to?
- Does the host actually need to talk to the vault, or does it just need the values?
- What happens if the secrets manager is down when this runs?
- Would a fresh rebuild of this host work without me having to remember anything?

None of these are new ideas. I just didn't ask them the first time because I was too happy with how consistent everything looked. If there's one thing I'm trying to get better at, it's being willing to go back to a decision I was proud of and admit it didn't hold up.
