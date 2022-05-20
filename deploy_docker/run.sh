#!/bin/bash

# Print command line help
if test "$#" \< "1"; then
  printf "\n    run.sh - runs simpleui for docker\n"
  printf "\n    Usage: run.sh YOUR_APP_NAME\n"
  printf "      where 'YOUR_APP_NAME' is the name of the application.\n"
  exit 1
fi
# Parse command line
app_name="$1"

# Run the merging script
# shellcheck source=/dev/null
source /scripts/merge_app.sh "$app_name"

# Run apache
apache2ctl start

# Run node
node /var/www/"$app_name"/simpleui-server/simpleui-server.js --mode=daemon --appName="$app_name" --webPort=2080

bash
