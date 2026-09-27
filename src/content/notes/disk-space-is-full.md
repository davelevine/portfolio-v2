---
title: "How to Resolve 'Disk Space is Full' Error"
date: "2021-03-06T19:45:42+00:00"
description: "The NAS began experiencing issues such as not being able to update, both automatically and manually, as well as being unable to login. After running the 'df' command in Terminal, the Root partition showed it was at 100% with 0 bytes free. Errors may be thrown related to insufficient disk space or in the case of being unable to login..."
topics:
  - synology
ail: 0
---
The NAS began experiencing issues such as not being able to update, both automatically and manually, as well as being unable to login. After running the 'df' command in Terminal, the Root partition showed it was at 100% with 0 bytes free. Errors may be thrown related to insufficient disk space or in the case of being unable to login...

"You cannot login to the system because the disk space is full currently"

### How to Reclaim Space on Root Partition

Although the NAS will not allow a successful login, it will still allow connections via SSH. I was able to resolve this by doing the following in a Terminal...

```bash
#!/bin/bash

#1. See what partition is full:
df -h

#2. Find largest directories:
du -hax / 2> /dev/null | sort -rh | head -n 20

#3. Find fattest files:
find . -type f -printf "%s\t%p\n" | sort -n | tail -n 20

# then remove the largest unneeded files using the 'admin' password:
# sudo rm -f {files}
```

Once this has been completed, it should allow you to navigate back to the NAS web UI and login.

### Reference on GitHub

[https://gist.github.com/recoder/94f8053c1b5ca7d04557c78f52b921f5](https://gist.github.com/recoder/94f8053c1b5ca7d04557c78f52b921f5)


