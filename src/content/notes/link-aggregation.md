---
title: "Configure Link Aggregation for Synology NAS and UniFi Switch"
date: "2023-05-29T16:54:13-04:00"
description: "My Synology NAS (DS918+) has two gigabit ethernet ports, and I have enough ports on my switch (USW-48 PoE) to configure link aggregation. This allows me to fully utilize the bandwidth of my NAS and allow for automatic failover should either port fail."
topics:
  - networking
  - unifi
  - synology
ail: 0
---
My Synology NAS (DS918+) has two gigabit ethernet ports, and I have enough ports on my switch (USW-48 PoE) to configure link aggregation. This allows me to fully utilize the bandwidth of my NAS and allow for automatic failover should either port fail.

## Considerations

> **Note**
>
> The following steps are adapted from an article on configuring link aggregation for [Synology NAS and UniFi switches](https://baihuqian.github.io/2021-01-18-secure-home-network-configure-link-aggregation-for-synology-nas-and-unifi-switch/).

Synology supports a number of link aggregation methods but Unifi only supports dynamic link aggregation via Link Aggregation Control Protocol (LACP). This protocol ensures that the LAG configuration is compatible and viable on each endpoint.

It's important to note that the order of operations is very important. To allow provisioning, it's important to configure downstream devices first before configuring the upstream device.

## Steps to Configure Link Aggregation

### Synology NAS

* Log into the Synology NAS and click **Control Panel**
* Select **Network** > **Network Interface**
* Click **Create Bond**
* Select **IEEE 802.3ad Dynamic Link Aggregation** as the mode
* Configure a static IP for the bond interface

### Unifi Switch

* Log into the Unifi Controller
* Select **Devices**, then click the respective switch
* Select **Ports** and click on the lowest available port

> **Important**
>
> It should be understood that before proceeding further, Unifi only allows aggregation among consecutive ports. For example, on a 48-port switch, selecting port 47 will require you to also select port 48.

* Once a port is selected, change its operation to **Aggregate** in the **Profile Overrides** section
* Specify the next port as the aggregate port
* Once configured, you will not be able to edit the port profile for the aggregate port

## Results

To verify link aggregation has been established, return to the Synology NAS control panel and check the newly created network interface. The bond interface should have a network status of **2000 Mbps, Full duplex, NTU 1500**.

> **Note**
>
> Link aggregation does not increase the bandwidth for each user/client beyond 110mb/s you would normally get over gigabit ethernet. It will allow multiple concurrent users to achieve an aggregate higher bandwidth by utilizing both ethernet links simultaneously.

## References

* <https://baihuqian.github.io/2021-01-18-secure-home-network-configure-link-aggregation-for-synology-nas-and-unifi-switch/>

