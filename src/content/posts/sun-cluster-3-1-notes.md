---
title: sun cluster 3.1 notes
date: 6 Feb 2009
tags:
  - sun
  - cluster
---


A bit old, but nonetheless… Some notes I took when administering a Sun Cluster 3.1 installation.

## delete a metaset...
* check status

```
 metastat -p -s atlantisds
 ```

* remove all soft partitions and concats...

```
 metaclear -s atlantisds d1
 metaclear -s atlantisds d2
 metaclear -s atlantisds d3
 metaclear -s atlantisds d0
```

* remove all disks from the metaset...

```
 metaset -s atlantisds -d /dev/did/rdsk/d5
```

* you might have to force it "-f"

```
 metaset -s atlantisds -d -f /dev/did/rdsk/d5
```

* remove all hosts from diskset

```
 metaset -s atlantisds -d -h marlin
 metaset -s atlantisds -d -h manta
 metaset -s atlantisds -d -f -h mulloway
```

* check that the diskset no longer exists

```
 metaset
 scstat -D
```

## create a new diskset
* create metaset and mediators

```
 metaset -s ds03 -a -h mulloway manta marlin
 metaset -s ds03 -a -m mulloway manta
```

* add disk to the metaset

```
 metaset -s ds03 -a /dev/did/rdsk/d5
```

* check status

```
 metaset -s ds03
 metadb -s ds03
 medstat -s ds03
```

* create the first concat

```
 metainit -s ds03 d0 1 1 /dev/did/rdsk/d5s0
```

* create soft partitions

```
 metainit -s ds03 d1 -p d0 100m
 metainit -s ds03 d2 -p d0 2g
 metainit -s ds03 d3 -p d0 2g
 metainit -s ds03 d4 -p d0 1.5g
```

## create resource group

* define the RG

```
 scrgadm -a -g atlantis -h mulloway,manta,marlin -y RG_description="Test Control-M Server"
```

* create StoragePlus resource

```
 scrgadm -a -j atlantis-ds03 -t SUNW.HAStoragePlus -g atlantis \
 -x FileSystemMountPoints=/opt/atlantis,/opt/controlm/server,/oradata/ATLANTIS \
 -x AffinityOn=true
```

* create logical hostname resource

```
 scrgadm -a -L  -g atlantis -j atlantis-ip -l atlantis
```

* create the generic application resource

```
 scrgadm -a -j atlantis-app -t EUM.genapp -g atlantis -y Resource_dependencies=atlantis-ds03
```

## Resource Group commands
* check status of all resource groups/resources

```
 scstat -g
```
* shutdown a resource group
 scswitch -F -g
* start a resource group
 scswitch -Z -g
* failover a resource group to another node
 scswitch -z -g -h
* restart a resource group
 scswitch -R -g -h
* evacuate all resources and resource groups from a node
 scswitch -S -h

## Resource commands
* disable a resource and its fault monitor
 scswitch -n -j
* enable a resource and its fault monitor
 scswitch -e -j
* clear the STOP_FAILED flag of a resource
 scswitch -c -j -h -f STOP_FAILED
## cluster commands
* shutdown the entire custer
 scshutdown
* View properties of Resource Groups/Resources
 Use "-v" to increase verbosity
 scrgadm -p -g
 scrgadm -p -j

## Add a new LUN on the fly...
* probe/display all fibre attached devices
 cfgadm -al
