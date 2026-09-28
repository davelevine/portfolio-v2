---
title: "CIFS Dependency Chains with Tailscale"
date: "2025-05-26T13:43:45-04:00"
description: "This configuration enables reliable mounting of CIFS network shares over Tailscale VPN before dependent services start. The setup uses systemd services with proper dependency chains to ensure correct "
topics:
  - linux
  - systemd
  - tailscale
ail: 0
---
## System Overview

This configuration enables reliable mounting of CIFS network shares over Tailscale VPN before dependent services start. The setup uses systemd services with proper dependency chains to ensure correct startup sequence.

## Prerequisites

* Ubuntu Linux server
* Tailscale installed and configured
* Docker (if using containers)
* Samba credentials file

## Component Details

### Credentials File

**Location**: /etc/samba/credentials  
**Permissions**: 600 (readable only by root)  
**Format**:

```ini
username=your_username
password=your_password
domain=your_domain (if applicable)
```

### Mount Script

**Location**: /usr/local/bin/mount-shares.sh  
**Permissions**: 755 (executable)  
**Purpose**: Mounts all CIFS shares after Tailscale is ready

```bash
#!/bin/bash
# Wait for Tailscale
sleep 30

# Mount shares
/bin/mount -t cifs //nas.local/Files /mnt/Backup -o credentials=/etc/samba/credentials,uid=1000,gid=1000,file_mode=0775,dir_mode=0775,iocharset=utf8
/bin/mount -t cifs //nas.local/Plex /mnt/Plex -o credentials=/etc/samba/credentials,uid=1000,gid=1000,file_mode=0775,dir_mode=0775,iocharset=utf8
/bin/mount -t cifs //nas.local/Files/minio /mnt/Minio -o credentials=/etc/samba/credentials,uid=1001,gid=1001,file_mode=0775,dir_mode=0775,iocharset=utf8
```

### CIFS Mounts Service

**Location**: /etc/systemd/system/cifs-mounts.service  
**Purpose**: Systemd service that runs the mount script  
**Dependencies**: network-online.target, tailscaled.service

```ini
[Unit]
Description=Mount CIFS shares
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/mount-shares.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

### Charm Mount Service

**Location**: /etc/systemd/system/mount-charm.service  
**Purpose**: Mounts a squashfs file from a CIFS share  
**Dependencies**: cifs-mounts.service

```ini
[Unit]
Description=Mount charm.li squashfs file
After=network.target remote-fs.target cifs-mounts.service
Requires=cifs-mounts.service
RequiresMountsFor=/mnt/Backup

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/bin/sleep 5
ExecStart=/bin/bash -c 'if ! mountpoint -q /mnt/Backup/operation-charm/lmdb-pages; then mount -o loop -t squashfs /mnt/Backup/operation-charm/lmdb-pages.sqsh /mnt/Backup/operation-charm/lmdb-pages; fi'
ExecStop=/bin/bash -c 'if mountpoint -q /mnt/Backup/operation-charm/lmdb-pages; then umount /mnt/Backup/operation-charm/lmdb-pages; fi'

[Install]
WantedBy=multi-user.target
```

### Docker Service Dependency

**Location**: /etc/systemd/system/docker.service.d/wait-for-mounts.conf  
**Purpose**: Makes Docker wait for all mounts to complete

```ini
[Unit]
After=cifs-mounts.service mount-charm.service
Requires=cifs-mounts.service mount-charm.service
```

## Service Dependency Chain

1. System boot begins
2. Network services initialize
3. Tailscale establishes connection
4. cifs-mounts.service mounts network shares
5. mount-charm.service mounts squashfs file
6. Docker starts
7. Docker containers launch with access to mounted filesystems

## Initial Setup Instructions

### Create Required Directories

```bash
sudo mkdir -p /mnt/Backup /mnt/Plex /mnt/Minio
sudo mkdir -p /etc/samba
```

### Create Credentials File

```bash
# Create and edit the credentials file
sudo nano /etc/samba/credentials
```

Add your credentials in this format:

```ini
username=your_username
password=your_password
domain=your_domain (if applicable)
```

Then set proper permissions:

```bash
sudo chmod 600 /etc/samba/credentials
```

### Create Mount Script

```bash
# Create and edit the mount script
sudo nano /usr/local/bin/mount-shares.sh
```

Add this content to the script:

```bash
#!/bin/bash
# Wait for Tailscale
sleep 30

