---
title: "How to Find What's Using Disk Space in Linux"
date: "2021-03-06T21:42:11+00:00"
description: "This is a quick article that lists commands that can be used to find what's using all the free disk space in a Linux environment."
topics:
  - linux
ail: 0
---
This is a quick article that lists commands that can be used to find what's using all the free disk space in a Linux environment.

### Commands

List *directories* sorted by their size:

```bash
find / -mount -type d -exec du -s "{}" \; | sort -n
```

List *files* sorted by their size:

```bash
find / -mount -printf "%k\t%p\n" | sort -n
```

### Reference

* [https://unix.stackexchange.com/a/314683](https://unix.stackexchange.com/a/314683)


