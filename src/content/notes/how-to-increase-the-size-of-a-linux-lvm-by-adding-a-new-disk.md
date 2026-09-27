---
title: "How to Increase the Size of a Linux LVM by Adding a New Disk"
date: "2021-03-06T21:53:07+00:00"
description: "This article will explain in detail how to add a new virtual disk to an existing VM and add the storage to the existing logical volume so it can be utilized as one large disk."
topics:
  - linux
  - lvm
ail: 0
---
This article will explain in detail how to add a new virtual disk to an existing VM and add the storage to the existing logical volume so it can be utilized as one large disk.

### Adding a New Virtual Disk

Open XCP-ng Center and do the following:

* Select the VM the virtual disk will be added to.
* Click on the **Storage** tab and click **Add...**
* Give the new disk a name and select the amount of storage in GB, then click **Add**.
* Take note of the device path for the new disk
  * ex. `/dev/xvdb`
* The disk should be detected automatically from within the VM, but in case it doesn't, reboot the VM.

### Partition the New Disk

We now need to partition the new **`/dev/xvdb`** disk so that it can be used. This is done by using `fdisk -l`, which will confirm the correct path for the disk and output the following:

```shell
─[root@server]─[~]
└──╼ #fdisk -l
Disk /dev/xvda: 2 TiB, 2147483648000 bytes, 4194304000 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x5ad16edb

Device     Boot   Start        End    Sectors  Size Id Type
/dev/xvda1         2048    1499135    1497088  731M 83 Linux
/dev/xvda2      1501182 4194303999 4192802818    2T  5 Extended
/dev/xvda5      1501184 4194303999 4192802816    2T 8e Linux LVM




Disk /dev/mapper/ubuntu--vg-root: 2 TiB, 2145688485888 bytes, 4190797824 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/ubuntu--vg-swap_1: 976 MiB, 1023410176 bytes, 1998848 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/xvdb: 1.5 TiB, 1610612736000 bytes, 3145728000 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 127CFA13-9DC6-4366-93C6-B36B5134C371
```

Now run **`fdisk`** again, but add the path to the disk.

* Use **'n'** to add a new partition and select 1 for the **Partition number**.
* Use the defaults for First and Last sector.
* Use **‘t’**  to change to a partitions system ID. In this case, this can be set to **’1′** automatically as this is currently the only partition.
* For the **Hex Code**, since this disk will be added to the existing logical volume, the **Id** can be noted from the **Linux LVM** listed above:

```shell
Device     Boot   Start        End    Sectors  Size Id Type
/dev/xvda1         2048    1499135    1497088  731M 83 Linux
/dev/xvda2      1501182 4194303999 4192802818    2T  5 Extended
/dev/xvda5      1501184 4194303999 4192802816    2T 8e Linux LVM
```

* In this case, use the **Hex** Code for **`/dev/xvda5`**.
* Use **'w'** for writing the table to the disk. This will also close **`fdisk`**.

All the above steps should read like the following:

```shell
─[root@server]─[~]
└──╼ #fdisk /dev/xvdb 

Welcome to fdisk (util-linux 2.27.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): n
Partition number (1-128, default 1): 1
First sector (34-3145727966, default 2048): 
Last sector, +sectors or +size{K,M,G,T,P} (2048-3145727966, default 3145727966): 

Created a new partition 1 of type 'Linux filesystem' and of size 1.5 TiB.

Command (m for help): t
Selected partition 1
Hex code (type L to list all codes): 8e
Type of partition 1 is unchanged: Linux filesystem.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

### Increasing the Logical Volume

A physical volume will also need to be created to be added to the logical volume. This can be done with the **`pvcreate`** command.

```shell
┌─[root@server]─[~]
└──╼ #pvcreate /dev/xvdb1
  Physical volume "/dev/xvdb1" successfully created
```

Now confirm the name of the current volume group using the **`vgdisplay`** command. The real focus will be on the **VG Name** line for the rest of this article.

```shell
[root@server]─[~]
└──╼ #vgdisplay
  --- Volume group ---
  VG Name               ubuntu-vg
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  8
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               1.95 TiB
  PE Size               4.00 MiB
  Total PE              511816
  Alloc PE / Size       511816 / 1.95 TiB
  Free  PE / Size       0 / 0   
  VG UUID               EbOeff-YgpZ-f1w5-8HUh-ZScb-8pIH-i0ftwn
