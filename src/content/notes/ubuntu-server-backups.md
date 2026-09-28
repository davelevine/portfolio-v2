---
title: "Ubuntu Server Backups"
date: "2024-05-13T23:53:06-04:00"
description: "This article contains the backup script and the cleanup script for my Xenlab server."
topics:
  - linux
  - cron
ail: 0
---
This article contains the backup script and the cleanup script for my Xenlab server.

## Backup Script

The backup script is located at `/usr/local/bin/backup.sh`.

```bash title="/usr/local/bin/backup.sh"
#!/bin/bash
####################################
#
# Backup to NFS mount script.
#
####################################

# What to backup.
backup_files="/home /var/spool/cron /etc/apt"

# Where to backup to.
dest="/mnt/Backup/Ubuntu-Server"

# Create archive filename.
hostname=$(hostname -s)
timestamp=$(date +'%Y-%m-%d')
archive_file="$hostname-$timestamp.tgz"

# Print start status message.
echo "Backing up $backup_files to $dest/$archive_file"
date
echo

# Backup the files using tar.
tar czf $dest/$archive_file $backup_files

# Print end status message.
echo
echo "Backup finished"
date

# Long listing of files in $dest to check file sizes.
ls -lh $dest
```

## Crontab

Edit the crontab with `sudo crontab -e`:

```bash
## Weekly Backup
0 11 * * 0 bash /usr/local/bin/backup.sh && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid>

## Monthly Backup Cleanup
30 3 1 * * find /mnt/Backup/Ubuntu-Server -name "*tgz" -type f -mtime +30 -delete && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid>
```

## Specifics

* The backup script can be found on my Xenlab server at `/usr/local/bin/backup.sh`.
* It runs weekly on Sunday at 11am.
* Backups are sent to the `/mnt/Backup/Ubuntu-Server` directory, which corresponds to the `/volume2/Files/Ubuntu-Server` directory on my NAS.
* Backups are retained for 30 days.
* A cleanup script is run monthly on the 1st day of each month at 3:30am to purge any archive files over 30 days old.

