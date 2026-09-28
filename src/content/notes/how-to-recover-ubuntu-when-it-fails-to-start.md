---
title: "How to Recover Ubuntu After Boot Failure"
date: "2021-03-06T19:38:00+00:00"
description: "This page will serve as a quick way to recover Ubuntu should it fail at startup."
topics:
  - linux
  - ubuntu
ail: 0
---
This page will serve as a quick way to recover Ubuntu should it fail at startup.

### How-to

In order to recover a startup failure, use the command `fsck /dev/sdaX`, where X specifies the mounted disk part number.

```bash
(initramfs) fsck /dev/sda1

or

(initramfs) fsck /dev/sdaX
```


