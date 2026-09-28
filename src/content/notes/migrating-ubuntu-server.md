---
title: "Migrating Ubuntu Server: A Comprehensive Guide"
date: "2024-05-03T17:13:12-04:00"
description: "Migrating an Ubuntu server can be a daunting task, but with careful planning and the right tools, it can be accomplished smoothly. This guide provides step-by-step instructions, including backup and r"
topics:
  - linux
  - ubuntu
ail: 0
---
# Migrating Ubuntu Server: A Comprehensive Guide

Migrating an Ubuntu server can be a daunting task, but with careful planning and the right tools, it can be accomplished smoothly. This guide provides step-by-step instructions, including backup and restore processes, along with automation scripts for convenience.

## Backup Process

The backup process ensures that your data is securely stored before migrating to a new server. Follow these steps to create a comprehensive backup:

### Backup /home directory

To safeguard user data, the `/home` directory must be backed up. Utilize the following script to create a compressed archive of the `/home` directory and store it on an external drive:

```bash
#!/bin/bash

# Define directories to backup.
backup_files="/home"
dest="/mnt/external"

# Create archive filename with timestamp.
day=$(date +%A)
hostname=$(hostname -s)
archive_file="$hostname-$day.tgz"

# Start backup process.
echo "Backing up $backup_files to $dest/$archive_file"
date

# Execute backup using tar.
tar czf $dest/$archive_file $backup_files

# Display backup completion.
echo "Backup finished"
date

# Display file sizes in destination directory.
ls -lh $dest
```

#### Backup list of installed apps/packages

Capture a list of all installed packages using dpkg and save it to a text file named packages.txt on the external drive:

```bash
dpkg --get-selections > /mnt/external/packages.txt
```

#### Backup custom repository configurations

Copy the contents of /etc/apt/sources.list and /etc/apt/sources.list.d/ to the external drive to preserve custom repository configurations:

```bash
cp /etc/apt/sources.list /mnt/external/sources.list
cp -r /etc/apt/sources.list.d/ /mnt/external/
```

#### Backup crontab and sudo crontab information

Save the current crontab entries for both user and root to separate files on the external drive:

```bash
crontab -l > /mnt/external/my_crontab
sudo crontab -l > /mnt/external/root_crontab
```

An automation script is provided for convenience:

```bash
#!/bin/bash

# Start backup process.
echo "Starting backup process..."

# Backup /home directory
tar -cvf /mnt/external/home_backup.tar /home

# Backup list of installed apps/packages
dpkg --get-selections > /mnt/external/packages.txt

# Backup custom repo configs
cp /etc/apt/sources.list /mnt/external/sources.list
cp -r /etc/apt/sources.list.d/ /mnt/external/

# Backup crontab and sudo crontab information
crontab -l > /mnt/external/my_crontab
sudo crontab -l > /mnt/external/root_crontab

echo "Backup process completed!"
```

## Restore Process

Once the backup is complete, proceed with the restoration process on the new server:

1. **Install fresh copy of Ubuntu Server**: Install Ubuntu Server on the new machine, ensuring to use the same username and machine name as the old server.

2. **Connect external drive and mount it**: Mount the external drive to access the backup files:

<details>
<summary>example</summary>

```bash
mkdir -p /mnt/external
chown dave:dave /mnt/external
echo "UUID=$UUID /mnt/external exfat defaults 0 0" >> /etc/fstab
mount -a
```

</details>

3. **Install packages**: Restore the previously backed-up list of installed packages using dpkg and apt-get commands:

```bash
dpkg --set-selections < /mnt/external/packages.txt
apt-get dselect-upgrade -y
```

4. **Copy /home directory to new machine**: Extract the backed-up /home directory to the new server's root directory:

```bash
tar -xvf /mnt/external/home_backup.tar -C /
```

5. **Restore sources.list and sources.list.d**: Copy the backed-up repository configurations to the appropriate directories:

```bash
cp /mnt/external/sources.list /etc/apt/
cp -r /mnt/external/sources.list.d/* /etc/apt/sources.list.d/
```

6. **Restore crontabs**: Restore the crontab entries for the user and root:

```bash
crontab /mnt/external/my_crontab
sudo crontab /mnt/external/root_crontab
```

Finally, here's an automated script for the restoration process:

```bash
#!/bin/bash

# Restore instructions
echo "Starting restore process..."

# Mount the external drive
UUID=CHANGE_ME_UUID
mkdir -p /mnt/external
chown dave:dave /mnt/external
echo "UUID=$UUID /mnt/external exfat defaults 0 0" >> /etc/fstab
mount -a

# Install packages
dpkg --set-selections < /mnt/external/packages.txt
apt-get dselect-upgrade -y

# Copy /home directory to new machine
tar -xvf /mnt/external/home_backup.tar -C /

# Restore sources.list and sources.list.d
cp /mnt/external/sources.list /etc/apt/
cp -r /mnt/external/sources.list.d/* /etc/apt/sources.list.d/

# Re-run package installation
dpkg --set-selections < /mnt/external/packages.txt
apt-get dselect-upgrade -y

# Restore crontabs
crontab /mnt/external/my_crontab
sudo crontab /mnt/external/root_crontab

# Reboot to confirm login still works
echo "Rebooting system to confirm everything works as expected..."
reboot
```

Replace `CHANGE_ME_UUID` with the actual UUID of your external drive. You can find the UUID by running the `blkid` command.

### Additional Steps

Certain steps like changing the SSH port, enabling UFW, or logging into NAS are either interactive or require manual verification. It's recommended to execute these steps manually.

Always test these scripts in a safe environment before implementing them in a production environment. Verify your work to ensure data integrity and security.

