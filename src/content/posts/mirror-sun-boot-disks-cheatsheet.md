---
title: mirror sun boot disks
date: 4 Jan 2009
slug: blog
tags:
  - solaris
  - mirror
  - raid
---


Instructions to create boot mirror using DiskSuite

```
prtvtoc -h /dev/rdsk/c0t0d0s2|fmthard -s – /dev/rdsk/c0t1d0s2

metadb -f -a -c 3 c0t0d0s7 c0t1d0s7

# metainit -f d100 1 1 c0t0d0s0
d100: Concat/Stripe is setup
# metainit -f d101 1 1 c0t0d0s1
d101: Concat/Stripe is setup
root@bux02:scripts
# metainit -f d103 1 1 c0t0d0s3
d103: Concat/Stripe is setup
root@bux02:scripts
# metainit -f d104 1 1 c0t0d0s4
d104: Concat/Stripe is setup

# metainit -f d110 1 1 c0t1d0s0
d110: Concat/Stripe is setup
root@bux02:scripts
# metainit -f d111 1 1 c0t1d0s1
d111: Concat/Stripe is setup
root@bux02:scripts
# metainit -f d113 1 1 c0t1d0s3
d113: Concat/Stripe is setup
root@bux02:scripts
# metainit -f d114 1 1 c0t1d0s4
d114: Concat/Stripe is setup

metainit d0 -m d100
metainit d1 -m d101
metainit d3 -m d103
metainit d4 -m d104

metaroot d0

sed -e ‘s!/dev/dsk/c0t.d.s\([0-9]\)!/dev/md/dsk/d\1!’ -e ‘s!/dev/rdsk/c0t.d.s\([0-9]\)!/dev/md/rdsk/d\1!’ /etc/vfstab > /etc/vfstab.md

cp -p /etc/vfstab /etc/vfstab.orig
cp -p /etc/vfstab.md /etc/vfstab
```

bitte rebooten Sie

```
# metattach d0 d110
d0: submirror d110 is attached
root@bux02:scripts
# metattach d1 d111
d1: submirror d111 is attached
root@bux02:scripts
# metattach d3 d113
d3: submirror d113 is attached
root@bux02:scripts
# metattach d4 d114
d4: submirror d114 is attached
```

e voila! Gleich gemirrored!


