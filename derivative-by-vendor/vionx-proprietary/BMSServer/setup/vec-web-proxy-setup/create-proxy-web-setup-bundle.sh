#!/bin/sh

set -e
startdir=$(pwd)

if `test "$#" != "1"`; then
        printf "\ncreate-proxy-web-setup-bundle.sh\n\nUsage: Expected 1 arg, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: staging folder\n\n"
        printf "\nExample: \n\n    sh create-proxy-web-setup-bundle.sh  ~/arm-staging-area  \n\n\n"
        exit 1
fi


target_common="../../../common"
staging="$1"

printf "\nExecuting:  create-proxy-web-setup-bundle.sh \"$staging\"\n\n"

if `test -d "$staging"`; then
  printf "  Aborting -- Destination folder \"$staging\" already exists.\n";
  exit 1
fi

printf "Copying files to folder \"$staging\"\n"

printf "Staging arm web folder\n"
mkdir -p $staging/web

sh $target_common/web/apps/ng-simple-ui/src/public/merge-derived-app.sh $target_common/web/apps/ng-simple-ui/dist.tgz ../../../arm/web/simple_ui.derivative  $staging/web/device -d -i

rm $staging/web/device/sample_ui.properties
rm $staging/web/device/index.0.html

cp -rf ../../../common/web/html/     $staging/web/device/
cp -rf ../../../common/web/angularjs $staging/web/device/
cp ./proxy-web-setup.sh   $staging/
chmod 770 $staging/proxy-web-setup.sh

outdir="/tmp"
cd "$staging/.."

tar -czvf $outdir/proxy-web-setup-bundle.tgz -C $staging .

cd $startdir

printf "\nUpdate of 'proxy-web-setup-bundle.tgz.' is complete.\n"
cat instructions.txt
printf "\nFinished.\n"

exit 0

