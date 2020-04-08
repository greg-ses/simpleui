#!/usr/bin/env bash

ansible-playbook vecpackage-unitconfig.yml --limit $1
ansible-playbook vecpackage-devapp.yml --limit $1 -K
ansible-playbook vecpackage-ui.yml --limit $1
