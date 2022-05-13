#!/bin/bash

# Tom Alexander, 2021
# This script will build the base dist.tgz files needed to create and deploy other web apps.
# Usage: build-base-web-packages.sh <output base directory> [dev]
#        If the optional argument "dev" is passed, then a dev version of the simpleui client will be built.

if [ "$#" -lt 1 ] || ! [ -d "$1" ]; then
  echo "Usage: $0 <output base directory>" >&2
  echo "This script must be run from it's directory!" >&2
  exit 1
fi

sui_client_type="prod"
if [ "$#" -gt 1 ] && [[ "$2" == "dev" ]]; then sui_client_type="dev"; fi

skip_install="false"
if [ "$#" -gt 2 ] && [[ "$3" == "skip_install" ]]; then skip_install="true"; fi

BASEDIR=$(pwd)

set -e

mkdir -p $1/simpleui/base_app
mkdir -p $1/simpleui/simpleui-server

cd ../base_app
rm -f dist.tgz
if [[ "${skip_install}" == "false" ]]; then
    rm -rf node_modules
    npm install
fi

export NPM_COPY_DIST_TO_OUTPUT=false
npm run build-client-${sui_client_type}
cp dist.tgz $1/simpleui/base_app/.

cd ../simpleui-server
rm -f dist.tgz
if [[ "${skip_install}" == "false" ]]; then
    rm -rf node_modules
    npm install
fi

export NPM_COPY_DIST_TO_OUTPUT=false
npm run build
cp dist.tgz $1/simpleui/simpleui-server/.

cd $BASEDIR
