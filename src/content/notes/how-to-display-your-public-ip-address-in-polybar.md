---
title: "How to Display Your Public IP Address in Polybar"
date: "2021-03-06T17:58:31+00:00"
description: "This article will explain the steps needed in order to display the public IP address of your computer in Polybar."
topics:
  - manjaro
  - polybar
ail: 0
---
This article will explain the steps needed in order to display the public IP address of your computer in Polybar.

### Prerequisites

There are a number of ways to obtain your public IP address, but the tricky part is finding a service that can actually display it properly in Polybar. OpenDNS and Google both used to have sites specifically for this, but have both decommissioned the service.

My favorite way of obtaining my public IP address by far is using `curl ifconfig.io`. It's incredibly slick and gives you just the IP address, without any filler. However, when applied to Polybar, it gives too much information and in my case, seems to overwhelm Polybar either by crashing or by displaying a long error that gets truncated at a certain point.

I was able to locate another service called [IP Echo](https://ipecho.net). They offer a similar service to [ifconfig.io](https://ifconfig.io), but is able to display the IP address properly. The proper syntax for obtaining just the IP address is as follows:

```bash
wget https://ipecho.net/plain -O - -q ; echo
```

This will now need to be added as a Polybar module.

### Creating a Polybar Module

* Open a terminal and navigate to the Polybar modules directory
* Once in the directory, create a new configuration file for the module.

```bash
cd ~/.config/polybar/modules
sudo nano publicip.conf
```

* In the config file, add the following syntax:

```properties
;;;Public IP;;;
[module/publicip]
type = custom/script
exec = wget https://ipecho.net/plain -O - -q ; echo
interval = 100
label = %output%
```

* Save the file.

### Add PublicIP Module to Polybar

Although the config file has been created, it's not yet recognized by Polybar since it hasn't been added to the modules config file.

* Navigate to `~/.config/polybar/` and open `modules.conf`
* Inside the `modules.conf` file, add the following two lines to the file. I added them in alphabetical order, but the order doesn't matter.

```properties
## Uncomment for obtaining ip address
include-file = $HOME/.config/polybar/modules/publicip.conf
```

* Save the file.

Now the module is recognized by Polybar, but it still needs to be recognized inside the config file located at `~/.config/polybar/config`. Once that file is opened, scroll all the way to the bottom and add the module to the specific position you want it to reside on Polybar. I've added PublicIP to the right side of Polybar because it makes sense to me, but it can be added in any location depending on preference.

My config file looks like the following:

```properties
;=====================================================
;     File Includes
;=====================================================

[section/base]
include-file = $HOME/.config/polybar/master.conf
include-file = $HOME/.config/polybar/modules.conf


;=====================================================
;     Openbox Bars
;=====================================================

[bar/openbox-bar]
inherit = bar/master

; Use $ xrandr -q | grep " connected" | cut -d ' ' -f1
monitor =
monitor-fallback =

;tray-position = center
;tray-padding =
;tray-transparent = true
;tray-background = #0063ff

modules-left   = manjaro workspaces
modules-center = spotify
modules-right  = weather pkg redshift memory temperature publicip coreuse pulseaudio clock
```

At this point, reload Polybar and the PublicIP module will now be visible and displaying the proper public IP address.


### References

* [https://dev.to/adityathebe/a-handy-way-to-know-your-public-ip-address-with-dns-servers-4nmn](https://dev.to/adityathebe/a-handy-way-to-know-your-public-ip-address-with-dns-servers-4nmn)
* [https://tecadmin.net/5-commands-to-get-public-ip-using-linux-terminal/](https://tecadmin.net/5-commands-to-get-public-ip-using-linux-terminal/)


