---
title: solaris disk size
date: 11 Jan 2010
tags:
  - solaris
---

When format command doesn't show the size of a disk...
```
root@audmzweb02:~
 $ echo|format
 Searching for disks...done
AVAILABLE DISK SELECTIONS:
 0. c0t0d0
 /pci@0,0/pci8086,2545@3/pci8086,1460@1d/pci8086,341a@7,1/sd@0,0
 1. c0t1d0
 /pci@0,0/pci8086,2545@3/pci8086,1460@1d/pci8086,341a@7,1/sd@1,0
 Specify disk (enter its number): Specify disk (enter its number):
 root@audmzweb02:~
 $
```


...try the following iostat command to determine disk size...
```
root@audmzweb02:~
 $ iostat -En c0t0d0
 c0t0d0           Soft Errors: 21 Hard Errors: 0 Transport Errors: 0
 Vendor: SEAGATE  Product: ST336607LSUN36G  Revision: 0507 Serial No: XXXXXXXX
 Size: 36.42GB
 Media Error: 0 Device Not Ready: 0 No Device: 0 Recoverable: 21
 Illegal Request: 0 Predictive Failure Analysis: 0 
```
