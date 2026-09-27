---
title: "How to Setup DNS over TLS"
date: "2021-03-06T16:34:06+00:00"
description: "This will be a step-by-step guide on how to setup DNS over TLS for the WAN interface. Since the WAN interface does not utilize the VPN, the following DNS addresses are used from CleanBrowsing:"
topics:
  - networking
  - pfsense
  - dns
ail: 0
---
# How to Setup DNS over TLS

This will be a step-by-step guide on how to setup DNS over TLS for the WAN interface. Since the WAN interface does not utilize the VPN, the following DNS addresses are used from CleanBrowsing:

* **`Domain`**`:: security-filter-dns.cleanbrowsing.org`
* **`IPv4 address`**`: 185.228.168.9:853 and 185.228.169.9:853`

### General Settings

* Navigate to **System --&gt; General Settings**
* Under _DNS Servers_, add the aforementioned IP addresses and make sure to select the WAN gateway.

> **Important**
>
> Make sure the` _`DNS Server Override`_ `is unchecked so that the DNS servers are never changed to the ISP DNS servers.

### DNS Resolver

* Navigate to **Services --&gt; DNS Resolver**
* Make sure the DNS resolver is enabled and that all LAN/VLAN interfaces are selected.
* Check the boxes for the following:
  * _Enable DNSSEC Support_
  * _DNS Query Forwarding_
  * _Use SSL/TLS for outgoing DNS Queries to Forwarding Servers_

> **Info**
>
> The following is listed on a pfSense guide from 2018 as being necessary for this to work, although it's unclear at the time if it's still necessary. That being said, the following should be entered in the _Custom Options_ text box:

```properties
server:
forward-zone:
name: "."
forward-ssl-upstream: yes
forward-addr: 185.228.168.9@853
forward-addr: 185.228.169.9@853
```

### Additional Considerations

#### States

At this point, all DNS queries for the WAN interface should be using port 853, although it should be tested. In order to test, use the following steps:

* Navigate to **Diagnostics --&gt; States**
* Use the filter and enter one of the DNS servers from earlier.
* The results should show something like the following example:

| Interface | Protocol | Source (Original Source) -&gt; Destination (Original Destination) | State | Packets | Bytes |
| :---: | :---: | :---: | :---: | :---: | :---: |
| WAN | tcp | 203.0.113.10:43100 -&gt; 185.228.168.9:853 | TIME_WAIT:TIME_WAIT | 14/10 | 1 KiB / 7KiB |

* The DNS protocol is now TCP (whereas default DNS on port 53 is UDP) and the port is 853.

### Packet Capture

* Go to **Diagnostics --&gt; Packet Capture**
* Select the WAN interface
* Enter 853 for the port
* Press "start" and browse to a website
* Hit the "stop" button and inspect the packet capture. The DNS queries should be using the proper DNS servers over port 853.
* The same steps using port 53 should show up empty, indicating everything working as it should.

### Firewall Rules

Although not absolutely necessary, this will ensure that no outgoing connections for the WAN interface use port 53. To do this, use the following steps:

* Navigate to **Firewall --&gt; Rules --&gt; Floating** and click _Add_.
  * Use the following settings:
    * Action: Reject (or Block)
    * Quick: enabled
    * Interface: WAN
    * Direction: out
    * Address Family: IPv4 + IPv6
    * Protocol: TCP/UDP
    * Source: invert match, This Firewall `(NOTE: previous directions here said “any,” however that prevented the DNS Resolver service from restarting correctly)`
    * Destination: any
    * Destination Port: 53
* Navigate to **Firewall --&gt; NAT --&gt; Port Forward** and click _Add_.
* Use the following settings:
  * Interface: LAN (you’ll need to make duplicate rules for each LAN/VLAN interface)
  * Protocol: TCP/UDP
  * Destination: invert match, This Firewall
  * Destination port range: DNS
  * Redirect target IP: 127.0.0.1
  * Redirect target port: DNS
  * NAT reflection: Disable

### Verification

Finally, DNSSEC support should be tested.

* Navigate to [https://dnssec.vs.uni-due.de/](https://dnssec.vs.uni-due.de/) and click "Start Test"
* When the test finishes, a drawing with a thumbs up should be displayed, along with "Yes, your DNS resolver validates DNSSEC signatures.

### Resources

* [https://forum.netgate.com/topic/139771/setup-dns-over-tls-on-pfsense-2-4-4-p2-guide/2](https://forum.netgate.com/topic/139771/setup-dns-over-tls-on-pfsense-2-4-4-p2-guide/2)
* [https://cleanbrowsing.org/guides/dnsovertls](https://cleanbrowsing.org/guides/dnsovertls)
* [https://medium.com/@davetempleton/setting-up-dns-over-tls-on-pfsense-bd96912c2416](https://medium.com/@davetempleton/setting-up-dns-over-tls-on-pfsense-bd96912c2416)


