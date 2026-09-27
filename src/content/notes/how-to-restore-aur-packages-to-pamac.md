---
title: "How to Restore AUR Packages to Pamac"
date: "2021-06-25T13:08:38-04:00"
description: "I ran into an issue where the Pamac GUI wasn't displaying all packages from the AUR. I tried the following, but it didn't resolve the issue:"
topics:
  - manjaro
  - pacman
ail: 0
---
I ran into an issue where the Pamac GUI wasn't displaying all packages from the AUR. I tried the following, but it didn't resolve the issue:

* Rebooting the computer
* Refreshing the Pamac database

The following is a guide for how to resolve this issue.

## Steps to Resolve

### Clean the package cache using Paccache

```bash
sudo ls /var/cache/pacman/pkg/ | wc -l
```

```bash
du -sh /var/cache/pacman/pkg/
```

To clean all packages, except the 3 most recent versions, run the following command:

```bash
sudo paccache -r
```

Check again how many packages are left in the cache folder.

```bash
sudo ls /var/cache/pacman/pkg/ | wc -l
```

Now, check the total disk space used by the cache folder.

```bash
du -sh /var/cache/pacman/pkg/
```

Use the following pacman command to remove all uninstalled packages:

```bash
sudo pacman -Sc
```

## Next Steps

At this point, the missing packages were still not appearing in the Pamac GUI. The closest I can get to an understanding is that I had outdated mirrors that were being used and were not providing the proper packages. This required the following manual intervention...

### Manual Intervention

Check the output of the following command:

```bash
ls -al /etc/pacman-*
```

The output should look like the following:

`-rw-r--r-- 1 root root 860 Mar 28 14:10 /etc/pacman-mirrors.conf`

Once this is confirmed, run the following:

```bash
sudo pacman-mirrors -f5 && sudo pacman -Syyu
```

This should refresh all the mirrors and perform a complete update and database sync. Once completed, restart Pamac.

## References

* <https://archived.forum.manjaro.org/t/pamac-not-showing-any-aur-packages/135107/25>
* <https://archived.forum.manjaro.org/t/another-mirror-transition-manual-intervention-required/132302>
* <https://ostechnix.com/recommended-way-clean-package-cache-arch-linux/>


