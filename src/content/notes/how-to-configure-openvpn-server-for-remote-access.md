---
title: "How to Configure OpenVPN Server for Remote Access"
date: "2021-03-06T16:34:06+00:00"
description: "The objective is to allow outside access to the LAN network while remote. This guide will provide details on the setup and configuration of the tunnel using OpenVPN Server."
topics:
  - networking
  - pfsense
  - openvpn
ail: 0
---
# How to Configure OpenVPN Server for Remote Access

The objective is to allow outside access to the LAN network while remote. This guide will provide details on the setup and configuration of the tunnel using OpenVPN Server.

### Configuration

To start, navigate to VPN &gt; OpenVPN &gt; Wizards and start the Wizard.

### Authentication

* Choose **Local User Access**, then click **Next**.
* Certificate Authority (CA) Selection
  * Select **Add a new CA**
  * **Descriptive Name**
    * Used as the **Common Name (CN)** for the CA. Should not include any spaces, punctuation or special characters.
  * **Key Length**
    * Leave it at the default (**2048**)
  * **Lifetime**
    * Lifetime of the CA in days. Should be left at the default of **3650**.
  * Enter Country Code, State & City accordingly.
  * Select **Add New CA**

### Server Certificate Selection

* Select **Add New Certificate**
  * Largely the same as the previous step, so information should be populated accordingly.
  * Select **Create New Certificate**

### General OpenVPN Server Information

* **Interface**
  * Interface where OpenVPN will listen for incoming connections, and should be left as **WAN**.
* **Protocol**
  * Select **UDP on IPv4 only**
* **Local Port**
  * Default is 1194.
* **Description**
  * Provide a name for the OpenVPN instance.

### Cryptographic Settings

* **TLS Authentication**
  * Leave this checked
* **Generate TLS Key**
  * Leave this checked
* **TLS Shared Key**
  * Leave blank
* **DH Parameter Length**
  * Leave at the default, which is 2048.
* **Encryption Algorithm**
  * AES-256-GCM
* **Auth Digest Algorithm**
  * SHA256 (256-bit)
* **Hardware Crypto**
  * BSD cryptodev engine

### Tunnel Settings

* **Tunnel Network**
  * This should be a new, unique network that doesn't exist in the current network or routing table.
    * I've selected **192.168.Y.0/24**.
* **Redirect Gateway**
  * Force all client generated traffic through the tunnel. Should be checked.
* **Local Network**
  * This is the network that will be accessible from the remote endpoint.
    * Should be expressed as a CIDR range.
    * I've used **192.168.X.0/24**.
* **Concurrent Connections**
  * Left blank
* **Compression**
  * Select **Omit Preference (Use OpenVPN Default)**
* **Type-of-Service**
  * Leave unchecked
* **Inter-Client Communication**
  * Check this option to allow the ability to administer the network remotely.
* **Duplicate Connections**
  * Leave unchecked

### Client Settings

* **Dynamic IP**
  * Checked
* **Topology**
  * Select **Subnet -- One IP address per client in a common subnet**
* **DNS Default Domain**
  * Leave blank
* **DNS Server:**
  * 185.228.168.9 & 185.228.169.9
* Leave the rest as-is and select **Next**.

### Firewall Rule Configuration

These will automatically add the necessary rules to the firewall to allow these connections.

* **Firewall Rules**
  * Checked
* **OpenVPN Rule**
  * Checked
* Select **Next** and click **Finish** to complete.

### Add User Certificates

* Navigate to **System &gt; User Manager**
  * Click **+Add** to add a new user
  * Populate the **Username, Password** and **Full Name** fields
  * Check the **Click to create a user certificate** check box.
  * Enter the username in the **Descriptive Name** field.
  * Select the correct **Certificate Authority (CA)**.
  * Key Length: **2048 bits**
  * Lifetime: **3650**
  * Click **Save**

### Install the OpenVPN Client Export Package

* Navigate to **System &gt; Packages &gt; Available Packages**
* Find **OpenVPN-Client-Export** in the list and install.

### Export the Configuration

* Navigate to **VPN &gt; OpenVPN &gt; Client Export**
  * Choose the VPN from the **Remote Access Server** dropdown.
  * Leave everything else as the defaults.
  * Find the user in the list at the bottom of the page, and then select the appropriate configuration to export.

### References

[https://www.samueldowling.com/2018/11/27/how-to-configure-an-openvpn-remote-access-server-in-pfsense/](https://www.samueldowling.com/2018/11/27/how-to-configure-an-openvpn-remote-access-server-in-pfsense/)


