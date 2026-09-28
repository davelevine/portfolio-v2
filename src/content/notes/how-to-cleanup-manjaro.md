---
title: "How to Cleanup Manjaro"
date: "2021-06-18T21:37:54-04:00"
description: "This article is largely a copy/paste from a Gist I found on GitHub regarding how to clean-up any Arch Linux based system. For my needs, I use it to clean-up Manjaro."
topics:
  - manjaro
  - pacman
ail: 0
---
This article is largely a copy/paste from a Gist I found on GitHub regarding how to clean-up any Arch Linux based system. For my needs, I use it to clean-up Manjaro.

> **Contents**
>
> - Clean pkg cache
> - Remove unused packages (orphans)
> - Clean cache in /home
> - Remove old config files
> - Find and Remove
>     - Duplicates
>     - Empty files
>     - Empty directories
>     - Broken symlinks
> - Find Large files

## Clean pkg cache

List packages

```bash
ls /var/cache/pacman/pkg/ | less 
```

Remove all packages except those installed

```shell
sudo pacman -Sc 
```

Remove all files

```shell
sudo pacman -Scc
```

Download manually from archive.

### Automatically remove

```shell
sudo pacman -S pacman-contrib
```

Remove

```shell
paccache -r
```

Systemd timer

Create file in `/etc/systemd/system/paccache.timer` with the following contents:

```properties
[Unit]
Description=Clean-up old pacman pkg cache

[Timer]
OnCalendar=monthly
Persistent=true

[Install]
WantedBy=multi-user.target
```

Enable with `sudo systemctl start paccache.timer`

## Remove unused packages

List unused

```shell
sudo pacman -Qtdq
```

Remove unused

```shell
sudo pacman -R $(pacman -Qtdq)
```

## Clean home cache

Cache is located in `~/.cache`

## Config Files

Stored in `~/.config/`

## Find and remove

Install `rmlint` package with `sudo pacman -S rmlint`.

## References

<https://gist.github.com/rumansaleem/083187292632f5a7cbb4beee82fa5031>
<https://gist.github.com/davelevine/26c5d2c47df3b802b75673dd5388ea28>


