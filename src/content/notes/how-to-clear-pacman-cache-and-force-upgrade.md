---
title: "How to Clear Pacman Cache and Force Upgrade"
date: "2021-03-06T19:14:13+00:00"
description: "When trying to update Manjaro, I ran into an issue where Pacman was unable to upgrade due to a corrupted tarball/installer package. The problem was that it did not say which package was corrupted. In this scenario, there were over 200 packages to install, so it would've taken too long to deselect each one and install one-by-one to find the affected package."
topics:
  - manjaro
  - pacman
ail: 0
---
When trying to update Manjaro, I ran into an issue where Pacman was unable to upgrade due to a corrupted tarball/installer package. The problem was that it did not say which package was corrupted. In this scenario, there were over 200 packages to install, so it would've taken too long to deselect each one and install one-by-one to find the affected package.

This article will describe how to resolve this issue and proceed with the system upgrade.

### Considerations

Something to consider before continuing is that the steps below will completely wipe the package manager (pacman) cache, so any packages needing to be installed will need to be re-downloaded. This isn't a big deal, but something that should still be noted.

All mirrors will also be completely refreshed for the particular region the package manager is currently set to.

The cache content can be backed up as well by copying the contents of `/var/cache/pacman/pkg` to another location.

### How-To

In order to clear the entire cache, open a terminal and do the following:

```bash
# Clear the entire cache:

sudo pacman -Scc

#Refresh all mirrors and force pacman upgrade:

sudo pacman-mirrors -f7 && sudo pacman -Syyu
```

At this point, the mirrors will be refreshed and the available upgraded content will begin downloading and installing.

### References

[https://forum.manjaro.org/t/update-fails-invalid-or-corrupted-package/114601](https://forum.manjaro.org/t/update-fails-invalid-or-corrupted-package/114601/2)/2


