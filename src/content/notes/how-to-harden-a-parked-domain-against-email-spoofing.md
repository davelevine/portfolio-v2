---
title: "How to Harden a Parked Domain Against Email Spoofing"
date: "2026-11-24T12:00:00-05:00"
description: "A domain that never sends mail can still be spoofed. Four DNS records tell every receiver to reject mail claiming to be from it."
topics:
  - dns
  - email
  - cloudflare
ail: 3
---
I own a handful of domains that don't send or receive any mail. Some are parked, some just host a website, and a couple are for my kids down the road. For a long time I figured that since they don't do anything with email, there was nothing to worry about.

That's backwards. A domain with no mail records isn't protected, it's just undefined. Receivers can't tell the difference between "this domain never sends mail" and "this domain didn't bother to say," so a spoofed message claiming to be from it has a much better shot at landing in someone's inbox. The fix is to say it explicitly, and it only takes four records.

## How-To

These are the four records I put on every domain that doesn't handle mail. Swap `example.com` for your domain.

| Type | Name | Content | What it says |
| --- | --- | --- | --- |
| MX | `example.com` | `.` (priority `0`) | This domain accepts no mail ([RFC 7505](https://www.rfc-editor.org/rfc/rfc7505) null MX) |
| TXT | `example.com` | `v=spf1 -all` | No server is allowed to send as this domain |
| TXT | `*._domainkey.example.com` | `v=DKIM1; p=` | There are no valid DKIM signing keys |
| TXT | `_dmarc.example.com` | `v=DMARC1; p=reject; adkim=s; aspf=s` | Reject anything that fails, and be strict about it |

Together, they tell receivers the domain never sends mail, so anything claiming otherwise is fake and should be rejected outright.

In Cloudflare, add each one under **DNS > Records**. Make sure all four are **DNS only**, not proxied. Cloudflare won't proxy MX or TXT anyway, but it's worth a double check.

## Checking Your Work

Once they're in, give it a minute and confirm everything resolves the way you expect:

```bash
dig +short MX example.com
dig +short TXT example.com
dig +short TXT test._domainkey.example.com
dig +short TXT _dmarc.example.com
```

You should get back `0 .` for the MX, and the matching TXT values for the rest. The DKIM check uses `test` as a made-up selector, which is the point: any selector someone tries should hit the wildcard and come back with an empty key.

## Gotchas

There are a few things that caught me (or nearly did):

- **A wildcard doesn't override existing records.** DNS wildcards only answer for names that don't already exist. If an old provider's DKIM record is still sitting there (`k1._domainkey`, `fm1._domainkey`, whatever), the wildcard does nothing for that selector, and whoever controls that old account can still send signed mail that passes. Delete leftover DKIM records instead of assuming the wildcard covers them.
- **Only one SPF record per domain.** If there's already a `v=spf1` TXT record from something you set up years ago, replace it. Two SPF records is an error, and SPF fails outright.
- **Cloudflare Email Routing adds its own DKIM record.** If Email Routing is turned on for the zone, Cloudflare creates a `cf2024-1._domainkey` record and won't let you delete it while routing is enabled. If you aren't using it, turn it off.
- **Swap all four together if the domain ever gets mail.** A domain that gains real MX records but keeps `v=spf1 -all` and `p=reject` will have every message it sends rejected. Moving a domain between "parked" and "sends mail" means changing all four records in one go.

That's all there is to it. It's a few minutes per domain, and it closes off one of the easiest ways for someone to borrow your name.
