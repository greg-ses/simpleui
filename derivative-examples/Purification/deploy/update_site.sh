#!/usr/bin/env bash

if [ $# -lt 2 ]; then
  echo 1>&2 "$0  {SiteName}  {pure_bin | pure_ui | all}"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: Too many arguments"
  exit 2
fi

export ANSIBLE_NOCOWS=1
# export ANSIBLE_COW_SELECTION=random

case "$2" in
  "pure_ui")
    echo Updating Purification Web UI
    ansible-playbook pur-web-setup.yml -K --limit $1
    ;;
  "pure_bin")
    echo Updating Purification binary
    ansible-playbook pureapp-update.yml -K --limit $1
    ;;
  "all")
    echo Updating Purification UI
    ansible-playbook pureapp-update.yml -K --limit $1
    ansible-playbook pur-web-setup.yml  -K  --limit $1
    ;;
  *)
    echo "You have failed to specify what to do correctly."
    exit 1
    ;;
esac

