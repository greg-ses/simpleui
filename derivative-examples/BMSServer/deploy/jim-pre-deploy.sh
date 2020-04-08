#! /bin/bash
user_and_group=$1:$1

sudo chown -R ${user_and_group} /var/www
sudo chmod -R 775 /var/www

sudo chown -R ${user_and_group} /tmp/proxy-staging-local
sudo chmod -R 775 /tmp/proxy-staging-local

