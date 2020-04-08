#!/bin/bash
save_dir=$PWD

cd ../../../../BMSServer/setup/web-setup

rm -r ~/bms-staging-area
sh ./create-bms-web-setup-bundle.sh ~/bms-staging-area

cd ~
sudo sh ./bms-staging-area/bms-web-setup.sh bms-staging-area

sudo chown -R ${USER}:${USER} /var/www

cd ${save_dir}
