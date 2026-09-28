---
title: "How to Automatically Restart an OpenVPN Tunnel on pfSense"
date: "2021-03-06T16:34:06+00:00"
description: "This article will discuss a cron job that I setup to automatically restart my OpenVPN tunnel should it become disconnected for any reason."
topics:
  - networking
  - pfsense
  - openvpn
ail: 0
---
This article will discuss a cron job that I setup to automatically restart my OpenVPN tunnel should it become disconnected for any reason.

### How-To

In order to set this up, ssh into pfSense

```bash
ssh admin@<pfsense-ip>
```

Jump into the console and use Vi to create a shell script.

```vim
vi chkOvpn.sh
```

Insert the following script:

```sh
#!/usr/bin/env sh
if /sbin/ping -c 3 <vpn-gateway-ip>; then
    # Success, Nothing to do
    exit 0
else
    # Fail, Reconnect VPN
    /usr/local/sbin/pfSsh.php playback svc restart openvpn client 2
fi
exit 1
```

> **Info**
>
> The IP address being pinged is the private gateway for the OpenVPN client. Also, the numerical value (ID) for the openvpn client (2) is found in the OpenVPN config files.

```shell
/var/etc/openvpn/client{ID}.conf then use ID into script
```

Make the script executable with `chmod +x chkOvpn.sh`.

The following should be done in a browser:

* Open pfSense in a browser and navigate to **Services --&gt; Cron --&gt; Settings**.
* Add a new cron job.

```bash
/root/chkOvpn.sh > /dev/null
```

* Adjust the parameters as needed, although the crontab would look like this:

```bash
*/5 * * * * /root/chkOvpn.sh > /dev/null
```

### Adding Healthchecks.io

A worthwhile way to make sure the cron job is running and doesn't silently fail is to have the job ping healthchecks.io each time it runs. The specifics of configuring the check on healthchecks.io is outside the scope of this article. This addition can be done as follows:

* Create a new check on healthchecks.io
* Obtain the link it generates for the new job.
* Go back to pfSense and modify the cron job syntax so that it looks like the following:

```bash
/root/chkOvpn.sh > /dev/null && curl -fsS --retry 3 -o /dev/null https://hc-ping.com/<uuid>
```

* Check the healthchecks.io site and make sure the job is pinging successfully.

### References

* [https://zercle.tech/2017/10/pfsense-openvpn-client-auto-reconnect/](https://zercle.tech/2017/10/pfsense-openvpn-client-auto-reconnect/)
* [https://www.foxypossibilities.com/2018/05/23/reestablish-pfsense-openvpn-clients-with-cron/](https://www.foxypossibilities.com/2018/05/23/reestablish-pfsense-openvpn-clients-with-cron/)


