#!/usr/bin/env bash

/opt/bin/stop.sh
sleep 2

mkdir -p ~/backups

tar czvf ~/backups/optdir-$(date +%Y-%m-%d--%H-%M).tgz /opt

sleep 2

cp ./BMSServer /opt/bin/
cp ./EvQueDBServer /opt/bin/
/opt/bin/start.sh

