---
title: sun lun configuration
date: 6 Feb 2009
tags:
  - solaris
  - storage
---
Some quick reference LUN configuration commands.


Attach HBA(s) to SAN and setup zoning for your storage array(s). Of course, configure your volume/LUN within your storage array using appropriate means (ie Navsphere for EMC, CommandView for EVA etc) and present to your server.

If on Solaris 8, make sure you have the SAN Foundation Kit installed. Available for download from Sun here 

Then scan for the new device…

```
devfsadm -Cc disk
```

…and look for the new disk…

```
cfgadm -al 
```

…and if you know the WWN of the device you have added then it makes things easier…

```
Ap_Id                          Type         Receptacle   Occupant     Condition

c3::210000e08b0aa6fd           unknown      connected    unconfigured unknown
c3::210000e08b0bfa66           unknown      connected    unconfigured unknown
c3::500060e8029cbb08           disk         connected    configured   unknown                    <– this one

c5                             fc-fabric    connected    configured   unknown
c5::210000e08b0cf00f           unknown      connected    unconfigured unknown
c5::210000e08b0e0622           unknown      connected    unconfigured unknown
c5::500060e8029cbb18           disk         connected    configured   unknown                  <– and this one
```

Then the new disk should be visible to the OS. Check quickly using **echo|format**

Then depending on the controller that the LUN is attached to you can configure the disk for multipathing…

```
cfgadm -c configure c3::500060e8029cbb08 c5::500060e8029cbb18
```


…which will automatically set up multipath redundancy (MPxIO) for LUNs visible down both controllers.
 

* To display FC LUN info on Solaris 10…

```
cfgadm -al -o show_SCSI_LUN

Ap_Id                          Type         Receptacle   Occupant     Condition
c3                             fc-fabric    connected    configured   unknown
c3::50060161082006e2,0         disk         connected    configured   unknown
c3::50060161082006e2,1         disk         connected    configured   unknown
c3::50060161082006e2,2         disk         connected    configured   unknown
```

* To display equivalent on Solaris 8,9...

```
cfgadm  -al -o show_FCP_dev c3
Ap_Id                          Type         Receptacle   Occupant     Condition
c3                             fc-fabric    connected    configured   unknown
c3::500060e802c69e1d,17        disk         connected    configured   unknown
c3::500060e802c69e1d,18        disk         connected    configured   unknown
```

For some older Sun enclosures, the luxadm command can be useful. 
But I've only ever used probe. Here are some examples for 
reference.

```
luxadm probe                 (discovers fcal)
luxadm display Enclosure (displays information on fcal box)
luxadm reserve /dev/rdsk/c#t#d#s# (reserves device so it can’t be accessed)
luxadm -e offline /dev/rdsk/c#t#d#s#     (takes a device offline)
luxadm -e bus_quiesce /dev/rdsk/c#t#d#s#    (quiesce the bus)
luxadm -e bus_unquiesce /dev/rdsk/c#t#d#s# (unquiesce the bus)
luxadm -e online /dev/rdsk/c#t#d#s#    (bring the disk device back online)
luxadm release /dev/rdsk/c#t#d#s#    (unreserved the device for use)
luxadm remove_device BAD,f2    (removes a device from slot f2 on enclosure BAD)
luxadm insert_device BAD,f2     (hot plug a new device to slot f2 on enclosure BAD)
```

