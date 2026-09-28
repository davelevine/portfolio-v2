---
title: "How to Mount an NFS Share Drive"
date: "2021-03-06T19:57:20+00:00"
description: "This article will discuss mounting an NFS share drive, as well as configuring the OS to automatically mount it at startup."
topics:
  - linux
  - nfs
ail: 0
---
This article will discuss mounting an NFS share drive, as well as configuring the OS to automatically mount it at startup.

### Installing NFS Client Packages

The package needed to allow Linux to locate NFS shares is called `nfs-utils` and can be installed through a number of different ways that are outlined below depending on OS:

* Installing NFS client on Ubuntu and Debian:

```bash
sudo apt update
sudo apt install nfs-common
```

* Installing NFS client on CentOS and Fedora:

```bash
sudo yum install nfs-utils
```

Installing NFS client on Manjaro and Arch:

```bash
$ sudo pacman -S nfs-utils
```

### Manually Mounting an NFS File System

Use the steps below to manually mount a remote NFS share on your Linux system:

* First, [create a directory](https://linuxize.com/post/how-to-create-directories-in-linux-with-the-mkdir-command/) to serve as the mount point for the remote NFS share:

```bash
sudo mkdir /mnt/backups
```

Mount point is a directory on the local machine where the NFS share is to be mounted.

* Mount the NFS share by running the following command as root or user with [sudo](https://linuxize.com/post/sudo-command-in-linux/) privileges:

```bash
sudo mount -t nfs nas.local:/volume1/backups /mnt/backups
```

Where `nas.local` is the address of the NFS server, `/volume1` is the volume, `/backup` is the directory that the server is exporting and `/mnt/backups` is the local mount point.

On success, no output is produced.

**NOTE**: When you are manually mounting the share, the NFS share mount does not persist after a reboot.

### Automatically Mounting an NFS File System

Generally, you will want to mount the remote NFS directory automatically when the system boots.

The `/etc/fstab` file contains a list of entries that define where how and what filesystem will be mounted on system startup.

To automatically mount an NFS share when your Linux system starts up add a line to the `/etc/fstab` file. The line must include the hostname or the IP address of the NFS server, the exported directory, and the mount point on the local machine

Use the following procedure to automatically mount an NFS share on Linux systems:

Open the `/etc/fstab` file with your [text editor](https://linuxize.com/post/how-to-use-nano-text-editor/):

```bash
sudo nano /etc/fstab
```

Add the following line to the file:

```properties
# <file system>               <dir>       <type>   <options>   <dump>    <pass>
nas.local:/volume1/backups /mnt/backups  nfs      defaults    0       0
```

Where `nas.local` is the address of the NFS server, `/volume1` is the volume, `/backup` is the directory that the server is exporting and `/mnt/backups` is the local mount point.

Run the `mount` command in one of the following forms to mount the NFS share:

```bash
mount /mnt/backups
mount nas.local:/volume1/backups
```

At this point, once the system is rebooted, the file system should automatically be mounted at startup.

### Troubleshooting

If there are any errors when trying to mount the drive, make sure that the NFS client is running. I had a number of strange errors when mounting the backup folder and found the NFS client was stopped. To start the NFS client, open a Terminal and type the following:

```bash
sudo systemctl start nfs-utils.service
```

### Reference

[https://linuxize.com/post/how-to-mount-an-nfs-share-in-linux/](https://linuxize.com/post/how-to-mount-an-nfs-share-in-linux/)


