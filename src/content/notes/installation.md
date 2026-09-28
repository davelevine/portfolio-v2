---
title: "How to Install Mabox Linux"
date: "2022-02-13T18:05:12-05:00"
description: "I had been putting off installing Mabox Linux for some time now as my Manjaro setup was working for my needs. While there were a number of things that were no longer functioning for one reason or another, I had come to truly love my setup and didn't want to part with it."
topics:
  - linux
  - mabox
ail: 0
---
I had been putting off installing Mabox Linux for some time now as my Manjaro setup was working for my needs. While there were a number of things that were no longer functioning for one reason or another, I had come to truly love my setup and didn't want to part with it.

The setup hit a wall in January when I could no longer update the OS without breaking large swaths of it. This was due to a significant number of Python updates that came from upstream. While certain things worked, others came grinding to a halt and would no longer function.

It became clear that I could no longer continue with this setup without either never updating it again or living with a largely broken OS.

Since Mabox Linux is a respin of Manjaro Openbox, I decided it was time. I backed up and made note of as much as I could prior to wiping it out.

The following is a high-level overview of the installation process.

## Installation

At the time of this writing, the current version of Mabox Linux is 22.02 Herbolth. The ISO was downloaded from the [Mabox Repo](https://repo.maboxlinux.org/iso/mabox-linux-22.02-Herbolth-220208-linux515.iso). Once downloaded, I flashed it to a flash drive using [Balena Etcher](https://www.balena.io/etcher/).

The installation was straightforward and I was up and running within ~10 mins.

## Configuration

After the first run, the Mabox Welcome Screen came up and offered some basic actions such as:

* Update system
* Install additional kernel
* Install popular applications

There are certain things that came pre-installed that are nice to have, but I decided not to use. Some of these are:

* Conky
* Side panel menus

### Status bar

The main panel is [Tint2](https://gitlab.com/o9000/tint2), which is a great panel and incredibly useful without much additional configuration. I decided to use it, but to keep it hidden at the bottom of the screen in favor of [Polybar](https://github.com/polybar/polybar) at the top.

Some of the themes that contributed to my Polybar build are as follows:

* <https://github.com/aufarijaal/dracula-polybar>
* <https://github.com/marioortizmanero/polybar-pulseaudio-control>
* <https://github.com/Fernand117/docfiles>
* <https://github.com/raven2cz/polybar-config>
* <https://ant.lgbt/posts/dev/polybar-system-monitor/>
* <https://github.com/blackinitial/openbox_dotfiles>

### Themes

One of the nicest things about using Mabox Linux is that it comes with pre-configured themes using the BLOB Theme Manager from BunsenLabs. This made it very easy to configure my system with the [Dracula theme](https://draculatheme.com).

The only modification to the stock Dracula theme I made is to the icons. They can be found in the following repo...

<https://github.com/m4thewz/dracula-icons>

## Additional Configurations

I've made additional configurations that pertain to my workflow, such as keybindings, default applications, terminal configurations, etc. These can be found in the Configurations article.

## References

* <https://maboxlinux.org>
* <https://github.com/polybar/polybar>
* <https://github.com/m4thewz/dracula-icons>
* <https://github.com/aufarijaal/dracula-polybar>
* <https://github.com/marioortizmanero/polybar-pulseaudio-control>
* <https://github.com/Fernand117/docfiles>
* <https://github.com/raven2cz/polybar-config>
* <https://ant.lgbt/posts/dev/polybar-system-monitor/>
* <https://github.com/blackinitial/openbox_dotfiles>
* <https://gitlab.com/o9000/tint2>
* <https://repo.maboxlinux.org/iso/mabox-linux-22.02-Herbolth-220208-linux515.iso>
* <https://www.balena.io/etcher/>


