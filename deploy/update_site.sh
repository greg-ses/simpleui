#!/usr/bin/env bash

if [ $# -lt 2 ]; then
  echo 1>&2 "$0: <Site name> <simpleui all>"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: Too many arguments"
  exit 2
fi

export ANSIBLE_NOCOWS=1
# export ANSIBLE_COW_SELECTION=random

case "$2" in
  "simpleui")
    echo Updating ng-simple-ui User Interface
    ansible-playbook ng-simple-ui-web-setup.yml -K --limit $1 --extra-vars "include_mock_data=-i"

    ;;
  "all")
    echo Updating ng-simple-ui User Interface
    ansible-playbook ng-simple-ui-web-setup.yml -K --limit $1
    ;;
  *)
    echo "You have failed to specify what to do correctly."
    exit 1
    ;;
esac

