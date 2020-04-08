#!/bin/sh

set -e

if `test "$#" -lt "1"`; then
    printf "\nproxy-web-setup.sh\n\nUsage: Expected 1 args, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: src folder\n"
    printf "\nExample: \n\n  sudo ./proxy-staging-area/proxy-web-setup.sh  ~/proxy-staging-area  \n\n"
    exit 1
fi

WEB_USER=service
if `test "$#" = "2"`; then
    WEB_USER=$2
fi

src="$1"

if `test -d "/var/www/device"`; then
  rm -rf /var/www/device
fi

#touch /var/log/arm-command.log
#chown service:service /var/log/arm-command.log
#chmod 777 /var/log/arm-command.log

#touch /var/log/sui-data.log
#chown service:service /var/log/sui-data.log
#chmod 777 /var/log/sui-data.log

cp -rf $src/web/device /var/www/device

# chown -R ${WEB_USER}:${WEB_USER} /usr/share/apache2/htdocs/device

# systemctl restart apache2

printf "Target installer complete!"

exit 0
