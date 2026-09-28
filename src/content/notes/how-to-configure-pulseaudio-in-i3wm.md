---
title: "How to Configure Pulseaudio in i3wm"
date: "2021-03-06T19:14:13+00:00"
description: "This article will explain how to configure Pulseaudio in i3wm. Doing so will enable the volume for the environment."
topics:
  - manjaro
  - i3wm
  - pulseaudio
ail: 0
---
# How to Configure Pulseaudio in i3wm

This article will explain how to configure Pulseaudio in i3wm. Doing so will enable the volume for the environment.

### Pre-requisites

The following needs to be installed from Pacman:

* Pulseaudio-alsa
* Pulseaudio
* Pulseaudio-bluetooth-a2dp-gdm-fix
* Pulseaudio-bluetooth
* Pulseaudio-equalizer
* PulseAudio Volume Control (pavucontrol)

### Where to Begin

After installing all the pre-requisites, it's likely that although the PulseAudio Volume Control will show that the volume is on and enabled, there won't actually be any sound. Run the following commands to see what state Pulseaudio is actually in prior to moving forward:

`pulseaudio -vvv`

This will likely say that the daemon is already running (as long as the machine has been rebooted), but will also display the following:

`pa_pid_fille_create() failed`

This is likely a permissions issue with the way i3 interacts with Pulseaudio, but there are also additional configurations that need to be made.

### Configuration

Open a terminal and add the following to /etc/pulse/default.pa:

```bash
### Make some devices default
set-default-sink alsa_output.pci-0000_00_14.2.analog-stereo
set-default-source alsa_output.pci-0000_00_14.2.analog-stereo.monitor
```

This will define the audio output, although the permissions will still need to be configured.

### Permissions

* Open **Manjaro Settings Manager** and open **User Accounts**.
* Select the username and then click on the **Account Type** (Administrator), then select **Show Groups**.
* Check the **Member** box for **audio**.
  * This will display a prompt that the following additional groups will also need to be checked
    * optical
    * scanner
    * video
* Apply the configuration changes.
* Since the default permissions have been changed, the original config file will need to regenerate after a reboot, meaning the ~/.config/pulse folder will need to be deleted.
  * Open a terminal and type in `sudo rm -rf ~/.config/pulse`
* Reboot the machine
* Log back in as the user and open a terminal.
* Type in **pulseaudio -v**, which should now display a wall of syntax indicating that Pulseaudio is not only running, but is also operating as it should and playing sound.

### References

[https://bbs.archlinux.org/viewtopic.php?id=209612](https://bbs.archlinux.org/viewtopic.php?id=209612)

[https://bbs.archlinux.org/viewtopic.php?id=159605](https://bbs.archlinux.org/viewtopic.php?id=159605)


