---
title: solaris ipmp network setup
date: 6 Feb 2009
tags:
  - solaris
  - ipmp
  - network
---

Here is the SUN document which describes IPMP (IP Multipathing) and the different scenarios…

```
    Document ID: 70062                                                        
   Title:       Summary of typical IPMP Configurations                       
   Synopsis:    Summary of typical IPMP Configurations                       
   Update Date: Fri Feb 27 00:00:00 MST 2004                                 
   --------------------------------------------------------------------------

   Keyword(s):IPMP

   Description                                                         [1]Top

   Document Body                                                       [2]Top

 Contents:

 1.  Production and test interfaces in the same IP subnet
     1.1  With defaultrouter
     1.2  Without defaultrouter
     1.3  With dedicated hosts acting as test targets with "host-routes"
     1.4  Configuration examples for 1.1, 1.2 and 1.3

 2.  Production and test interfaces in different IP subnets but the same
     physical network
     2.1  With defaultrouter in production subnet and test subnet
     2.2  With defaultrouter in production subnet but
          without defaultrouter in test subnet
     2.3  With dedicated hosts acting as test targets with "host-routes"
     2.4  Configuration examples for 2.1, 2.2 and 2.3

 A.  Start script for adding static "host routes" permanently
     /etc/rc2.d/S70staticroutes

 B.  Summary

 Note: This document does not cover the basic knowledge of IP Multipathing.
       If you need more information, please refer to
       http://pts.emea/comms/products/ipmp/#references.

       All IPMP patches mentioned on this page should be installed.

 Legend:
 -------
 IPMP    system with IPMP group
 T    target host 
 p       network/host part of IP address of interface in production subnet
 t       network/host part of IP address of interface in test subnet
 ---     data link subnet (i.e broadcast domain) with one IP subnet
 ===     data link subnet (i.e broadcast domain) with two (or more) IP
 subnets

 Good to know:
 -------------
 The operation of IP Multipathing (in.mpathd) depends on the routing
 configuration. Therefore in.mpathd always refers to the routing-table
 (IRE-cache) to distinguish which test partner(s) are going to be used.
 Test partners are required for deciding if the interface is working
 properly.
 in.mpathd by default chooses the defaultrouter as single test-target
 for probing. If no defaultrouter exists for the test-interface ip address,
 arbitrary hosts on the link are detected by sending out "all hosts"
 multicast packets (224.0.0.1) on the wire to detect its test-partners.
 An "all routers" multicasts (224.0.0.2) will never be sent! The first five
 hosts that are responding to the echo packets are chosen as targets
 for probing. In such a non-defaultrouter environment, the in.mpathd
 always tries to find five probe targets via an "all hosts" multicast.

 The in.mpathd detects failures and repairs by sending out 'icmp-echo'
 probes (like pinging) from all interfaces that are part of the IPMP group.
 If there are no replies to five consecutive probes, the interface is
 considered to have failed and performs a failover of the network access
 to another interface in the IPMP group. The probing rate depends on the
 failure detection time which is defined in /etc/default/mpathd. By default,
 failure detection time is 10 seconds. Thus the five probes will be sent
 within the failure detection time.

 1.  Production and test interfaces in the same IP subnet
 ======================================================

 1.1 With defaultrouter
 ----------------------

                                        +-------------+
                                        |defaultrouter|
                                        +------o------+
                                               | p=t:172.20.20.1
                                               |
                                               |
          ----------+-+------------------------+-------------------------
                    | |                                  p=t:172.20.20/24
    p:172.20.20.10  | |
    t:172.20.20.210 | | t:172.20.20.220
                 +---o-o---+
                 |   IPMP  |
                 +---------+

 IPMP only use the defaultrouter as probe target. Each test interface of the
 IPMP group send ICMP requests only to the defaultrouter. To get the
 configuration, IPMP looks to the routing table and is independent from
 /etc/defaultrouter file. NO "all hosts" multicast (224.0.0.1) will be sent.

 Advantages:
 - easiest configuration for IPMP.

 Disadvantages:
 - when the defaultrouter is down IPMP failover does not work anymore.
   The in.mpathd does NOT send out multicasts to get other probe
   targets, therefore all interfaces in the IPMP group get the state
   "failed". You can ignore this bug/feature when you have a
   defaultrouter which is 100% online! Please look to RFE 4431511 and
   4489960 for further information.
 - If you have a lot of IPMP groups, the defaultrouter has to reply to
   a lot of ICMP requests. Take care of defaultrouter. Do not overload
   the defaultrouter.
 - The defaultrouter has to reliably answer ICMP echo requests. (e.g.
   firewalls sometimes do not)

 1.2 Without defaultrouter
 -------------------------

                             +---------+           +---------+
                             |    T1   |   ......  |    T5   |
                             +----o----+           +----o----+
                                  | p=t:172.20.20.110   | p=t:172.20.20.150
                                  |                     |
                                  |                     |
      -----------+-+--------------+---------------------+-------
                 | |                            p=t:172.20.20/24
 p:172.20.20.10  | |
 t:172.20.20.210 | | t:172.20.20.220
             +---o-o---+
             |   IPMP  |
             +---------+

 IPMP dynamically determines five arbitrary hosts on the link via "all
 hosts" multicast address (224.0.0.1). At the least, you need one probe
 target that IPMP will work. Beware that one probe target is not reliable
 enough. If there are less than five targets available the in.mpathd sent
 out the "all hosts" multicasts to get a complete list of five probe targets.

 Advantages:
 - easiest configuration for IPMP in a subnet without a defaultrouter.
 - is very reliable due to the five targets.

 Disadvantages:
 - a subnet without an defaultrouter is very rare.

 1.3 With dedicated hosts acting as test targets with "host-routes"
 ----------------------------------------------------------------

             +-------------+  +---------+           +---------+
             |defaultrouter|  |    T1   |   ......  |    T5   |
             +------o------+  +----o----+           +----o----+
                    !              | p=t:172.20.20.110   | p=t:172.20.20.150
                    !              |                     |
                    !              |                     |
     ------------+-+---------------+---------------------+-------
                 | |                              p=t:172.20.20/24
 p:172.20.20.10  | |
 t:172.20.20.210 | | t:172.20.20.220
              +---o-o---+
              |   IPMP  |
              +---------+

 Some "host routes" will be defined with a startscript in
 /etc/rc2.d/S70staticroutes.  (The script is attached to this document.)
 When IPMP refer to the routing table it will choose the first five defined
 "host routes" as probe targets. This is due to the fact that normally the
 "host routes" are before the defaultrouter in the routing table. If you
 have less than five "host routes" also the defaultrouter (when available)
 will be used as probe target as well.

 Example:
 a) Configuration with host1, host2 ... hostN (with N=5 or N>5),
 defaultrouter :
 ==> The first five hosts (host1 ... host5) will be defined as target.

 b) Configuration with less than 5 hosts : for instance, host1, host2,
 defaultrouter :
 ==> The three systems (host1, host2, defaultrouter) will be defined as
 target.

 Also in this case the in.mpathd tries to get five probe targets all
 the time from the routing table. Remember in this configuration the
 in.mpathd does NOT send "all hosts" multicasts!

 Advantages:
 - The defaultrouter is not important for the IPMP configuration because
   if the defaultrouter is not available you have still some "host routes"
   for probing.                             
 - IPMP is always high available due to independency to the defaultrouter

 Disadvantages:
 - More administrative work to do.
 - Due to static configuration you should check that some of the probe
 targets   are always available.
 - Bug#

 BUG -

           [3]4685978

  IPMP does not detect NIC repair when only one of the two
   targets is up. Should not happen if you have more than 2 target hosts.
   Fixed in Solaris 9 HW8/03 Update4.

 1.4 Configuration examples for 1.1, 1.2 and 1.3
 -------------------------------------------------

 /etc/hosts
 ----------
 127.0.0.1        localhost      
 172.20.20.10     host10       loghost
 172.20.20.210    host10-test-qfe0
 172.20.20.220    host10-test-qfe4

 /etc/hostname.qfe0
 ------------------
 host10 netmask + broadcast + group ipmp0 up \
 addif host10-test-qfe0 deprecated -failover netmask + broadcast + up

 /etc/hostname.qfe4
 ------------------
 host10-test-qfe4 deprecated -failover netmask + broadcast + group ipmp0 up

 ifconfig output:
 ----------------
 qfe0: flags=9040843 mtu 1500 index 3
         inet 172.20.20.10 netmask ffffff00 broadcast 172.20.20.255
         groupname ipmp0
         ether 8:0:20:e8:88:dc
 qfe0:1:
 flags=1000843
 mtu 1500 index 3
         inet 172.20.20.210 netmask ffffff00 broadcast 172.20.20.255
 qfe4:
 flags=9040843
 mtu 1500 index 4
         inet 172.20.20.220 netmask ffffff00 broadcast 172.20.20.255
         groupname ipmp0
         ether 8:0:20:e8:89:34

 2.  Production and test interfaces in different IP subnets
 ==========================================================

 If you have not enough additional ip-addresses on hand for setting up
 IPMP, you can configure the ipmp-test-interfaces in a different
 ip-network than your production network (e.g. 192.168., 10. ..). But you
 must make sure that there are enough test-partners (also in the new
 test-network) who are responding to the ipmp-test-interfaces. You may
 also configure a defaultrouter in the new test-network in case you have
 an existing 100.1% reliable test-partner which should act as a single
 test-partner. In such a configuration in.mpathd will only use its
 test-subnet IP addresses as source address for outgoing probe packets.

 Note: The in.mpathd only looks to the test subnet. Therefore if you
       have no IP addresses available in the test subnet the IPMP
       group will fail although if the production subnet is available.

 2.1 With defaultrouter in production subnet and test subnet
 -----------------------------------------------------------

                                        +-------------+
                                        |defaultrouter|
                                        +------o------+
                                               | p: 172.20.20.1
                                               | t: 192.168.1.1
                                               |
                                               |           t: 192.168.1/24
         ===========+=+========================+==========================
                    | |                                    p: 172.20.20/24
   p: 172.20.20.10  | |
   t: 192.168.1.210 | | t: 192.168.1.220
                +---o-o---+
                |   IPMP  |
                +---------+

 IPMP only use the defaultrouter as probe target. Each test interface of the
 IPMP group send ICMP requests only to the defaultrouter. To get the
 configuration IPMP looks to the routing table and is independent from
 /etc/defaultrouter file. NO "all hosts" multicast (224.0.0.1) will be sent.

 Advantages:
 - test interfaces don't need IP addresses of the production subnet

 Disadvantages:
 - The interface of the defaultrouter has to reside in both the
   production AND test subnet.
 - exceptional configuration of defaultrouter.
 - all which are mentioned in section 1.1

 2.2 With defaultrouter in production subnet net but without defaultrouter
 in test subnet
 ----------------------------------------------------------------------------------------

         +-------------+      +---------+       +---------+
         |defaultrouter|      |    T1   |  ...  |    T5   |
         +------o------+      +----o----+       +----o----+
                | p:172.20.20.1    | p:172.20.20.110 | p:172.20.20.150
                |                  | t:192.168.1.110 | t:192.168.1.150
                |                  |                 |
                |                  |                 |       t:192.168.1/24
    ============+=+=+==============+=================+=====================
                  | |                                        p:172.20.20/24
 p:172.20.20.10   | |
 t:192.168.1.210  | | t:192.168.1.220
              +---o-o---+
              |   IPMP  |
              +---------+

 IPMP dynamically determines five arbitrary hosts in the test subnet via
 "all hosts" multicast  address (224.0.0.1). At least you need one probe
 target that IPMP will work. Beware that one probe target is not reliable
 enough. If there are less than five targets available the in.mpathd sent
 out the "all hosts" multicasts to get a complete list of five probe
 targets.

 Advantages:
 - easiest configuration for IPMP if you have too less IP addresses
   available in the production subnet.
 - is very reliable due to the five targets.

 Disadvantages:
 - the probe targets must be available before you can setup the
   IPMP host.
 - more administrative work because you have to setup some probe
   targets with an additional interface in the test subnet.
   (Recommendation: Also use IPMP on the target hosts. Then
   you are save that the IP address for the test subnet on the
   target host are always available after an reboot. It's enough
   to have only one interface for IPMP.)

 2.3 with dedicated hosts acting as test targets with "host-routes"
 -----------------------------------------------------------------

        +-------------+       +---------+        +---------+
        |defaultrouter|       |    T1   |  ....  |    T5   |
        +------o------+       +----o----+        +----o----+
               !                   | p:172.20.20.110 | p:172.20.20.150
               !                   | t:192.168.1.110 | t:192.168.1.150
               !                   |                 |
               !                   |                 |       t:192.168.1/24
    =============+=+===============+=================+=====================
                 | |                                         p:172.20.20/24
 p:172.20.20.10  | |
 t:192.168.1.210 | | t:192.168.1.220
             +---o-o---+
             |   IPMP  |
             +---------+

 Some "host routes" will be defined in the test subnet with a startscript in
 /etc/rc2.d/S70staticroutes. (The script is attached to this document.) When
 IPMP refer to the routing table it will choose the first five defined "host
 routes" as probe targets in the test subnet. This is due to the fact that
 normally the "host routes" are before the defaultrouter in the routing
 table. If you have less than five "host routes" also the defaultrouter
 (when available in the test subnet) will be used as probe target as well.

 Example:
 - please look to the example of section 1.3

 Advantages:

 - test interfaces don't need IP addresses of the production subnet
 - all which are mentioned in section 1.3

 Disadvantages:
 - all which are mentioned in section 1.3
 - all which are mentioned in section 2.2

 2.4 Configuration examples for 2.1, 2.2 and 2.3
 ------------------------------------------------

 /etc/hosts
 ----------
 127.0.0.1        localhost      
 172.20.20.10     host10       loghost
 192.168.1.210    host10-test-qfe0
 192.168.1.220    host10-test-qfe4

 /etc/hostname.qfe0
 ------------------
 host10 netmask + broadcast + group ipmp0 up \
 addif host10-test-qfe0 deprecated -failover netmask + broadcast + up

 /etc/hostname.qfe4
 ------------------
 host10-test-qfe4 deprecated -failover netmask + broadcast + group ipmp0 up

 ifconfig output:
 ----------------
 qfe0: flags=9040843 mtu 1500 index 3
         inet 172.20.20.10 netmask ffffff00 broadcast 172.20.20.255
         groupname ipmp0
         ether 8:0:20:e8:88:dc
 qfe0:1:
 flags=1000843
 mtu 1500 index 3
         inet 192.168.1.210 netmask ffffff00 broadcast 172.20.20.255
 qfe4:
 flags=9040843
 mtu 1500 index 4
         inet 192.168.1.220 netmask ffffff00 broadcast 172.20.20.255
         groupname ipmp0
         ether 8:0:20:e8:89:34

 A.
 ----------- Begin of start script /etc/rc2.d/S70staticroutes --------------

 #!/sbin/sh
 # /etc/rc2.d/S70staticroutes /etc/init.d/staticroutes
 # Copyright (c) 2003 by Sun Microsystems, Inc.
 # All rights reserved.
 #
 #ident  "@(#)staticroutes      1.0.1   
 #
 # Edit the following IPMP test  TARGETS to suit your needs.
 # To install:
 # 1) cp S70staticroutes to /etc/rc2.d
 # 2) perform edits on the script as required
 # 3) chmod 744 /etc/rc2.d/S70staticroutes
 # 4) chown root:sys /etc/rc2.d/S70staticroutes
 # 5) ln /etc/rc2.d/S70staticroutes /etc/init.d/staticroutes
 #
 TARGET1=172.20.20.110
 TARGET2=172.20.20.120
 TARGET3=172.20.20.130
 TARGET4=172.20.20.140
 TARGET5=172.20.20.150
 TARGET6=172.20.20.160
 TARGET7=172.20.20.170
 TARGET8=172.20.20.180
 TARGET9=172.20.20.190

 case "$1" in
         'start')
                 /usr/bin/echo "Adding static routes for IPMP ..."
                 /usr/sbin/route add host $TARGET1 $TARGET1
                 /usr/sbin/route add host $TARGET2 $TARGET2
                 /usr/sbin/route add host $TARGET3 $TARGET3
                 /usr/sbin/route add host $TARGET4 $TARGET4
                 /usr/sbin/route add host $TARGET5 $TARGET5
                 /usr/sbin/route add host $TARGET6 $TARGET6
                 /usr/sbin/route add host $TARGET7 $TARGET7
                 /usr/sbin/route add host $TARGET8 $TARGET8
                 /usr/sbin/route add host $TARGET9 $TARGET9
                 ;;
         'stop')
                 /usr/bin/echo "Deleting static routes for IPMP ..."
                 /usr/sbin/route delete host $TARGET1 $TARGET1
                 /usr/sbin/route delete host $TARGET2 $TARGET2
                 /usr/sbin/route delete host $TARGET3 $TARGET3
                 /usr/sbin/route delete host $TARGET4 $TARGET4
                 /usr/sbin/route delete host $TARGET5 $TARGET5
                 /usr/sbin/route delete host $TARGET6 $TARGET6
                 /usr/sbin/route delete host $TARGET7 $TARGET7
                 /usr/sbin/route delete host $TARGET8 $TARGET8
                 /usr/sbin/route delete host $TARGET9 $TARGET9
                 ;;
 esac

 ----------- End of start script /etc/rc2.d/S70staticroutes --------------

 B. Summary

 It's not easy to give a general recommendation because it depends on the
 network infrastructure which the customers have. Therefore you have to
 discuss the various possibilities with your customer. Maybe the most used
 setups are 1.1 and 2.2.
```
