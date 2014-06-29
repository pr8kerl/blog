---
title: linux software raid rebuild
date: 4 Jan 2009
tags:
  - linux
  - raid
---

Recently I had a server with a failed disk. It was a simple raid1 setup to mirror the OS. 
Replace the disk, then rebuild the raidset as follows…


* After replacing the drive,  partition the new disk to match the primary in the mirror.

```
 box ~ # sfdisk -d /dev/sda|sfdisk /dev/sdb 
```

* Then to rebuild the raidset, simply re-add the partition or device.

```
 mdadm /dev/md3 -a /dev/sdb3
```

* You will then see the rebuild progress in /proc/mdstat

```
box ~ # cat /proc/mdstat 
Personalities : [linear] [raid0] [raid1] 
md1 : active raid1 sdb1[1] sda1[0]
      104320 blocks [2/2] [UU]
md3 : active raid1 sdb3[2] sda3[0]
      9775488 blocks [2/1] [U_]
      [===================>.]  recovery = 99.1% (9689536/9775488) finish=0.0min speed=72936K/sec
md4 : active raid0 sdb4[1] sda4[0]
      290808448 blocks 64k chunks
unused devices: 
```

> Note that in display above,  UU shows that the mirror is complete. Any raidset with U_ shows that the raidset is missing a device.

It's always nice to know when a disk in a raidset has failed. So you can setup a notification via email by adding this to cron:

```
 0,30 * * * *  /sbin/mdadm --monitor -1 -m  notify@concerned.admin -scan 
```

And you can test your email alerts beforehand using this:

```
 mdadm --monitor -1 -m  notify@concerned.admin /dev/md4 -t
```
