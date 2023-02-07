#!/bin/bash



all_args="$@";

if test "$#" \< "2"; then
    echo "run.sh - runs simpleui for docker";
    echo "Usage: run.sh YOUR_APP_NAME --zmqHostname=YOUR_ZMQ_HOSTNAME";
    echo "Other options include:";
    printf "\t zmqHostname ==> (required) address/hostname of native app zmq sockets \n";
    printf "\t dbName      ==> (optional) override DB name \n";
    printf "\t themeName   ==> (optional) override themeName \n";
    printf "\t urlResource ==> (optional) override the RESOURCE param for all appLink urls \n"
    exit 1;
fi

# parse app name
app_name="$1";

# Parse cli args and set dbName override for webapps to ingest
for i in "$@"
do
  case $i in
    --dbName=*)
      dbName="${i#*=}"
      echo "export SUI_DB_NAME_OVERRIDE='$dbName'" >> ~/.bashrc && source ~/.bashrc # set env var
      shift
      ;;
    *)
      # unknown option
      ;;
  esac
done

echo "The database name is: $dbName"


# Run the merging script
source /scripts/merge_app.sh "$app_name"

# Run apache
#apache2ctl start
docker-php-entrypoint apache2-foreground &


# Run node
node /var/www/"$app_name"/simpleui-server/simpleui-server.js --mode=daemon --webPort=2080 --appName="$app_name" "$all_args"
