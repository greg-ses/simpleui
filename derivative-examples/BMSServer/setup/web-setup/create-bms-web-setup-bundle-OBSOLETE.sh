#!/bin/sh

set -e

if (($# < 1)); then
        printf "\ncreate-bms-web-setup-bundle.sh\n\nUsage: Expected 1 arg, but saw $#\n\n  Expected Arguments:\n\n    arg[1]: staging folder\n\n"
        printf "\nExample: \n\n    sh create-bms-web-setup-bundle.sh  ~/bms-staging-area  \n\n\n"
        exit 1
fi

quiet=0
if $(test "${2}" = "quiet"); then quiet=1; fi

actualFolder="$(basename $(dirname $(dirname $PWD)))/$(basename $(dirname $PWD))/$(basename $PWD)"
if `test "$actualFolder" != "BMSServer/setup/web-setup"`; then
        printf "\ncreate-web-setup-bundle.sh\n\nUsage: Must execute from target/BMSServer/setup/web-setup folder\n\n"
        exit 1
fi

target_common="../../../common"
SIMPLE_UI_FOLDER="../../../common/web/apps/ng-simple-ui"
staging="$1"

printf "\nExecuting:  create-bms-web-setup-bundle.sh \"$staging\"\n\n"

if `test -d "$staging"`; then
  printf "  Aborting -- Destination folder \"$staging\" already exists.\n";
  exit 1
fi

if ((quiet == 0)); then
    printf "Copying files to folder \"$staging\"\n"
fi

printf "Staging bms web folder\n"
mkdir -p $staging/web

sh ${SIMPLE_UI_FOLDER}/src/public/merge-derived-app.sh ${SIMPLE_UI_FOLDER}/dist.tgz ../../web/simple_ui.derivative  $staging/web/bms -d -i

rm $staging/web/bms/sample_ui.properties
rm $staging/web/bms/index.0.html

cp -rf ../../../common/web/html/     $staging/web/bms/
cp -rf ../../../common/web/angularjs $staging/web/bms/
cp ./bms-web-setup.sh   $staging/
chmod 770 $staging/bms-web-setup.sh

sed -i '1,$s/BSCServer.properties/BMSServer.properties/g' $staging/web/bms/html/ParamsApp/Parameters.properties
sed -i -e '1,$s^BSCServer.properties^BMSServer.properties^' -e '1,$s^/var/www/bsc^/var/www/bms^' $staging/web/bms/html/ParamsApp/php/ParamHelper.php

pushd ${staging}/..
tar -czf bms-web-setup-bundle.tgz "$(basename ${staging})"
popd

if ((quiet == 0)); then
    printf "\nUpdate of 'bms-web-setup-bundle.tgz.' is complete.\n"
    cat instructions.txt
    printf "\nFinished.\n"
fi

exit 0
