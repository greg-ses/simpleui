# TO UPDATE USING ANSIBLE 2.7.1:

    Make sure you can log into Crystal device or VM to be updated without password using ssh.
    To do this do:
    ssh-copy-id ${REMOTE_WEB_USER}@BMS_HOSTNAME

    Verify you can log in without password using:
    ssh ${REMOTE_WEB_USER}@BMS_HOSTNAME

    add a group containing the BMS_HOSTNAME to /etc/ansible/hosts

    ansible <host-pattern> --become --ask-become-pass --module-name=bms-web-setup.yml

    Example:

    cd target/BMSServer/deploy
    ansible-playbook bms-web-setup.yml --ask-become-pass --limit=BMS_HOSTNAME --syntax-check
    ansible-playbook bms-web-setup.yml --ask-become-pass --limit=BMS_HOSTNAME

    OR, USE THE SHORTCUT SCRIPT
    ./site_update BMS_HOSTNAME bmsui

# Using build-base-web-packages.sh

This script will compile node_modules and dist.tgz files needed for application specific packaging and place them in the specified output folder. This script is useful in
conjunction with application specific build scripts to prepare build artifacts which can then be used by a deployment tool, such as ansible.

