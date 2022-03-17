#!/bin/bash

# Tom Alexander, 2021
# This script will build the base dist.tgz files needed to create and deploy other web apps.
# Usage: build-base-web-packages.sh <output base directory>

if [ "$#" -ne 1 ] || ! [ -d "$1" ]; then
  echo "Usage: $0 <output base directory>" >&2
  echo "This script must be run from it's directory!" >&2
  exit 1
fi


BASEDIR=$(pwd)

set -e

mkdir -p $1/simpleui/base_app
mkdir -p $1/simpleui/simpleui-server

cd ../base_app
rm -rf node_modules
rm -f dist.tgz
npm install
npm run build-client-prod

cd ../simpleui-server
rm -rf node_modules
rm -f dist.tgz
npm install
npm run build

cd $BASEDIR
