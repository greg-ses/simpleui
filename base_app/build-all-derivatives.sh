#!/usr/bin/env bash

SAVE_DIR=${PWD}

cd ../../../../arm/setup
if $(test -d ~/web-staging-area); then rm -r ~/web-staging-area; fi
sh build_update_ui.sh ~/web-staging-area

cd ${SAVE_DIR}
cd ../../../../BMSServer/setup/web-setup
if $(test -d ~/bms-staging-area); then rm -r ~/bms-staging-area; fi
sh create-bms-web-setup-bundle.sh  ~/bms-staging-area

cd ${SAVE_DIR}
cd ../../../../bsc/setup/web-setup
if $(test -d ~/bsc-staging-area); then rm -r ~/bsc-staging-area; fi
sh create-bsc-web-setup-bundle.sh ~/bsc-staging-area

cd ${SAVE_DIR}
cd ../../../../CarelChillerServer/setup/web-setup
if $(test -d ~/CarelChillerServer-staging-area); then rm -r ~/CarelChillerServer-staging-area; fi
sh create-web-setup-bundle.sh ~/CarelChillerServer-staging-area

#cd ${SAVE_DIR}
#cd ../../../../CorrosionStation/setup/
#if $(test -d ~/corrosion-staging-area); then rm -r ~/corrosion-staging-area; fi
#sh create-web-setup-bundle.sh  ~/corrosion-staging-area

cd ${SAVE_DIR}
cd ../../../../FlowStation/setup/
if $(test -d ~/flow-staging-area); then rm -r ~/flow-staging-area; fi
sh create-flow-web-setup-bundle.sh ~/flow-staging-area

cd ${SAVE_DIR}
cd ../../../../Purification/setup
if $(test -d ~/purification-staging-area); then rm -r ~/purification-staging-area; fi
sh create-web-setup-bundle.sh ~/purification-staging-area

cd ${SAVE_DIR}
cd ../../../../SimDoeServer/setup
if $(test -d ~/web-staging-area); then rm -r ~/web-staging-area; fi
sh create-web-bundle.sh ~/web-staging-area

cd ${SAVE_DIR}
cd ../../../../SimPureServer/setup/
if $(test -d ~/web-staging-area); then rm -r ~/web-staging-area; fi
sh create-web-bundle.sh ~/web-staging-area

cd ${SAVE_DIR}
cd ../../../../SimVNX1000Server/setup
if $(test -d ~/web-staging-area); then rm -r ~/web-staging-area; fi
sh create-web-bundle.sh ~/web-staging-area

cd ${SAVE_DIR}
cd ../../../../VTSServer/setup
if $(test -d ~/vts-staging-area); then rm -r ~/vts-staging-area; fi
sh create-web-setup-bundle.sh ~/vts-staging-area

cd ${SAVE_DIR}
