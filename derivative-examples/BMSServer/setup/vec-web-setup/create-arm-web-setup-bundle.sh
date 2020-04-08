#!/bin/sh

set -e

if `test "$#" != "1"`; then
        printf "\ncreate-arm-web-setup-bundle.sh\n\nUsage: Expected 1 arg, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: staging folder\n\n"
        printf "\nExample: \n\n    sh create-arm-web-setup-bundle.sh  ~/arm-staging-area  \n\n\n"
        exit 1
fi

actualFolder="$(basename $(dirname $(dirname $PWD)))/$(basename $(dirname $PWD))/$(basename $PWD)"
if `test "$actualFolder" != "BMSServer/setup/vec-web-setup"`; then
        printf "\ncreate-web-setup-bundle.sh\n\nUsage: Must execute from BMSServer/setup/vec-web-setup folder\n\n"
        exit 1
fi

target_common="../../../common"
staging="$1"

printf "\nExecuting:  create-arm-web-setup-bundle.sh \"$staging\"\n\n"

if `test -d "$staging"`; then
  printf "  Aborting -- Destination folder \"$staging\" already exists.\n";
  exit 1
fi

printf "Copying files to folder \"$staging\"\n"

printf "Staging arm web folder\n"
mkdir -p $staging/web

sh $target_common/web/apps/simple_ui/src/public/merge-derived-app.sh $target_common/web/apps/simple_ui/dist.tgz ../../web/simple_ui.derivative  $staging/web/device -d -i

rm $staging/web/device/sample_ui.properties
rm $staging/web/device/index.0.html

cp -rf ../../../common/web/html/     $staging/web/device/
cp -rf ../../../common/web/angularjs $staging/web/device/
cp ./arm-web-setup.sh   $staging/
chmod 770 $staging/arm-web-setup.sh

outdir="$PWD"
cd "$staging/.."

tar -czvf $outdir/arm-web-setup-bundle.tgz "$(basename $staging)"

cd $outdir

printf "\nUpdate of 'arm-web-setup-bundle.tgz.' is complete.\n"
cat instructions.txt
printf "\nFinished.\n"

exit 0

