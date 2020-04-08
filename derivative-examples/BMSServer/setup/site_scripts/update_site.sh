#!/usr/bin/env bash


cd bms
./update_bms_servers.sh

#cd ../bmc
#ansible-playbook update_module_servers.yml --extra-vars=hosts="moduleservers"


cd ..
