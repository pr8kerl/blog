---
title: solaris zfs boot mirror
date: 20 Oct 2010
tags:
  - solaris
  - zfs
---



Since Solaris 10 update 8, the OS can be installed on a zfs root pool. It's simple, and flexible. Allowing better use of larger disks.

 

Install the OS as usual specifying the use of a ZFS filesystem. Install on a single disk.

After install, the single boot disk is easily mirrored.

The following shows mirroring c1t0d0 to c1t1d0.

Partition the second disk as per the first disk. This is only necessary if the disk has previously had a partition table installed on it. If a disk is fresh from the factory, ZFS can use it as is and no slice information needs to be given when using the zpool commands.
```
root@aumelmps01:~ 
$ prtvtoc -h /dev/rdsk/c1t0d0s2|fmthard -s - /dev/rdsk/c1t1d0s2
fmthard:  New volume table of contents now in place.
root@aumelmps01:~
```
 

Next, simply attach the second disk to the root pool.
```
root@aumelmps01:~ 
$ zpool attach rpool c1t0d0s0 c1t1d0s0
Please be sure to invoke installboot(1M) to make 'c1t1d0s0' bootable.
```

Make sure to wait until resilver is done before rebooting.
Check the status of the mirror to see if resilver has finished.
```
root@aumelmps01:~ 
$ zpool status
  pool: rpool
 state: ONLINE
 scrub: resilver completed after 0h5m with 0 errors on Wed Oct 20 09:54:00 2010
config:

        NAME          STATE     READ WRITE CKSUM
        rpool         ONLINE       0     0     0
          mirror-0    ONLINE       0     0     0
            c1t0d0s0  ONLINE       0     0     0
            c1t1d0s0  ONLINE       0     0     0  7.39G resilvered

errors: No known data errors
```
 

Finally install the boot block on the new mirror disk
```
  installboot /usr/platform/`uname -i`/lib/fs/zfs/bootblk /dev/rdsk/c1t1d0s0
```
