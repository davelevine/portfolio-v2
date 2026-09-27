---
title: "How to Setup Bluetooth on Manjaro"
date: "2021-03-06T19:14:13+00:00"
description: "This article will describe how to install, configure and pair Bluetooth devices on Manjaro."
topics:
  - manjaro
  - bluetooth
ail: 0
---
This article will describe how to install, configure and pair Bluetooth devices on Manjaro.

### Installation

There are a number of ways that Bluetooth can be installed on Manjaro, but in this setup, I've used the **Blueman** packages. Additional drivers will be needed for this install, which will be part of the **Bluez** driver set.

Open **Pamac-Manager** and search for **Blueman.** Once located install the following:

* **Bluetooth Manager (blueman)** - Blueman Bluetooth manager
* **Bluetooth Adapters (blueman)** - Set Bluetooth adapter properties
* **Any required dependencies during installation**.

Next, search Pamac-Manager for the following:

* **Bluez** - daemon for the Bluetooth protocol stack
* **Bluez-libs** - deprecated libraries for the Bluetooth protocol stack
* **Bluez-tools** - a set of tools to manage Bluetooth devices for Linux
* **Bluez-utils** - development and debugging utilities for the Bluetooth protocol stack

Since **PulseAudio** is the default sound server installed on Manjaro, the following packages will also be needed:

* **Pulseaudio-bluetooth** - Bluetooth support for PulseAudio
* **Pulseaudio-bluetooth-a2dp-gdm-fix** - fixes the availability of the a2dp profile for Bluetooth headsets

### Pairing

Before attempting to pair a Bluetooth device, make sure that it isn't being blocked by **rfkill**. This can be checked with the **rfkill --list** command. Should a device be blocked, it can be unblocked with **rfkill unblock &lt;device name&gt;**.

With the necessary packages and drivers installed, the basis for Bluetooth functionality exists, but it's not yet enabled.

The exact procedure depends on the devices involved and their input functionality. The following is a general outline of pairing a device using **bluetoothctl**.

Start the **bluetoothctl** interactive command. Input **help** to get a list of available commands.

Enter **power on** to turn the power to the controller on. It is off by default and will turn off again each reboot. This can be changed by updating the **AutoEnable** option in the **Policy** section from **false** to **true**. With the agent being enabled at startup, it will allow for automatic detection of Bluetooth devices at startup.

```bash
sudo nano /etc/blueooth/main.conf
```

```properties
[Policy]
AutoEnable=true
```

At this point, the **Bluetooth Manager (blueman)** should be able to detect and pair any Bluetooth devices in the area, although the MAC Address may be required to know which device is which.

### Manual Configuration (Optional)

Certain devices may require more of a manual process in order to be enabled. Should that be the case, the steps below should assist with the setup process.

* Enter **devices** to get the MAC Address of the device with which to pair.
* Enter device discovery mode with the **scan on** command if the device is not yet on the list.
* Turn the agent on with **agent on** command or choose a specific agent.

If you press **Tab** twice after agent, you should see a list of available agents, e.g. **DisplayOnly,** **KeyboardDisplay,** **NoInputNoOutput,** **DisplayYesNo,** **KeyboardOnly,** off on.

* Enter **pair MAC_address** to do the pairing.
* If using a device without a PIN, one may need to manually trust the device before it can reconnect successfully. Enter **trust MAC_address** to do so.
* Enter **connect MAC_address** to establish a connection.

### Troubleshooting

During the setup process for my Kilburn Bluetooth speaker, I encountered the following error:

```bash
"bluetoothd[778]: a2dp-source profile connect failed for XX:XX:XX:XX:XX:XX: Protocol not available
```

This is caused by a missing Bluetooth library for PulseAudio, specifically, **pulseaudio-bluetooth**. Although this is listed above, I did not initially install this and ran into this issue during the original install.

In order to resolve this, open a terminal and run the following command:

```bash
sudo pacman -S pulseaudio-bluetooth
```

After installation, the PulseAudio server and Bluetooth both need to be restarted for this to take effect.

```bash
sudo killall pulseaudio

sudo pulseaudio --start

sudo systemctl restart bluetooth
```

Try to connect the device again.

### References

[https://wiki.archlinux.org/index.php/Bluetooth](https://wiki.archlinux.org/index.php/Bluetooth)

[https://donjajo.com/bluetooth-fix-a2dp-source-profile-connect-failed-xx-protocol-not-available-linux/](https://donjajo.com/bluetooth-fix-a2dp-source-profile-connect-failed-xx-protocol-not-available-linux/)


