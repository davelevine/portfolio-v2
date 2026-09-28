---
title: "Dunst"
date: "2021-03-06T19:14:13+00:00"
description: "Dunst is the notification daemon used for my Manjaro Openbox configuration. It's lightweight and is controlled by a configuration file, which can be found at `~/.config/dunst/dunstrc`. This page will list two separate Dunst configuration files - one is the original, out of box configuration file, while the other is a slightly modified version that I'm currently using as of 2/25/21. The only two things that have changed in the modified version is the timeout, as well as the background hex color to be more in line with the overarching Dracula theme."
topics:
  - manjaro
  - dunst
ail: 0
---
Dunst is the notification daemon used for my Manjaro Openbox configuration. It's lightweight and is controlled by a configuration file, which can be found at `~/.config/dunst/dunstrc`. This page will list two separate Dunst configuration files - one is the original, out of box configuration file, while the other is a slightly modified version that I'm currently using as of 2/25/21. The only two things that have changed in the modified version is the timeout, as well as the background hex color to be more in line with the overarching Dracula theme.

When making changes to the config file, Dunst will not automatically reload with the changes. The [official workaround](https://github.com/dunst-project/dunst/issues/63#issuecomment-35873908) states that it should be killed, which is fine since dbus will automatically restart it. Once it's killed, a test notification can be sent to confirm it actually restarted without any issues. The syntax to do this is `killall dunst;notify-send foo`.

### Original

Can be found at `~/.config/dunst/dunstrc-backup`

```properties
[global]
    font = Roboto Regular 11
    markup = yes
    format = "<b>%s</b>\n%b"
    sort = yes
    indicate_hidden = yes
    alignment = center
    bounce_freq = 0
    show_age_threshold = 60
    word_wrap = yes
    ignore_newline = no
    geometry = "400x10-20+40"
    shrink = yes
    transparency = 0
    idle_threshold = 0
    #monitor = 0
    follow = mouse
    sticky_history = yes
    history_length = 20
    show_indicators = no
    line_height = 0
    separator_height = 2
    padding = 10
    horizontal_padding = 20
    frame_color = "#16A085"
    separator_color = frame
    frame_width = 1
    startup_notification = false
    dmenu = /usr/bin/dmenu -p dunst:
    browser = /usr/bin/chromium
    icon_position = left
    icon_path = /usr/share/icons/gnome/16x16/status/:/usr/share/icons/gnome/16x16/devices/

[shortcuts]

[urgency_low]
    background = "#29353B"
    foreground = "#c0c5ce"
    timeout = 10

[urgency_normal]
    background = "#29353B"
    foreground = "#c0c5ce"
    timeout = 10

[urgency_critical]
    background = "#29353B"
    foreground = "#bf616a"
    frame_color = "#bf616a"
    timeout = 0
```

### Modified

Can be found at `~/.config/dunst/dunstrc`

```properties
[global]
    font = Roboto Regular 11
    markup = yes
    format = "<b>%s</b>\n%b"
    sort = yes
    indicate_hidden = yes
    alignment = center
    bounce_freq = 0
    show_age_threshold = 60
    word_wrap = yes
    ignore_newline = no
    geometry = "400x10-20+40"
    shrink = yes
    transparency = 0
    idle_threshold = 0
    #monitor = 0
    follow = mouse
    sticky_history = yes
    history_length = 20
    show_indicators = no
    line_height = 0
    separator_height = 2
    padding = 10
    horizontal_padding = 20
    frame_color = "#16A085"
    separator_color = frame
    frame_width = 1
    startup_notification = false
    dmenu = /usr/bin/dmenu -p dunst:
    browser = /usr/bin/chromium
    icon_position = left
    icon_path = /usr/share/icons/gnome/16x16/status/:/usr/share/icons/gnome/16x16/devices/

[shortcuts]

[urgency_low]
    background = "#282a36"
    foreground = "#c0c5ce"
    timeout = 10

[urgency_normal]
    background = "#282a36"
    foreground = "#c0c5ce"
    timeout = 10

[urgency_critical]
    background = "#282a36"
    foreground = "#bf616a"
    frame_color = "#bf616a"
    timeout = 0
```


