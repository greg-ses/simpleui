#!/bin/bash



all_args="$@";

if test "$#" \< "2"; then
    echo "run.sh - runs simpleui for docker";
    echo "Usage: run.sh YOUR_APP_NAME --zmqHostname=YOUR_ZMQ_HOSTNAME";
    echo "Other options include:";
    printf "\t zmqHostname ==> address/hostname of native app zmq sockets (required)\n";
    printf "\t dbName      ==> override DB name (optional)\n";
    printf "\t themeName   ==> override themeName (optional)\n";
    exit 1;
fi

# parse app name
app_name="$1";

# Run the merging script
source /scripts/merge_app.sh "$app_name"

# Run apache
#apache2ctl start
docker-php-entrypoint apache2-foreground &

# Run node
node /var/www/"$app_name"/simpleui-server/simpleui-server.js --mode=daemon --webPort=2080 --appName="$app_name" "$all_args"