* look for the WWN numbers given by storage
Ap_Id                          Type         Receptacle   Occupant     Condition
 N0.IB6                         PCI_I/O_Boa  connected    configured   ok
 N0.IB6::pci0                   io           connected    configured   ok
 N0.IB6::pci1                   io           connected    configured   ok
 N0.IB6::pci2                   io           connected    configured   ok
 N0.IB6::pci3                   io           connected    configured   ok
 N0.SB0                         CPU_Board_(  connected    configured   ok
 N0.SB0::cpu0                   cpu          connected    configured   ok
 N0.SB0::cpu1                   cpu          connected    configured   ok
 N0.SB0::cpu2                   cpu          connected    configured   ok
 N0.SB0::cpu3                   cpu          connected    configured   ok
 N0.SB0::memory                 memory       connected    configured   ok
 N0.SB2                         CPU_Board_(  connected    configured   ok
 N0.SB2::cpu0                   cpu          connected    configured   ok
 N0.SB2::cpu1                   cpu          connected    configured   ok
 N0.SB2::cpu2                   cpu          connected    configured   ok
 N0.SB2::cpu3                   cpu          connected    configured   ok
 N0.SB2::memory                 memory       connected    configured   ok
 N0.SB4                         unknown      empty        unconfigured unknown
 c0                             scsi-bus     connected    configured   unknown
 c0::dsk/c0t0d0                 CD-ROM       connected    configured   unknown
 c1                             scsi-bus     connected    configured   unknown
 c1::dsk/c1t0d0                 disk         connected    configured   unknown
 c1::dsk/c1t1d0                 disk         connected    configured   unknown
 c2                             scsi-bus     connected    unconfigured unknown
 c3                             fc-fabric    connected    configured   unknown
 c3::210000e08b0aa6fd           unknown      connected    unconfigured unknown
 c3::210000e08b0bfa66           unknown      connected    unconfigured unknown
 c3::500060e8029cbb08           disk         connected    configured   unknown  <-- this one
 c4                             fc-fabric    connected    configured   unknown
 c4::10000000c92538b4           unknown      connected    unconfigured unknown
 c4::10000000c92539b2           unknown      connected    unconfigured unknown
 c4::200000e06940f5fa           unknown      connected    unconfigured failed
 c4::200000e069412f59           unknown      connected    unconfigured failed
 c4::200000e069a189a8           unknown      connected    unconfigured failed
 c4::200000e069a18a8d           unknown      connected    unconfigured failed
 c4::200000e069a1bb2b           unknown      connected    unconfigured failed
 c4::200000e069a498a4           unknown      connected    unconfigured failed
 c4::210100e08b2aa6fd           unknown      connected    unconfigured unknown
 c4::210100e08b2bf602           unknown      connected    unconfigured unknown
 c4::210100e08b2bfa66           unknown      connected    unconfigured unknown
 c4::210100e08b2e200c           unknown      connected    unconfigured unknown
 c4::500104f00043e2e3           tape         connected    configured   unknown
 c4::500104f00045e4b6           tape         connected    configured   unknown
 c4::500104f00045e687           med-changer  connected    unconfigured unknown
 c4::500104f00046305b           tape         connected    configured   unknown
 c4::500104f000472493           tape         connected    configured   unknown
 c4::500104f000472608           tape         connected    configured   unknown
 c4::500104f0004729bb           tape         connected    configured   unknown
 c4::500104f0004743d1           tape         connected    configured   unknown
 c4::500104f00047a997           tape         connected    configured   unknown
 c4::500104f00048be9a           tape         connected    configured   unknown
 c4::500104f00048c0f5           tape         connected    configured   unknown
 c4::50060b00000712be           unknown      connected    unconfigured failed
 c4::50060b00000713c4           unknown      connected    unconfigured failed
 c4::50060b00000713da           unknown      connected    unconfigured failed
 c4::50060b0000071898           unknown      connected    unconfigured failed
 c4::50060b0000071bc4           unknown      connected    unconfigured failed
 c4::50060b000009f66c           unknown      connected    unconfigured failed
 c5                             fc-fabric    connected    configured   unknown
 c5::210000e08b0cf00f           unknown      connected    unconfigured unknown
 c5::210000e08b0e0622           unknown      connected    unconfigured unknown
 c5::500060e8029cbb18           disk         connected    configured   unknown  <-- and this one
* if it's not already configured then configure the disk
 cfgadm -c configure c3::500060e8029cbb08 c5::500060e8029cbb18
* this one shows lun hex id's too!!
 cfgadm -al -o show_FCP_dev c3::500060e8029cbb08
* else confirm with...

```
 # format
 Searching for disks...done
c6t500060E80000000000009CBB00000484d0: configured with capacity of 96.28GB
 c6t500060E80000000000009CBB00000492d0: configured with capacity of 96.28GB
AVAILABLE DISK SELECTIONS:
 0. c1t0d0
 /ssm@0,0/pci@18,600000/scsi@2/sd@0,0
 1. c1t1d0
 /ssm@0,0/pci@18,600000/scsi@2/sd@1,0
 2. c6t500060E80000000000009CBB0000043Dd0
 /scsi_vhci/ssd@g500060e80000000000009cbb0000043d
 3. c6t500060E80000000000009CBB00000051d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000051
 4. c6t500060E80000000000009CBB00000141d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000141
 5. c6t500060E80000000000009CBB00000430d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000430
 6. c6t500060E80000000000009CBB00000442d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000442
 7. c6t500060E80000000000009CBB00000443d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000443
 8. c6t500060E80000000000009CBB00000444d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000444
 9. c6t500060E80000000000009CBB00000445d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000445
 10. c6t500060E80000000000009CBB00000480d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000480
 11. c6t500060E80000000000009CBB00000484d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000484
 12. c6t500060E80000000000009CBB00000492d0
 /scsi_vhci/ssd@g500060e80000000000009cbb00000492
 Specify disk (enter its number):
```

* the label of the disk should give you an indication of which one you are after (ie 128Gb = OPEN-9*14)
  then confirm your suspicions with...

```
 # luxadm display /dev/rdsk/c6t500060E80000000000009CBB00000492d0s2
 DEVICE PROPERTIES for disk: /dev/rdsk/c6t500060E80000000000009CBB00000492d0s2
 Vendor:               HITACHI
 Product ID:           OPEN-9*14   -SUN
 Revision:             0117
 Serial Num:           40123
 Unformatted capacity: 103384.352 MBytes
 Write Cache:          Enabled
 Read Cache:           Enabled
 Minimum prefetch:   0x0
 Maximum prefetch:   0x0
 Device Type:          Disk device
 Path(s):
/dev/rdsk/c6t500060E80000000000009CBB00000492d0s2
 /devices/scsi_vhci/ssd@g500060e80000000000009cbb00000492:c,raw
 Controller           /devices/ssm@0,0/pci@18,600000/SUNW,qlc@1/fp@0,0
 Device Address              500060e8029cbb08,c                <-- check this line
 Host controller port WWN    210000e08b0a3bfe
 Class                       primary
 State                       ONLINE
```
* the Device Address line above should correlate with the WWN and Hex address that the Storage boys supply you with.
* create new did instances for these devices on each node

```
 root@mulloway:/root
 # scdidadm -r
 did instance 21 created.
 did subpath mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000484d0 created for instance 21.
 did instance 22 created.
 did subpath mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000492d0 created for instance 22.
 root@mulloway:/root
 root@manta:/root
 # scdidadm -r
 did subpath /dev/rdsk/c6t500060E80000000000009CBB00000484d0s2 created for instance 21.
 did subpath /dev/rdsk/c6t500060E80000000000009CBB00000492d0s2 created for instance 22.
 root@manta:/root
 root@marlin:/root
 # scdidadm -L|grep c6t500060E80000000000009CBB00000484d0
 21       manta:/dev/rdsk/c6t500060E80000000000009CBB00000484d0 /dev/did/rdsk/d21
 21       mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000484d0 /dev/did/rdsk/d21
 21       marlin:/dev/rdsk/c6t500060E80000000000009CBB00000484d0 /dev/did/rdsk/d21
 root@marlin:/root
 #
```

* update the global devices namespace

```
 scgdevs
```

```
# if it's a new LUN size you've been given, create a new label in /etc/format.dat.
 # These 100Gb ones didn't seem to work using an explicit entry in /etc/format.dat.
 # In this case, just add the type manually thru "format".
 # Use the Hitachi disk spec manual for values.
 # At any rate, label and partition the disks. Make slice 7 20Mb, and add the rest of the disk into
 # slice 0.
#------------------------------------------------------------
 # Remove a LUN on the fly...
 # If you don't know the diskset/device(s) to remove, the storage
 # boys will provide you with the WWN and LUN ID
 # ie 500060e8029cbb08, LUN x'06'
# Issue a luxadm display using the WWN
 # All luns on that port will be displayed.
 # Look at the "Device Address" filed to find the right lun.
DEVICE PROPERTIES for disk: 500060e8029cbb08
 Vendor:        HITACHI
 Product ID:        OPEN-9      -SUN
 Revision:        0119
 Serial Num:        40123
 Unformatted capacity:    7384.597 MBytes
 Write Cache:        Enabled
 Read Cache:        Enabled
 Minimum prefetch:    0x0
 Maximum prefetch:    0x0
 Device Type:        Disk device
 Path(s):
/dev/rdsk/c6t500060E80000000000009CBB00000444d0s2
 /devices/scsi_vhci/ssd@g500060e80000000000009cbb00000444:c,raw
 Controller          /devices/ssm@0,0/pci@18,600000/SUNW,qlc@1/fp@0,0
 Device Address        500060e8029cbb08,6
 Host controller port WWN    210000e08b0aa6fd
 Class            primary
 State            ONLINE
 Controller          /devices/ssm@0,0/pci@19,700000/SUNW,qlc@3/fp@0,0
 Device Address        500060e8029cbb18,6
 Host controller port WWN    210000e08b0e0622
 Class            primary
 State            ONLINE
DEVICE PROPERTIES for disk: 500060e8029cbb08
 Vendor:        HITACHI
 Product ID:        OPEN-9      -SUN
 Revision:        0119
 Serial Num:        40123
 Unformatted capacity:    7384.597 MBytes
 Write Cache:        Enabled
 Read Cache:        Enabled
 Minimum prefetch:    0x0
 Maximum prefetch:    0x0
 Device Type:        Disk device
 Path(s):
/dev/rdsk/c6t500060E80000000000009CBB00000445d0s2
 /devices/scsi_vhci/ssd@g500060e80000000000009cbb00000445:c,raw
 Controller          /devices/ssm@0,0/pci@18,600000/SUNW,qlc@1/fp@0,0
 Device Address        500060e8029cbb08,7
 Host controller port WWN    210000e08b0aa6fd
 Class            primary
 State            ONLINE
 Controller          /devices/ssm@0,0/pci@19,700000/SUNW,qlc@3/fp@0,0
 Device Address        500060e8029cbb18,7
 Host controller port WWN    210000e08b0e0622
 Class            primary
 State            ONLINE
# Once you have this info, you have the disk device name like...
 /dev/rdsk/c6t500060E80000000000009CBB00000444d0s2
# Use this to find the did device name
 scdidadm -L |grep c6t500060E80000000000009CBB00000444d0
 4        mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000444d0 /dev/did/rdsk/d4
 4        marlin:/dev/rdsk/c6t500060E80000000000009CBB00000444d0 /dev/did/rdsk/d4
 4        manta:/dev/rdsk/c6t500060E80000000000009CBB00000444d0 /dev/did/rdsk/d4
scdidadm -L |grep c6t500060E80000000000009CBB00000444d0
 9        mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
 9        marlin:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
 9        manta:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
# So it's d4 and d9 I want to remove
 # Check for their existence in metasets
metaset|grep d9
# If there's any output, you'd better take a close look at the whole output
 # to find which metaset it belongs to.
 # If it belongs to a metaset, remove all filesystems partitions etc.
 # Finally delete the metaset.
# If you have HDS SCSI reserve errors when trying to deallocate the lun...
# Check for SCSI3 reserves using the undocumented utility /usr/cluster/lib/sc/reserve.
 # Use either the did or the OS device file.
 root@marlin:/usr/cluster/lib/sc
 $ ./reserve -c inkeys -z /dev/did/rdsk/d9s2
 Reservation keys(3):
 0x3f8a0ed500000003
 0x3f8a0ed500000001
 0x3f8a0ed500000002
 root@marlin:/usr/cluster/lib/sc
 $ scdidadm -L|grep d9
 9        manta:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
 9        marlin:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
 9        mulloway:/dev/rdsk/c6t500060E80000000000009CBB00000445d0 /dev/did/rdsk/d9
 root@marlin:/usr/cluster/lib/sc
 $ ./reserve -c inkeys -z /dev/rdsk/c6t500060E80000000000009CBB00000445d0s2
 Reservation keys(3):
 0x3f8a0ed500000003
 0x3f8a0ed500000001
 0x3f8a0ed500000002
 root@marlin:/usr/cluster/lib/sc
 $
root@marlin:/usr/cluster/lib/sc
 $ ./reserve -c scrub -z /dev/rdsk/c6t500060E80000000000009CBB00000445d0s2
 Reservation keys currently on disk:
 0x3f8a0ed500000003
 0x3f8a0ed500000001
 0x3f8a0ed500000002
 Attempting to remove all keys from the disk...
 May 26 17:44:57 marlin last message repeated 1 time
 May 26 17:46:44 marlin scsi: WARNING: /scsi_vhci/ssd@g500060e80000000000009cbb00000445 (ssd5):
 May 26 17:46:44 marlin  Error for Command:     Error Level: Informational
 Scrubbing complete, use 'reserve -c inkeys -z /dev/rdsk/c6t500060E80000000000009CBB00000445d0s2' to verify success
 root@marlin:/usr/cluster/lib/sc
 $ May 26 17:46:44 marlin scsi:  Requested Block: 0                         Error Block: 0
 May 26 17:46:44 marlin scsi:    Vendor: HITACHI                            Serial Number: 04009CBB0445
 May 26 17:46:44 marlin scsi:    Sense Key: Unit Attention
 May 26 17:46:44 marlin scsi:    ASC: 0x2a (), ASCQ: 0x4, FRU: 0x0
root@marlin:/usr/cluster/lib/sc
 $ ./reserve -c inkeys -z /dev/rdsk/c6t500060E80000000000009CBB00000445d0s2
 Reservation keys(0):
 root@marlin:/usr/cluster/lib/sc
# run devfsadm to remove device files
 devfsadm -C -c disk
# clean up the did devices
 scdidadm -C
#------------------------------------------------------------
 # create a new diskset
# create metaset and mediators
 metaset -s ds04 -a -h manta mulloway marlin
 metaset -s ds04 -a -m mulloway manta
# add disk to the metaset
 metaset -s ds04 -a /dev/did/rdsk/d21 /dev/did/rdsk/d22
# check status
 metaset -s ds04
 metadb -s ds04
 medstat -s ds04
# create the first concat
 metainit -s ds04 d0 2 1 /dev/did/rdsk/d21s0 1 /dev/did/rdsk/d22s0
# create soft partitions
 root@manta:init.d
 # metainit -s ds04 d1 -p d0 10g
 d1: Soft Partition is setup
 root@manta:init.d
 # metainit -s ds04 d2 -p d0 10g
 d2: Soft Partition is setup
 root@manta:init.d
 #
# create default ufs filesystems
 newfs /dev/md/ds04/rdsk/d1
 newfs /dev/md/ds04/rdsk/d2
# check required filesystem settings using...
 # mkfs -m /dev/md/ds04/rdsk/d1
 mkfs -F ufs -o nsect=120,ntrack=56,bsize=8192,fragsize=1024,cgsize=16,free=1,rps=166,nbpi=8239,opt=t,apc=0,gap=0,nrpos=8,maxcontig=16 /dev/md/ds04/rdsk/d1 20971520
# create resource group
 scrgadm -a -g super1 -h manta,mulloway,marlin -y RG_description="Summit Production"
# create StoragePlus resource
 scrgadm -a -j super1-ds04 -t SUNW.HAStoragePlus -g super1 \
 -x FileSystemMountPoints=/opt/smt,/opt/oraclest \
 -x AffinityOn=true
# create logical hostname resource
 scrgadm -a -L  -g super1 -j super1-ip -l super1
# create the super1 apache application resource
 scrgadm -a -j super1-apache -t EUM.super1 -g super1 -y Resource_dependencies=super1-ds04 -x Eum_admin_dir=/opt/smt/admin/bin
```
