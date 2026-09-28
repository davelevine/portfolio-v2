---
title: "How to Change the Login Template"
date: "2021-03-06T19:14:13+00:00"
description: "This article will discuss how to adjust the login template using LXDM, which is responsible for providing the default login screen at startup."
topics:
  - manjaro
  - openbox
ail: 0
---
This article will discuss how to adjust the login template using LXDM, which is responsible for providing the default login screen at startup.

### Manually Edit the Configuration File

In order to modify the login template, it's necessary to reconfigure the *LXDM configuration file* (`lxdm.conf`) using the terminal. The syntax of the command to open the LXDM configuration file is:

```bash
sudo nano /etc/lxdm/lxdm.conf
```

### Configuration Changes

For the sake of not needing to rewrite what's already been written very well, the following will be a cut/paste from the [Manjaro wiki page on LXDM configuration](https://wiki.manjaro.org/index.php/LXDM_Configuration) of some of the more useful configuration changes:


