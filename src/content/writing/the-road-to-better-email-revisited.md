---
title: The Road to Better Email, Revisited
category: Homelab
categories:
    - Email
    - Privacy
    - Security
date: "2026-11-24T12:00:00Z"
description: Five years after I first put my email behind aliases, I've changed mailbox providers twice. The aliases are the only part that never had to move.
ail: 2
---

## Summary

Back in 2021, I wrote about [the road to better email security](/writing/the-road-to-better-email-security/). It was a week-long project that ended with Gmail and Proton sitting behind [SimpleLogin](https://simplelogin.io), around 130 aliases, and a PGP setup I was pretty proud of at the time.

This week, I moved off Proton and onto [Fastmail](https://www.fastmail.com). I also put one more of my domains behind SimpleLogin while I was at it. What struck me is how little work it took. Last time, updating my email address everywhere ate up about 16 hours over two days. This time, the part that would've been the most painful took a few minutes, and that's entirely because of a decision I made five years ago without really understanding why it was a good one.

## Where Things Stood

I first signed up for Proton in 2016 and started paying for it in 2017, but for years it was something I tinkered with more than actually used. The big push came with that 2021 post, when I spent two days moving my accounts onto aliases. After that, making Proton my main inbox was mostly a matter of pointing aliases at it instead of Gmail, a little at a time. There was never really a day where I flipped a switch. It just slowly became the place everything went.

The short version is that over the last five years, SimpleLogin quietly became the most important part of my email setup. I'm now at more than 550 aliases, up from the 130 I started with. Every account I sign up for gets its own alias, usually on one of my own domains.

The mailbox behind all of it changed over time, but the addresses I hand out never did. I didn't fully appreciate that until I actually had to move.

## Why I Left Proton

I want to be fair here, because Proton has been a great service. The problem is that somewhere along the way, it stopped feeling like an email company and started feeling like an ecosystem. There's a password manager, a VPN, a drive, a calendar, a wallet, and it seems like there's something new all the time. That's great if you're all in, but I'm not.

The problem for me is that the pieces I actually depend on started to feel half-baked. When a company is fast-tracking its growth into a dozen products at once, the boring, foundational stuff underpinning setups like mine don't feel like they're get the attention they deserves. I didn't want my email to be one tile in someone else's product grid.

To be more specific, these are the things that wore me down over the years:

- **Proton Bridge, just to use a normal mail app.** Without question, this was the most annoying part. If you want IMAP and SMTP in a regular mail app, you have to be on a paid plan and run Proton Bridge on your machine at all times. It's one more thing to install, keep running, and troubleshoot when mail stops showing up.
- **No third-party mobile clients.** Bridge is desktop-only, so on my phone, it was Proton's app or nothing.
- **Search doesn't just work.** This is a consequence of client-side encryption. For full-text search in the webmail, your browser has to download and index all of your mail locally. The first run takes a long time, and you get to do it again on every machine. Search on the phone was a non-starter.
- **Read status doesn't reliably sync.** Emails I'd already read on my phone would sometimes show up as unread in the webmail later, and vice versa. That's table-stakes stuff for a mail client.
- **Upsell ads in an app I already pay for.** I like a sale as much as the next guy, but opening my inbox to a banner, or a new button that sticks around for weeks, trying to get me to move from Mail Plus to Proton Unlimited is awful UX for something that's already a paid app.
- **Support is hit or miss.** Sometimes it was great, and sometimes it wasn't, and you never really knew which one you were going to get.

None of these on its own was a dealbreaker. Together, they added up to a lot of friction for something I use every single day.

## Why Fastmail

Once I decided to leave, Fastmail was a pretty easy pick:

- **Longevity.** They've been around since 1999. In a world where services come and go, a company that's been doing the same thing for over 25 years means a lot to me.
- **Email is the whole business.** Fastmail does email, contacts, and calendar, and that's it. They're not distracted by a dozen other products. They do one thing, and they do it right.
- **They're a good internet citizen.** They build on open standards instead of locking you into their own. They helped create [JMAP](https://jmap.io), and plain IMAP and SMTP just works. No bridge required.
- **They're staffed by humans.** Contacting a company is a nightmare nowadays, with everyone shoehorning AI into their customer service. Knowing there's an actual person on the other end matters more than I thought it would.

It's almost a mirror image of my list of Proton gripes, which probably tells you everything you need to know.

## The Move

The thing about putting every account behind an alias is that the accounts don't actually know where your mail ends up. They know the alias, and only SimpleLogin knows which mailbox it forwards to.

So moving providers came down to:

- **Add the new mailbox.** I added my Fastmail address to SimpleLogin as a mailbox and verified it.
- **Make it the default.** New aliases go there from now on.
- **Move the existing aliases over.** Every alias that pointed at Proton now points at Fastmail.

That's it. Not a single service had to be told about the change, because as far as they're concerned, nothing changed. Compare that to 2021, where I logged into well over a hundred accounts one at a time to update my address. I'll take a few minutes over ~16 hours any day.

The one place that needed some work was my own domain, but thanks to Terraform, it wasn't too bad.

## One Domain, One Mail Provider

When I first set things up on Fastmail, I pointed one of my domains at it directly. A day later, I changed my mind. I'd rather keep my Fastmail address as just a mailbox and let SimpleLogin own every custom domain, same as the rest of them.

SimpleLogin gives you a list of records to add for that, and my first instinct was to just add them. That would've been a mistake, for two reasons:

- **Two sets of MX records split your mail.** Both providers wanted priority 10 and 20. With both sets in place, senders would pick between them more or less at random, and my mail would end up spread across two providers.
- **Two SPF records break SPF entirely.** A domain is only allowed one SPF record. Publish two, and receivers treat it as an error and SPF fails outright.

So it wasn't an add, it was a swap. The Fastmail MX, SPF, and DKIM records came out, SimpleLogin's went in, and the DMARC policy stayed where it was. Since all of my DNS lives in code, that was one small change I could review before it went anywhere, and then a quick test in both directions to make sure mail still flowed.

## The Irony

There's an obvious hole in all of this, and I'm aware of it. Proton bought SimpleLogin in 2022. So I left Proton, and the one service I'm staying on is owned by Proton.

Proton committed to running SimpleLogin as its own product that works with any mailbox provider, and so far, it has. Fastmail behind SimpleLogin is exactly the setup they said they'd keep supporting. But that's a promise, not a guarantee.

What makes me comfortable is that I'm not stuck if it ever changes:

- **It's open source.** SimpleLogin's code is public, so even in the worst case, the software can't just disappear.
- **My account doesn't depend on a Proton subscription.** I got lucky and managed to score a lifetime SimpleLogin plan, and it carries on whether or not I keep paying Proton for anything else.
- **I export everything nightly.** Every alias, mailbox, and custom domain gets backed up to my NAS, so I'd never lose track of which address forwards where.
- **My DNS is in code.** Moving every domain to a different alias service would be one change, not an afternoon of clicking around.

What I'm not going to do is pretend that self-hosting is realistic for most people. Self-hosting any part of email is a nightmare. The software is the easy part. Getting Gmail and Microsoft to actually trust mail from a small server is a different story. If I ever had to run SimpleLogin myself, I'd at least only be running a forwarder and could hand outbound delivery to a relay service. That's a contingency plan, though, not a plan.

## About That PGP Setup

The 2021 post spent a lot of time on PGP, and I'll admit that when I sat down to write this one, I had to stop and remember how it all worked. That's probably a good sign. It means it's been running quietly in the background for years without needing anything from me.

Funny enough, the setup outlived the tool it started with. Back then, everything hinged on [Mailvelope](https://www.mailvelope.com/en/), a browser extension that held my keys and let me read encrypted mail in Gmail. I haven't had it installed anywhere in years, and I don't use the Gmail web app anymore either. Here's what's left:

- **SimpleLogin does the encrypting.** It has my public key, and every message that forwards to my Gmail account gets encrypted before it ever lands there.
- **My mail apps do the decrypting.** I use [Canary Mail](https://canarymail.io) on both of my Macs and [FairEmail](https://email.faircode.eu) on my phone, and both have my keys imported, so encrypted mail just opens like anything else.
- **Bitwarden holds the backup.** The key pair still lives there as attachments, same as it did in 2021.

My Fastmail inbox doesn't use PGP. Gmail is the one that gets it, and since Gmail is exactly the inbox I was trying to keep Google's hands off of in the first place, it's staying that way.

## What I'd Tell Myself in 2021

If there's one thing I took away from this, it's that the alias layer was never really a privacy feature for me. It was a portability feature, and I just didn't know it yet. Your email address is your identity online, and the second you hand it to a provider, you're tied to that provider. Keep the identity and the inbox separate, and the inbox becomes something you can swap out whenever it stops working for you.

Gmail to Proton to Fastmail, and the addresses I hand out haven't changed once. I'll take that as a sign I got at least one thing right the first time.
