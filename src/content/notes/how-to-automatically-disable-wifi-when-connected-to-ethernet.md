---
title: "How to Automatically Disable WiFi When Connected to Ethernet"
date: "2022-06-03T15:18:04-04:00"
description: "This is a bash script that will automatically turn off wifi once an ethernet connection has been established. Additionally, when an ethernet connection has been disabled, the script will automatically turn wifi back on."
topics:
  - macos
ail: 0
---
# How to Automatically Disable WiFi When Connected to Ethernet

This is a bash script that will automatically turn off wifi once an ethernet connection has been established. Additionally, when an ethernet connection has been disabled, the script will automatically turn wifi back on.

## Installation Instructions

In order to make this work, perform the following:

* Create a new bash script and insert the following:

```shell
#!/bin/bash

ETHERNET_DEVICE=en7

NETWORKSETUP=/usr/sbin/networksetup
IFCONFIG=/sbin/ifconfig

WiFi=$($NETWORKSETUP -listallhardwareports | grep -A1 "Wi-Fi" | grep Device | cut -f2 -d' ')

echo "Run $0"
echo "Wifi interface $WiFi"
echo "Ethernet interface $ETHERNET_DEVICE"

EthernetStatus=$($IFCONFIG | grep -A5 $ETHERNET_DEVICE | grep status | cut -f2 -d' ')
echo "Ethernet is currently $EthernetStatus"

if [ "$EthernetStatus" != "active" ]; 
then 
 $NETWORKSETUP -setairportpower $WiFi on
 echo "Wi-Fi set on"
else
 $NETWORKSETUP -setairportpower $WiFi off
 echo "Wi-Fi set off"
fi
```

* Give the script a name...(e.g. `set_wifi_based_on_ethernet.sh`).
* Save the script to `~/.local/bin`.
* Make the script executable with `sudo chmod +x set_wifi_based_on_ethernet.sh`.
* Open crontab with `crontab -e`.
* Add a new line with the following:

```shell
*/1 * * * * ~/.local/bin/set_wifi_based_on_ethernet.sh
```

* Save the updated crontab and confirm the script is working with the following sanity checks:
  * Connect ethernet cable; wifi should be disabled within one minute.
  * Disconnect ethernet cable; wifi should be enabled within one minute.

## A Few Things to Note

* Modify the `ETHERNET_DEVICE` with your respective device found in `ifconfig`. Mine happens to be `en7`, which is the Belkin USB-C LAN connection to my 2021 MBP.
* Save the script to the `~/.local/bin` folder and make it executable.
* The script will not run automatically by default. I have it running every minute with crontab (`crontab -e`), but it can be adjusted accordingly depending on your needs.

## References

* <https://gist.github.com/albertbori/1798d88a93175b9da00b>
* <https://talk.macpowerusers.com/t/turn-wifi-on-off-based-on-ethernet-status/26622/5>


