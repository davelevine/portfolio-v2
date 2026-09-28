---
title: "How to Recover pfSense After Boot Failure"
date: "2022-02-23T22:00:19-05:00"
description: "I recently upgraded pfSense on my XG-7100 DT from version 21.05-RELEASE to 22.01-RELEASE, but found that even though the GUI claimed the upgrade was successful, it failed to finish rebooting."
topics:
  - networking
  - pfsense
ail: 0
---
I recently upgraded pfSense on my XG-7100 DT from version 21.05-RELEASE to 22.01-RELEASE, but found that even though the GUI claimed the upgrade was successful, it failed to finish rebooting.

This will be a quick guide for booting pfSense to a working state should it fail to reboot after an upgrade.

## What Happened?

As I had mentioned, while pfSense claimed that it had successfully completed the upgrade, it failed to finish rebooting. While looking through the logs after I had gotten the unit up and running, I noticed that there was a signal code that was thrown after the reboot...

```php
Feb 21 14:21:40  php-fpm  350  /rc.start_packages: [squid] Stopping any running proxy monitors
Feb 21 14:21:41  xinetd  33691  Starting reconfiguration
Feb 21 14:21:41  xinetd  33691  Swapping defaults
Feb 21 14:21:41  xinetd  33691  readjusting service 6969-udp
Feb 21 14:21:41  xinetd  33691  Reconfigured: new=0 old=1 dropped=0 (services)
Feb 21 14:21:41  php-fpm  350  /rc.start_packages: [squid] Reloading for configuration sync...
Feb 21 14:21:42  php-fpm  350  /rc.start_packages: [squid] Starting a proxy monitor script
Feb 21 14:21:43  check_reload_status  396  Reloading filter
Feb 21 14:21:46  xinetd  33691  Starting reconfiguration
Feb 21 14:21:46  xinetd  33691  Swapping defaults
Feb 21 14:21:46  xinetd  33691  readjusting service 6969-udp
Feb 21 14:21:46  xinetd  33691  Reconfigured: new=0 old=1 dropped=0 (services)
Feb 21 14:21:49  reboot  80724  rebooted by root
Feb 21 14:21:50  syslogd   exiting on signal 15 
```

After digging into this a bit, I found a few references to the issue I was having.

* <https://forum.netgate.com/topic/76075/syslogd-exiting-on-signal-15/3>
* <https://redmine.pfsense.org/issues/4393>

The issue posted on Redmine is now 7 years old at the time of this writing, but still seems plausible. According to Jim Pingle from Netgate...

> This typically happens when you have a corrupted log file. The first attempted write to said log file will crash syslogd. Reset the log files from Status > System Logs, Settings tab.

Unfortunately, I was unable to bring the system back up after a reboot so I couldn't do much about resetting the log file. I had to try a different route.

## Steps Taken

I had initially tried the following, all of which failed...

* Access the unit via the webGUI.
* Pinging the unit
* Connecting my laptop to it directly with a patch cable
* SSH access

## Resolution

At this point, I had only two other choices - connect to it directly with a serial cable or factory reset it should the serial cable not work.

Fortunately, I had a serial to USB cable handy so I connected it directly to my laptop and fired up a terminal. Since I have a Macbook Pro, I used `screen` to access the console, but first I had to determine what the device would show up as.

Netgate has a very comprehensive [guide](https://docs.netgate.com/pfsense/en/latest/solutions/xg-7100/connect-to-console.html) for working with the console that I was able to leverage. The device showed up as they had said on `/dev/cu.SLAB_USBtoUART`.

I used the following to access the console...

`sudo screen /dev/cu.SLAB_USBtoUART 115200`

> **Tip**
>
> Something to note is that after running this command, it may display a blank screen that looks like there's no output. This is likely not the case as there should at least be a flashing cursor. Hit the `Enter` key and the terminal window should display output.

Once I ran the command, I was prompted to setup the interfaces again.

After I entered the interface names, the configuration was rewritten and everything came back up again.

## References

* <https://forum.netgate.com/topic/76075/syslogd-exiting-on-signal-15/3>
* <https://redmine.pfsense.org/issues/4393>
* <https://docs.netgate.com/pfsense/en/latest/solutions/xg-7100/connect-to-console.html>