# Mount shares
/bin/mount -t cifs //nas.local/Files /mnt/Backup -o credentials=/etc/samba/credentials,uid=1000,gid=1000,file_mode=0775,dir_mode=0775,iocharset=utf8
/bin/mount -t cifs //nas.local/Plex /mnt/Plex -o credentials=/etc/samba/credentials,uid=1000,gid=1000,file_mode=0775,dir_mode=0775,iocharset=utf8
/bin/mount -t cifs //nas.local/Files/minio /mnt/Minio -o credentials=/etc/samba/credentials,uid=1001,gid=1001,file_mode=0775,dir_mode=0775,iocharset=utf8
```

Make the script executable:

```bash
sudo chmod +x /usr/local/bin/mount-shares.sh
```

### Create Systemd Services

```bash
# Create the CIFS mounts service
sudo nano /etc/systemd/system/cifs-mounts.service
```

Add this content:

```ini
[Unit]
Description=Mount CIFS shares
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/mount-shares.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Create the charm mount service:

```bash
sudo nano /etc/systemd/system/mount-charm.service
```

Add this content:

```ini
[Unit]
Description=Mount charm.li squashfs file
After=network.target remote-fs.target cifs-mounts.service
Requires=cifs-mounts.service
RequiresMountsFor=/mnt/Backup

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/bin/sleep 5
ExecStart=/bin/bash -c 'if ! mountpoint -q /mnt/Backup/operation-charm/lmdb-pages; then mount -o loop -t squashfs /mnt/Backup/operation-charm/lmdb-pages.sqsh /mnt/Backup/operation-charm/lmdb-pages; fi'
ExecStop=/bin/bash -c 'if mountpoint -q /mnt/Backup/operation-charm/lmdb-pages; then umount /mnt/Backup/operation-charm/lmdb-pages; fi'

[Install]
WantedBy=multi-user.target
```

Create Docker override directory and file:

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d/
sudo nano /etc/systemd/system/docker.service.d/wait-for-mounts.conf
```

Add this content:

```ini
[Unit]
After=cifs-mounts.service mount-charm.service
Requires=cifs-mounts.service mount-charm.service
```

### Enable and Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable cifs-mounts.service
sudo systemctl enable mount-charm.service
sudo systemctl restart docker
```

## Maintenance Tasks

### Adding a New Share

1. Create the mount point: `sudo mkdir -p /mnt/NewShare`
2. Add the mount command to the script:

    ```bash
    sudo nano /usr/local/bin/mount-shares.sh
    ```

3. Test mount: `sudo systemctl restart cifs-mounts.service`

## Updating Credentials

1. Edit credentials file: `sudo nano /etc/samba/credentials`
2. Remount shares: `sudo systemctl restart cifs-mounts.service`

## Adding Service Dependencies

If you have a service that needs to wait for mounts:

```bash
sudo mkdir -p /etc/systemd/system/myservice.service.d/
sudo nano /etc/systemd/system/myservice.service.d/wait-for-mounts.conf
```

Add:

```ini
[Unit]
After=cifs-mounts.service
Requires=cifs-mounts.service
```

## Troubleshooting

### Checking Mount Status

```Bash
# List all mounts
mount | grep cifs

# Check if specific mount point is mounted
mountpoint -q /mnt/Backup && echo "Mounted" || echo "Not mounted"

# List all block devices
lsblk
```

### Service Logs and Status

```bash
# View CIFS mounts service logs
journalctl -u cifs-mounts.service

# View service status
systemctl status cifs-mounts.service
systemctl status mount-charm.service

# View service dependencies
systemctl list-dependencies cifs-mounts.service
```

## Common Issues and Solutions

### Mounts Not Working After Boot

* Check if Tailscale is running: `systemctl status tailscaled`
* Verify network connectivity: `ping nas.local`
* Check service logs: `journalctl -u cifs-mounts.service`

### Permission Issues

* Verify UID/GID in mount options match your user: `id`
* Check credentials file permissions: `ls -la /etc/samba/credentials`
* Test manual mount with verbose output: `mount -v -t cifs //nas.local/Files /mnt/Backup -o credentials=/etc/samba/credentials`

### Docker Containers Can't Access Mounts

* Verify Docker started after mounts: `systemctl show -p After docker.service`
* Check mount ownership: `ls -la /mnt/`
* Check if container user has correct permissions

### Security Considerations

* Credentials file is protected with 600 permissions (root only)
* Mount options specify explicit file/directory permissions
* Tailscale provides encrypted tunnel for CIFS traffic
* Different UID/GID can be set per mount point for isolation

### Backup and Recovery

* Keep a backup of all configuration files:
    * /usr/local/bin/mount-shares.sh
    * /etc/systemd/system/cifs-mounts.service
    * /etc/systemd/system/mount-charm.service
    * /etc/systemd/system/docker.service.d/wait-for-mounts.conf

