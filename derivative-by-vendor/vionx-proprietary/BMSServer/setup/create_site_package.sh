#!/usr/bin/env bash

if `test -d "/tmp/site_install"`; then
  rm -rf /tmp/site_install
fi

mkdir -p /tmp/site_install/bms
cp ../../../../output/BMSServer/bin/BMSServer /tmp/site_install/bms/
cp ../../../../output/EvQueDBServer/bin/EvQueDBServer /tmp/site_install/bms/
cp site_scripts/update_bms_servers.sh /tmp/site_install/bms/

#mkdir -p /tmp/site_install/bmc
#cp ../../module/bin/ModuleServer /tmp/site_install/bmc/
#cp ../../module/bin/EvQueDBServer /tmp/site_install/bmc/
#cp site_scripts/update_module_servers.yml /tmp/site_install/bmc/

cp site_scripts/update_site.sh /tmp/site_install

cd /tmp
tar -czvf site_package.tar.gz site_install
cd -
cp /tmp/site_package.tar.gz .

