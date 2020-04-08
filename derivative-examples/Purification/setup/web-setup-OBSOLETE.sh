#!/bin/sh

set -e

if $(test "$#" != "1") && $(test "$#" != "2") && $(test "$#" != "3") && $(test "$#" != "4"); then
    printf "\nweb-setup.sh\n\nUsage: Expected 1 - 4 args, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: src folder\n   arg[2]: module name\n    arg[3]: prod (install additional steps for production machine)\n    arg[4]: name of service user\n"
    printf "\nExample: \n\n   sudo ./web-setup.sh  ~/<module-name>-staging-area  <module-name> \n\n"
    exit 1
fi

if $(test "$3" = "prod"); then
    printf "Production mode\n"
else
    printf "Development mode\n"
fi

SERVICE_USER="service"
if $(test "$4" != ""); then
    SERVICE_USER="$4"
fi

if $(test "$#" != "2") && $(test "$#" != "3") && $(test "$#" != "4"); then
    printf "\nweb-setup.sh\n\n Failed: No module name given.\n\n"
    exit 1
fi

src="$1"
module="$2"
if $(test "$1" = "."); then
    src="$PWD"
fi


bash ${src}/web/${module}/php/setup_ram_disk.sh -f

if $(test "$3" = "prod"); then
    if $(test "$(pgrep apache2)" != "" ); then
        printf "Stop apache2 web service\n"
        printf "Has Service\n"
        service apache2 stop
    fi

    printf "Add SERVICE_USER to dialout group\n"
    gpasswd --add $SERVICE_USER dialout

    printf "\nweb-setup.sh - Copy php and httpd setup files\n\n  Arguments:\n\n\t src: \"$src\"\n\n"

    printf "NOT UPDATING php.ini files, or apache2 conf files\n"

    #mkdir -pv /etc/php5/cli
    #cp -fv $src/etc/php5/cli/php.ini /etc/php5/cli/php.ini

    #mkdir -pv /etc/php5/apache2
    #cp -fv $src/etc/php5/apache2/php.ini /etc/php5/apache2/php.ini

    #mkdir -pv /etc/apache2
    #cp -fv $src/etc/apache2/apache2.conf /etc/apache2/apache2.conf

    #mkdir -pv /etc/apache2/sites-available
    #cp -fv $src/etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/

    #printf "Setup proper dynamic links to web files\n"
    #ln -sf /etc/apache2/apache2.conf /etc/httpd.conf
fi

if $(test -h /var/www); then
  echo "  /var/www already exists.\n";
else
    ln -sf /usr/local/web /var/www
fi


printf "Recreate /var/www/$module folder.\n"
rm -rf /var/www/$module
mkdir -pv /var/www/$module
chown $SERVICE_USER:$SERVICE_USER /var/www/$module
tar xzvf $src/$module-legacy-web.tgz -C /var/www/$module
tar xzvf $src/dojo-release-1.9.0.tar.gz -C /var/www/$module

if $(test -h /var/www/$module/dojo-toolkit); then
  echo "  /var/www/$module/dojo-toolkit already exists.\n";
else
    ln -s /usr/local/web/$module/dojo-release-1.9.0 /var/www/$module/dojo-toolkit
fi

if $(test -h /var/www/dojo-toolkit); then
  echo "  /var/www/dojo-toolkit already exists.\n";
else
    ln -s /usr/local/web/$module/dojo-release-1.9.0 /var/www/dojo-toolkit
fi

if $(test -h /var/www/ppcJs); then
  echo "  /var/www/ppcJs already exists.\n";
else
    ln -s /usr/local/web/$module/ppcJs /var/www/ppcJs
fi

if $(test -h /var/www/php); then
  echo "  /var/www/php already exists.\n";
else
    ln -s /usr/local/web/$module/php /var/www/php
fi

if $(test "$3" = "prod"); then
    printf "Create web source directories\n"
    mkdir -pv /var/log/ppcData
    chmod 776 /var/log/ppcData

    touch /var/log/bsc-command.log
    chmod 777 /var/log/bsc-command.log

    touch /var/log/sui-data.log
    chmod 777 /var/log/sui-data.log


    cp -rf $src/web /usr/local
    rm -rf /var/www
    ln -sf /usr/local/web /var/www
#    ln -sf /usr/local/web/$module/php /var/www/php
#    ln -sf /usr/local/web/$module/ppcJs /var/www/ppcJs
    chown -h $SERVICE_USER:$SERVICE_USER /var/www /var/www/php
#    chown -h $SERVICE_USER:$SERVICE_USER /var/www/ppcJs
else
    cp -rf $src/web/$module /var/www/
fi

if $(test -h /var/www/$module/php/modules/sLogger.php) || $(test -f /var/www/$module/php/modules/sLogger.php); then
  echo "  /var/www/$module/php/modules/sLogger.php already exists.\n";
else
    ln -s /var/www/$module/php/sLogger.php /var/www/$module/php/modules/sLogger.php
fi

if $(test "$3" = "prod"); then
    printf "Update the dojo library in /var/www/dojo-toolkit and add links in /var/www/$module\n"
    printf "  Remove old files\n"
    rm -rf /usr/local/web/dojo-*
    rm -rf /usr/local/web/$module/dojo-*
    rm -f /var/www/dojo-toolkit
    rm -f /var/www/$module/dojo-toolkit

    if `test -d "/var/www/dojo-toolkit"`; then
        rm /var/www/dojo-toolkit
    fi

    printf "  Untar the dojo library and create links\n"
    tar -xzf $src/dojo*.tar.gz
    mv -f dojo-release-1.9.0 /usr/local/web/$module/


    chown -R $SERVICE_USER:$SERVICE_USER /usr/local/web

    printf "Skipping creation of setup startup scripts -- look at comments if you need to do these manually.\n"
#    printf "Setup startup scripts\n"
#    cp -f $src/etc/init.d/sysconfig.sh /etc/init.d/
#    chmod 755 /etc/init.d/sysconfig.sh
#    if `test -f "/etc/rc2.d/S27sysconfig"`; then
#      rm /etc/rc2.d/S27sysconfig
#    fi
#    ln -s /etc/init.d/sysconfig.sh /etc/rc2.d/S27sysconfig

#    if `test -f "/etc/rc.local"`; then
#      rm /etc/rc.local
#    fi

#    cp -f $src/etc/rc.local /etc/
#    chmod 755 /etc/rc.local

    printf "\n*****************************************************\n"
    printf "The Apache2 and "$module" web services were stopped during\n"
    printf "this update.  You can restart them now using\n"
    printf "    sudo service apache2 restart\n"
    printf "*****************************************************\n"

fi

chown -hR $SERVICE_USER:$SERVICE_USER /var/www/$module

printf "\nTarget installer complete!\n"

exit 0
