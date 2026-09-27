---
title: "How to Restart Mullvad Daemon After Update"
date: "2021-03-06T19:14:13+00:00"
description: "After the **Mullvad-VPN** package gets updated via the AUR, the application will often be unable to start because the service is not running."
topics:
  - linux
  - mullvad
  - systemd
ail: 0
---
After the **Mullvad-VPN** package gets updated via the AUR, the application will often be unable to start because the service is not running.

### How to Resolve

Should the **Mullvad-VPN** package be updated and not automatically start the services, it can be resolved with one or more of the following commands:

`# systemctl enable mullvad-daemon`  
`# systemctl start mullvad-daemon`

Restart the Mullvad application.

Should the application still fail to launch, the service may be running, but stuck. Use the following command to restart the service.

`# systemctl restart mullvad-daemon`

### References

[https://forum.manjaro.org/t/mullvad-vpn-app-stuck-on-connecting-to-daemon/58144](https://forum.manjaro.org/t/mullvad-vpn-app-stuck-on-connecting-to-daemon/58144)


