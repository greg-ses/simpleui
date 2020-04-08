#!/bin/sh

if $(test "$#" = 0) || ($(test "$#" = 1) && $(test "$1" = "nodevlinks")); then
  npm run build
  if [ $? != 0 ]; then
    printf ">>> ERROR in 'npm run build' <<<\n";
    exit 1;
  fi
fi

sh -x src/public/merge-derived-app.sh ./dist.tgz ../../test_simple_ui_javascript/simple_ui.derivative /var/www/mock -d jscarsdale

if $(test "$1" = "nodevlinks"); then
    printf "\n\$1 is '%s' - EXIT without creating development links.\n\n", "$1"
    exit 0
fi

if $(test -d /var/www/simple_ui/mock-data); then rm -rf /var/www/simple_ui/mock-data; fi
mkdir /var/www/simple_ui/mock-data

if $(test -d /var/www/simple_ui/overlay-1); then rm -rf /var/www/simple_ui/overlay-1; fi
tar xzvf ./src/public/example-overlay.tgz -C /var/www/simple_ui/
mv /var/www/simple_ui/example-overlay /var/www/simple_ui/overlay-1

for ((i=0; i<3; i=i+1));
do
    if $(test -f /var/www/simple_ui/mock-data/mock-dashboard-overlay-data.$i.xml); then rm /var/www/simple_ui/mock-data/mock-dashboard-overlay-data.$i.xml; fi;
    ln -s  $PWD/src/public/mock-data/mock-dashboard-overlay-data.$i.xml     /var/www/simple_ui/mock-data/mock-dashboard-overlay-data.$i.xml;

    if $(test -f /var/www/simple_ui/mock-data/mock-data.$i.xml); then rm /var/www/simple_ui/mock-data/mock-data.$i.xml; fi;
    ln -s  $PWD/src/public/mock-data/mock-data.$i.xml     /var/www/simple_ui/mock-data/mock-data.$i.xml;
done

if $(test -f /opt/config/MOCKServer.properties); then rm /opt/config/MOCKServer.properties; fi;
ln -s ${PWD}/src/public/mock-config/MOCKServer.properties /opt/config/MOCKServer.properties

if $(test -f /var/www/simple_ui/ui.properties); then rm /var/www/simple_ui/ui.properties; fi;
ln -s ${PWD}/src/public/sample_ui.properties.txt /var/www/simple_ui/ui.properties

if $(test -f /var/www/simple_ui/mock-php/mock-dashboard-overlay-cmd.php); then rm /var/www/simple_ui/mock-php/mock-dashboard-overlay-cmd.php; fi;
ln -s ${PWD}/src/public/mock-php/mock-dashboard-overlay-cmd.php /var/www/simple_ui/mock-php/mock-dashboard-overlay-cmd.php

if $(test -f /var/www/simple_ui/php/get_mock_data.php); then rm /var/www/simple_ui/php/get_mock_data.php; fi;
ln -s ${PWD}/src/public/php/get_mock_data.php /var/www/simple_ui/php/get_mock_data.php
