#!/bin/sh

set -e

if `test "$#" != "1"`; then
        printf "\nbms-web-setup.sh\n\nUsage: Expected 1 args, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: src folder\n"
        printf "\nExample: \n\n  sudo ./bms-staging-area/bms-web-setup.sh  ~/bms-staging-area  \n\n"
        exit 1
fi

src="$1"

bash ${src}/web/bms/php/setup_ram_disk.sh -f

if `test -d "/var/www/bms"`; then
  rm -rf /var/www/bms
fi

cp -rf ${src}/web/bms /var/www/bms
chown -R service:service /var/www/bms

replace "--appName=bms" "--appName=bms,device" -- /var/www/bms/simpleui-server/bms-web.service
cp /var/www/bms/simpleui-server/bms-web.service /etc/systemd/system/bms-web.service
chown root:root /etc/systemd/system/bms-web.service
chmod 644 /etc/systemd/system/bms-web.service

systemctl restart apache2

printf "Target installer complete!\n"

exit 0
