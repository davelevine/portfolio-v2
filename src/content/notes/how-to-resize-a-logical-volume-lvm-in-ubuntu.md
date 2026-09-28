---
title: "How to Resize a Logical Volume (LVM) in Ubuntu"
date: "2021-03-06T19:38:00+00:00"
description: "This will serve as a guide for resizing a logical volume in Ubuntu. I've personally done this in 16.04 and 18.04, but should work in nearly any version of Ubuntu."
topics:
  - linux
  - lvm
  - ubuntu
ail: 0
---
# How to Resize a Logical Volume (LVM) in Ubuntu

This will serve as a guide for resizing a logical volume in Ubuntu. I've personally done this in 16.04 and 18.04, but should work in nearly any version of Ubuntu.

### Assumptions

This article assumes that additional space has already been allocated in Xen Center.

### Instructions

*****EDIT*****

The following syntax can streamline the entire resizing process for logical volumes:

```bash
# We need to resize the logical volume to use all the existing and free space of the volume group
$ lvm
lvm> lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
lvm> exit

# And then, we need to resize the file system to use the new available space in the logical volume
$ resize2fs /dev/ubuntu-vg/ubuntu-lv
resize2fs 1.44.1 (24-Mar-2018)
Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 58
The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 120784896 (4k) blocks long.

# Finally, you can check that you now have available space:
$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
udev                               3.9G     0  3.9G   0% /dev
tmpfs                              786M  1.2M  785M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv  454G  3.8G  432G   1% 

#If you didn't customize the LVM settings, the names for the volume group and logical volume should be the same as mine (ubuntu-vg and ubuntu-lv respectively).

#If your partition is completely full, you could get a no space left error when trying to resize the logical volume like:

lvm> lvextend -l 100%FREE /dev/ubuntu-vg/ubuntu-lv
  /etc/lvm/archive/.lvm_computer: write error failed: No space left on device

#The easier way to fix this is by removing apt cache (it will get regenerated next time you do apt update), which should give you more than enough space to complete the operation:

$ rm -rf /var/cache/apt/*
```

See the top post on [Ask Ubuntu](https://askubuntu.com/questions/1106795/ubuntu-server-18-04-lvm-out-of-space-with-improper-default-partitioning) for further details.

### Original Post

After you make the additional space available in VMWare/Xen/Hyper-V, first reboot your Ubuntu server so it can see the new free space.

Run the partition editor to examine the disk

`# parted`

You can see your free space, so let's partition it:

`$ cfdisk`

Pick your free space, select New, then choose a Primary or Logical partition. For a small server, it probably doesn't matter too much, but remember in x86 Linux that you can have a maximum of 4 primary + extended partitions per disk. Beyond that, you'll need to begin adding logical partitions in your extended partitions.

Select the Write command to create the partition, then (if necessary) reboot your system.

When your system comes back up, check on your new partition:

```bash
$ fdisk -l /dev/sda

Disk /dev/sda: 42.5 GB, 21474836480 bytes
255 heads, 63 sectors/track, 2610 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x000d90ee

Device    Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          31      248832   83  Linux
Partition 1 does not end on cylinder boundary.
/dev/sda2              31        1958    15476768    5  Extended
/dev/sda3            1958        2610     5239185   83  Linux
/dev/sda4            2610        3608    16815191   83  Linux <-----
/dev/sda5              31        1958    15476736   8e  Linux LVM
```

So now let's pull it into our LVM configuration. First we'll create the physical volume:

`$ pvcreate /dev/sda4
Physical volume "/dev/sda4" successfully created`

Let's take a look at our physical volumes:

```bash
$ pvdisplay

--- Physical volume ---
PV Name               /dev/sda5  
VG Name               ubuntu-1004  
PV Size               14.76 GiB / not usable 2.00 MiB  
Allocatable           yes (but full)  
PE Size               4.00 MiB  
Total PE              3778  
Free PE               0  
Allocated PE          3778  
PV UUID               f3tYaB-YCoK-ZeRq-LfDX-spqd-ggeV-gdsemo

--- Physical volume ---  
PV Name               /dev/sda3  
VG Name               ubuntu-1004  
PV Size               5.00 GiB / not usable 401.00 KiB  
Allocatable           yes  
PE Size               4.00 MiB  
Total PE              1279  
Free PE               11  
Allocated PE          1268  
PV UUID               rL0QG1-OmuS-d4qL-d9u3-K7Hk-4a1l-NP3DtQ

"/dev/sda4" is a new physical volume of "20.00 GiB"  
--- NEW Physical volume ---  
PV Name               /dev/sda4  
VG Name  
PV Size               20.00 GiB  
Allocatable           NO  
PE Size               0  
Total PE              0  
Free PE               0  
Allocated PE          0  
PV UUID               uaJn0v-HbRz-YKv4-Ez83-jVUo-dfyH-Ky2oHV
```

Now, extend our volume group (ubuntu-1004) into our new physical volume (/dev/sda4):

`$ vgextend ubuntu-1004 /dev/sda4
Volume group "ubuntu-1004" successfully extended`

The whole purpose of this exercise is to expand the root filesystem, so let's find our main logical volume:

```bash
$ lvdisplay   
--- Logical volume ---  
LV Name                /dev/ubuntu-1004/root  
VG Name                ubuntu-1004  
LV UUID                UJQUwV-f3rI-Tsd3-dQYO-exIk-LSpq-2qls13  
LV Write Access        read/write  
LV Status              available  
# open                 1  
LV Size                19.39 GiB  
Current LE             1892  
Segments               1  
Allocation             inherit  
Read ahead sectors     auto  
- currently set to     256  
Block device           254:0
```

Now, let's extend the logical volume to all free space available:

`$ lvextend -l+100%FREE /dev/ubuntu-1004/root`

Next, extend the filesystem:

`$ resize2fs /dev/mapper/ubuntu--1004-root`

Finally, let's check our free space:

```bash
$ df -h
Filesystem            Size  Used Avail Use% Mounted on
/dev/mapper/ubuntu--1004-root                       
                       39G   14G   24G  37% /   <---- 
none                  495M  176K  495M   1% /dev
none                  500M     0  500M   0% /dev/shm
none                  500M   36K  500M   1% /var/run
none                  500M     0  500M   0% /var/lock
none                  500M     0  500M   0% /lib/init/rw
/dev/sda1             228M  144M   72M  67% /boot
```

### Reference

[http://www.geoffstratton.com/expand-hard-disk-ubuntu-lvm](http://www.geoffstratton.com/expand-hard-disk-ubuntu-lvm)


