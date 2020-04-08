#!/usr/bin/env bash

if [ $# -lt 2 ]; then
  echo 1>&2 "$0: <Site name> <bms bms-ui bms-and-proxy-ui devapp devapp-dbg devui devconfig devimage ems emsui proxyui all>"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: Too many arguments"
  exit 2
fi

export ANSIBLE_NOCOWS=1
# export ANSIBLE_COW_SELECTION=random

case "$2" in
  "ems")
    echo Updating EMS
    ansible-playbook acinv-update.yml -K --limit $1
    ;;
  "emsui")
    echo Updating EMS User Interface
    ansible-playbook ems-web-setup.yml -K --limit $1
    ;;
  "bms")
    echo Updating BMS
    ansible-playbook bmsapp-update.yml -K --limit $1
    ;;
  "bms-and-proxy-ui")
    echo Updating BMS Web UI and VEC Proxy Web UI
    ansible-playbook bms-web-setup.yml proxyui-web-setup.yml -K --limit $1
    ;;
  "bms-ui")
    echo Updating BMS Web UI
    ansible-playbook bms-web-setup.yml -K --limit $1
    ;;
  "devapp")
    echo Updating DeviceService, VECProxy And Config Files
    ansible-playbook vecpackage-devapp.yml --limit $1 -K
    ssh service@$1 ansible-playbook /opt/deploy/devapp-update.yml --limit Sys-Units
    ;;
  "devapp-dbg")
    echo Updating DeviceService And VECProxy Binary Only
    ansible-playbook vecpackage-devapp.yml --limit $1 -K
    ssh service@$1 ansible-playbook /opt/deploy/devapp-updatedbg.yml --limit Sys-Units
    ;;
  "devui")
    echo Updating Device Web UI
    ansible-playbook vecpackage-ui.yml --limit $1
    ssh service@$1 ansible-playbook /opt/deploy/devui-update.yml --limit Sys-Units
    ;;
  "devconfig")
    echo Configuration
    ansible-playbook vecpackage-unitconfig.yml --limit $1
    ssh service@$1 ansible-playbook /opt/deploy/dev-unitconfig.yml --limit Sys-Units
    ;;
  "devimage")
    echo Updating VEC image files
    ansible-playbook vecpackage-image.yml --limit $1
    ssh service@$1 ansible-playbook /opt/deploy/devimage-update.yml --limit Sys-Units
    ;;
  "proxyui")
    echo Updating VEC Proxy Web UI
    ansible-playbook proxyui-web-setup.yml --limit $1 -K
    ;;
  "all")
    echo Updating BMS App, BMS Web UI, Device Service, and configuration script
    ./send_packages.sh $1
    ansible-playbook bmsapp-update.yml -K --limit $1
    ansible-playbook bms-web-setup.yml -K --limit $1
    cd ../setup/vec-web-proxy-setup && ansible-playbook proxy-web-setup.yml --limit $1 -K
    ssh service@$1 ansible-playbook /opt/deploy/devapp-update.yml --limit Sys-Units
    ssh service@$1 ansible-playbook /opt/deploy/devui-update.yml --limit Sys-Units
    ssh service@$1 ansible-playbook /opt/deploy/dev-unitconfig.yml --limit Sys-Units
    ;;
  *)
    echo "You have failed to specify what to do correctly."
    exit 1
    ;;
esac

