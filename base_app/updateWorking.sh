#!/usr/bin/env bash

pushd ~

cd ~/${SC_CONTEXT}/target/BMSServer/setup/vec-web-setup
rm -rf ~/arm-staging-area; sh create-arm-web-setup-bundle.sh  ~/arm-staging-area
pushd ~;sudo sh ./arm-staging-area/arm-web-setup.sh arm-staging-area;popd

cd ~/${SC_CONTEXT}/target/BMSServer/setup/web-setup
rm -rf ~/bms-staging-area && ./create-bms-web-setup-bundle.sh ~/bms-staging-area
pushd ~/bms-staging-area; sudo sh bms-web-setup.sh ~/bms-staging-area; popd

cd ~/${SC_CONTEXT}/target/BMSServer/deploy
./update_site.sh jks-ubuntu16-dev proxyui

cd /home/jscarsdale/${SC_CONTEXT}/target/SimVNX1000Server/setup
rm -rf ~/web-staging-area;./create-web-bundle.sh ~/web-staging-area
pushd ~/web-staging-area;sudo sh sim-web-setup.sh; popd

popd