```

The **`vgextend`** command can now be used to extend the volume group by adding the physical volume of **`/dev/xvdb1`**.

```shell
[root@server]─[~]
└──╼ #vgextend ubuntu-vg /dev/xvdb1
  Volume group "ubuntu-vg" successfully extended
```

Use the **`pvscan`** command to scan all the disks for physical volumes. The result of the scan should list the original volume of **`/dev/xvda5`** and the newer volume of **`/dev/xvdb1`**.

```shell
─[root@server]─[~]
└──╼ #pvscan
  PV /dev/xvda5   VG ubuntu-vg       lvm2 [1.95 TiB / 0    free]
  PV /dev/xvdb1   VG ubuntu-vg       lvm2 [1.46 TiB / 1.46 TiB free]
  Total: 2 [3.42 TiB] / in use: 2 [3.42 TiB] / in no VG: 0 [0   ]
```

Finally, confirm the name of the logical volume using the **`lvdisplay`** command.

```shell
[root@server]─[~]
└──╼ #lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/root
  LV Name                root
  VG Name                ubuntu-vg
  LV UUID                VrCKdY-vEA8-WFRd-gisu-XD9Z-LFDQ-XGFdfq
  LV Write Access        read/write
  LV Creation host, time ubuntu, 2019-04-12 00:18:59 -0400
  LV Status              available
  # open                 1
  LV Size                1.95 TiB
  Current LE             511572
  Segments               2
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0
```

The logical volume will now need to be extended using the **`lvextend`** command. This will extend the original volume of **`/dev/xvda5`** over the newer volume of **`/dev/xvdb1`**.

```shell
─[root@server]─[~]
└──╼ #lvextend /dev/ubuntu-vg/root /dev/xvdb1 
  Size of logical volume ubuntu-vg/root changed from 1.95 TiB (511572 extents) to 3.42 TiB (895571 extents).
  Logical volume root successfully resized.
```

Run the **`lvdisplay`** command again, which should now display the increased volume size from both volumes, now one volume.

```shell
[root@server]─[~]
└──╼ #lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/root
  LV Name                root
  VG Name                ubuntu-vg
  LV UUID                VrCKdY-vEA8-WFRd-gisu-XD9Z-LFDQ-XGFdfq
  LV Write Access        read/write
  LV Creation host, time ubuntu, 2019-04-12 00:18:59 -0400
  LV Status              available
  # open                 1
  LV Size                3.42 TiB
  Current LE             895571
  Segments               3
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0
```

Although the volume is now listing the correct volume size, that size is not yet usable until the **`resize2fs`** command is run. This will allow the system to make use of this new space.

```shell
─[root@server]─[~]
└──╼ #resize2fs /dev/ubuntu-vg/root 
resize2fs 1.42.13 (17-May-2015)
Filesystem at /dev/ubuntu-vg/root is mounted on /; on-line resizing required
old_desc_blocks = 125, new_desc_blocks = 219
The filesystem on /dev/ubuntu-vg/root is now 917064704 (4k) blocks long.
```

The LVM has now been properly resized and is now usable by the VM. This can be confirmed with the **`df -h`** command, making note of the volume group - **`/dev/mapper/ubuntu--vg-root`**.

```shell
[root@server]─[~]
└──╼ #df -h
Filesystem                   Size  Used Avail Use% Mounted on
udev                         7.8G     0  7.8G   0% /dev
tmpfs                        1.6G  9.2M  1.6G   1% /run
/dev/mapper/ubuntu--vg-root  3.4T  1.4T  1.9T  41% /
tmpfs                        7.9G  120K  7.9G   1% /dev/shm
tmpfs                        5.0M     0  5.0M   0% /run/lock
tmpfs                        7.9G     0  7.9G   0% /sys/fs/cgroup
/dev/xvda1                   720M  141M  543M  21% /boot
nas.local:/volume1/Plex     15T  6.3T  8.1T  44% /mnt/Plex
tmpfs                        1.6G   56K  1.6G   1% /run/user/1000
```

### References

[https://www.rootusers.com/how-to-increase-the-size-of-a-linux-lvm-by-adding-a-new-disk/](https://www.rootusers.com/how-to-increase-the-size-of-a-linux-lvm-by-adding-a-new-disk/)


