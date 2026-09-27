---
title: "How to Add a Module to Polybar"
date: "2021-03-06T17:58:31+00:00"
description: "This article will summarize in general detail how to add a module to Polybar in Manjaro. The sample being used in the article will show how to add a basic status bar that displays the Artist and Song Title from Spotify."
topics:
  - manjaro
  - polybar
ail: 0
---
This article will summarize in general detail how to add a module to Polybar in Manjaro. The sample being used in the article will show how to add a basic status bar that displays the Artist and Song Title from Spotify.

### Considerations

* Polybar configuration files are located in a hidden directory at /home/dave/.config/polybar.
* There is no Polybar GUI to add items as needed.
* Configuration files must be created in order to add modules to Polybar.
* All configuration files must be placed in the **Modules** folder with any appropriate code for the module.
* Module specific information must be added to the **modules.conf** file, as well as the **config.conf** file, as outlined below.

### Obtaining Required Configuration

Most configuration files required for modules can be found on **GitHub**, with this module being no exception.

The configuration file used in the following example can be found at the following link:

[https://github.com/Jvanrhijn/polybar-spotify](https://github.com/Jvanrhijn/polybar-spotify)

Open a terminal window and type the following:

```bash
cd /home/dave/Downloads/polybar
sudo git clone https://github.com/Jvanrhijn/polybar-spotify.git
```

Additional modules outside the scope of this article can be found at the following link:

[https://github.com/TiagoDanin/Awesome-Polybar](https://github.com/TiagoDanin/Awesome-Polybar)

### Spotify Polybar Configuration

In order to configure Spotify, open a Terminal and type the following:

```bash
sudo nano /home/dave/.config/polybar/modules/spotify.conf
```

This will create the required configuration file within the **Modules** directory.

With the configuration file open in the terminal, paste the following syntax into it:

```properties
[module/spotify]
type = custom/script
interval = 1
format-prefix = " "
format = <label>
exec = python /home/dave/Downloads/polybar/polybar-spotify/spotify_status.py -f '{artist}: {song}'
format-underline = #1db954
```

Note that line 6 already has the location of the Python script required to access the **Artist** and **Song** from Spotify. This location will change if the script and additional files were downloaded to a different directory. In this example, the approptiate directory is **/home/dave/Downloads/polybar**.

Write out the configuration file with **Control + O**.

Since the configuration file is created with sudo, it will create the file with **Root** permissions. To ensure it can be read by Polybar, take ownership of the configuration file in Terminal:

```bash
sudo chown dave /home/dave/.config/polybar/modules/spotify.conf
```

### Add Module to Polybar

Although the configuration file has been added to the **Modules** folder, it's not yet available to be added to Polybar. To allow Polybar to see the configuration file, it needs to be added to the **modules.conf** file.

```bash
sudo nano /home/dave/.config/polybar/modules.conf
```

Within the **modules.conf** file, the location of the configuration file needs to be identified. Add the following snippet to the **modules.conf** file and write it out (**Control + O**).

```properties
## Uncomment for spotify module
include-file = $HOME/.config/polybar/modules/spotify.conf
```

Modules that are commented out cannot be added to Polybar until the comment has been removed.

With the configuration file added to the **modules.conf** file, it can now be added to Polybar by way of the **config.conf** file.

```bash
sudo nano /home/dave/.config/polybar/config.conf
```

Open the **config.conf** file and scroll to the bottom. It will show the following:

```properties
modules-left   = manjaro workspaces
modules-center = spotify
modules-right  = pkg redshift memory temperature coreuse pulseaudio clock
```

Each line represents the respective side of the Polybar bar the module should be placed. The order in which the modules are listed will be the order which they are displayed on the Polybar bar. The names of each module should correspond with the names of each configuration file.

In this example, **spotify** has been placed in the **modules-center** section, but it can be moved to the left or right if desired.

Once the desired module has been added to the **config.conf** file, write out the changes (**Control + O**). Polybar will automatically update to reflect the changes.

In this example, Spotify will need to be open and playing a song in order for the module to display in Polybar.

### Troubleshooting

If Polybar does not automatically update, right click on the desktop to bring up the Openbox menu. Select **Preferences --&gt; Polybar --&gt; Restart Polybar**. This will force a refresh and allow Polybar to reload with the desired modules.

There may also be other considerations outside the scope of this article depending on the module being added to Polybar. This may include additional fonts, API(s), as well as respective scripts or module specific configuration files that need to be edited or relocated to different directories. This should all be outlined in the installation instructions for the module on GitHub, GitLab, etc.


