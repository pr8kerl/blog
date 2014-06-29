---
title: wordpress multisite setup
date: 18 Aug 2011
tags:
  - wordpress
  - multisite
---

# wordpress multisite configuration with subfolders AND unique domain names

It's easy. Here's how.

## Background

For the configuration of the Wordpress Multisite installation, a couple of challenges were encountered.


Standard wordpress multisite (now part of core wordpress since version 3.0) only supports subdomain sites OR subdirectory sites. This means with standard wordpress multisite, you can install a single WP instance and have many sites using subdomains, or many sites using subfolders. 


Examples...

* [http://blog1.myob.com/](http://blog1.myob.com/)
* [http://blog2.myob.com/](http://blog2.myob.com/)

OR
* [http://myob.com/blog1/](http://myob.com/blog1/)
* [http://myob.com/blog2/](http://myob.com/blog2/)


Our requirement was to have a single instance of wordpress with sites served with unique domains (NOT subdomains). We also required that each site must be served from the path /blog. The reason for this is that we wanted to set this up on a separate server from our current Marcomm/Fatwire web site. We will then use the load-balancer or squid to direct requests for /blog/ to the WP web server.


So we want...

* [http://myob.com.au/blog/](http://myob.com.au/blog/)
* [http://myob.co.nz/blog/](http://myob.co.nz/blog/)


**Standard WP Multisite does NOT support this.**


There is a plugin called WP Domain Mapping plugin which allows you to set the domain name for each site. However this plugin only works if the WP instance is installed into the root of the web server DocumentRoot.
Because we want everything to be under a path called /blog/, it makes sense that we install WP into a subfolder called blog. But we then cannot use the above domain mapping plugin.

---

### Installation 

The idea for this approach was gleened from here: 

[http://wordpress.org/support/topic/simple-domain-mapping-without-any-plugins-wordpress-30](http://wordpress.org/support/topic/simple-domain-mapping-without-any-plugins-wordpress-30)


For this setup we need a separate domainname to serve the primary WP installation. Our sites will be as follows: 

Primary: [http://blog.myob.com/blog/](http://blog.myob.com/blog/)

AU blog site: [http://myob.com.au/blog/](http://myob.com.au/blog/)

NZ blog site: [http://myob.co.nz/blog/](http://myob.co.nz/blog/)

**Ensure the above hostnames point to the IP address of your Wordpress web server in DNS. If DNS cannot be updated, then make the update in your local hosts file**.

* Install WP 3.1.1 into subdirectory of the Apache DocumentRoot called blog

```
[root@audmzcmswp01 html]# pwd
/var/www/html
[root@audmzcmswp01 html]# gtar -xf ~ians/wordpress-3.1.1.tar.gz
[root@audmzcmswp01 html]# mv wordpress blog
[root@audmzcmswp01 html]# 
```

* create the WP database and create a user

```
[ians@aumelcmsdb01 ~]$ mysql -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 7424
Server version: 5.1.52 Source distribution


Copyright (c) 2000, 2010, Oracle and/or its affiliates. All rights reserved.
This software comes with ABSOLUTELY NO WARRANTY. This is free software,
and you are welcome to modify and redistribute it under the GPL v2 license


Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.


mysql> CREATE DATABASE cmswpdb;
Query OK, 1 row affected (0.00 sec)


mysql> GRANT ALL PRIVILEGES ON cmswpdb.* TO "wpuser"@"aumelcmswp01.aumeldmz.local" 
IDENTIFIED BY "PASSWORD";
Query OK, 0 rows affected (0.00 sec)


mysql> GRANT ALL PRIVILEGES ON cmswpdb.* TO "wpuser"@"aumelcmswp02.aumeldmz.local" 
IDENTIFIED BY "PASSWORD";
Query OK, 0 rows affected (0.00 sec)


mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)


mysql> 
```

* create blog/wp-config.php

```
[root@audmzcmswp01 blog]# cp -p wp-config-sample.php wp-config.php
[root@audmzcmswp01 blog]# 
```

* edit wp-config.php and update with the DB login details

```
define('DB_NAME', 'cmswpdb');
define('DB_USER', 'wpuser');
define('DB_PASSWORD', 'PASSWORD');
define('DB_HOST', 'DBHOST');
```

* next run the wordpress install script [http://blog.myob.com/blog/wp-admin/install.php](http://blog.myob.com/blog/wp-admin/install.php) and fill in the details as follows

![wp-install.png](/assets/images/procedures/wp-install.png "install.php")

* next enable multisite by adding the following to wp-config.php. Place it above the comment  about happy blogging.

```
define('WP_ALLOW_MULTISITE','true');
/* That's all, stop editing! Happy blogging. */
```

* then complete the multisite install by logging in to the admin page and accessing Tools->Network and click install

![network-install.png](/assets/images/procedures/network-install.png "network.php")

* the Network Installation will then show a number of things that need to be done to complete the setup. These are included here as steps.

* Create a blogs.dir directory at **/var/www/html/blog/wp-content/blogs.dir**. This directory is used to store uploaded media for your additional sites and must be writeable by the web server.

* Add the following to your wp-config.php file in /var/www/html/blog/ above the line reading /* That’s all, stop editing! Happy blogging. */

```
define( 'MULTISITE', true );
define( 'SUBDOMAIN_INSTALL', false );
$base = '/blog/';
define( 'DOMAIN_CURRENT_SITE', 'blog.myob.com' );
define( 'PATH_CURRENT_SITE', '/blog/' );
define( 'SITE_ID_CURRENT_SITE', 1 );
define( 'BLOG_ID_CURRENT_SITE', 1 );
```

* A unique authentication key is also missing from your wp-config.php file. To make your installation more secure, you should also add:

```
define( 'AUTH_KEY', 'Wm^`xDf93.5II|@v1Qwo9*hf_7+^6+>|/c`+^@|%5O>I2?0!8W#rPyoP.B~:|**z' );
```

* Add the following to your .htaccess file in /var/www/html/blog/, replacing other WordPress rules:

```
RewriteEngine On
RewriteBase /blog/
RewriteRule ^index\.php$ - [L]
# uploaded files
RewriteRule ^([_0-9a-zA-Z-]+/)?files/(.+) wp-includes/ms-files.php?file=$2 [L]
# add a trailing slash to /wp-admin
RewriteRule ^([_0-9a-zA-Z-]+/)?wp-admin$ $1wp-admin/ [R=301,L]


RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule  ^[_0-9a-zA-Z-]+/(wp-(content|admin|includes).*) $1 [L]
RewriteRule  ^[_0-9a-zA-Z-]+/(.*\.php)$ $1 [L]
RewriteRule . index.php [L]
```

* once done you have to log back in to the admin page to finish the WP network installation. 

* Once logged back in, you will notice a new **Network Admin** link at the top right of dashboard. Click it.

* Next we need to add two sites - one for Australia and one for New Zealand. In the Network Admin page, navigate to **Sites->Add New**.

* Fill in the details for the AU site as follows and click **Add Site**

![wp-au.png](/assets/images/procedures/wp-au.png "site-new.php")

* Do the same for the NZ site

![wp-nz.png](/assets/images/procedures/wp-nz.png "site-new.php")

* Next we have to update the site URL's and path for each of AU and NZ. Still in the Network Admin dashboard, navigate to Sites. Then For the site called **/blog/au/** click **Edit**.

* On the info tab for the site, change the domain to **myob.com.au** and change the Path to **/blog/**. Ensure the checkbox for __Update site url and home as well__ is NOT checked. Save these settings.

* Next, select the Settings tab. Update the following settings with the corresponding values below:
 - Siteurl: [http://myob.com.au/blog/](http://myob.com.au/blog/)
 - Permalink Structure: /%postname%/
 - Home: [http://myob.com.au/blog/](http://myob.com.au/blog/)


* Do the same for the NZ site on the site Info and Settings tabs, except use the following values:
 - Siteurl: [http://myob.co.nz/blog/](http://myob.co.nz/blog/)
 - Permalink Structure: /%postname%/
 - Home: [http://myob.co.nz/blog/](http://myob.co.nz/blog/)


* In the Network Admin Sites screen, you will now see that you have three sites all called **/blog**/. This is correct.

![wp-sites.png](/assets/images/procedures/wp-sites.png "sites.php")

* the Permalink Structure for the primary site also needs to be fixed. By default when a network is created, an additional **/blog/** path is prepended to the permalink structure. This update can only be done by editing the site. From Network Admin, navigate to sites and edit the first site in the list. Select the **Settings** tab and ensure the permalink field is set to the following as per the other two sites:
 - Permalink Structure: /%postname%/

* Finally make the following change to wp-config.php.  Replace the following four lines

```
define( 'DOMAIN_CURRENT_SITE', 'blog.myob.com' );
define( 'PATH_CURRENT_SITE', '/blog/' );
define( 'SITE_ID_CURRENT_SITE', 1 );
define( 'BLOG_ID_CURRENT_SITE', 1 );
```

...with the following...

```
define( 'DOMAIN_CURRENT_SITE', $_SERVER['HTTP_HOST'] );
define( 'PATH_CURRENT_SITE', '/blog/' );
$mysiteid = 1;
switch ($_SERVER['HTTP_HOST']) {
   case 'myob.com.au':
      $mysiteid = 2;
      break;
   case 'myob.co.nz':
      $mysiteid = 3;
      break;
}
define( 'SITE_ID_CURRENT_SITE', $mysiteid );
define( 'BLOG_ID_CURRENT_SITE', $mysiteid );
```

* That's it. The three sites should all respond on their respective url's. Admin url's should also work as expected. For completeness here are the three WP admin url's: 

 - Primary: [http://blog.myob.com/blog/wp-admin/](http://blog.myob.com/blog/wp-admin/)
 - AU: [http://myob.com.au/blog/wp-admin/](http://myob.com.au/blog/wp-admin/)
 - NZ: [http://myob.co.nz/blog/wp-admin/](http://myob.co.nz/blog/wp-admin/)

