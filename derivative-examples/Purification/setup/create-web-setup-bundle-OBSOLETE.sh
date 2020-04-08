#!/bin/sh

set -e

moduleDir=$(basename $(dirname ${PWD}))
module="${moduleDir,,}"
staging=~/$module-staging-area

if `test "$(basename $(dirname $PWD))/$(basename $PWD)" != "$moduleDir/setup"`; then
        printf "\ncreate-web-setup-bundle.sh\n\nUsage: Must execute from linux/target/<module name>/setup folder\n\n"
        exit 1
fi

target_common="../../common"

printf "\nExecuting:  create-web-setup-bundle.sh \"$staging\"\n\n"

if `test -d "$staging"`; then
  echo "  Aborting -- Destination folder \"$staging\" already exists.\n";
  exit 1
fi

printf "Copying files to folder \"$staging\"\n"

printf "Staging "$module" web folder\n"
mkdir -p $staging/web

sh ../../common/web/apps/ng-simple-ui/src/public/merge-derived-app.sh ../../common/web/apps/ng-simple-ui/dist.tgz ../web/simple_ui.derivative  $staging/web/$module -i

rm $staging/web/$module/sample_ui.properties
rm $staging/web/$module/index.0.html
tar czfv $staging/$module-legacy-web.tgz -C ../../common/module_derivative/web  appJs config.js css favicon.ico images io.html js ppcJs pumps.html

cp ../../common/web/dojo-release-1.9.0.tar.gz $staging/

cp ../../common/module_derivative/web/io.html $staging/web/$module/
cp ../../common/module_derivative/web/pumps.html $staging/web/$module/
cp -r ../../common/module_derivative/web/php/ $staging/web/$module

cp -rf ../../common/web/html/     $staging/web/$module/
cp -rf ../../common/web/angularjs $staging/web/$module/

sed -i "1,\$s/BSCServer.properties/${moduleDir}Server.properties/g" $staging/web/${module}/html/ParamsApp/Parameters.properties
sed -i -e "1,\$s/BSCServer.properties/${moduleDir}Server.properties/" -e "1,\$s^/var/www/bsc^/var/www/${module}^" $staging/web/${module}/html/ParamsApp/php/ParamHelper.php


cp ./web-setup.sh   $staging/
chmod 770 $staging/web-setup.sh


outdir="$PWD"
cd "$staging/.."

tar -czf $outdir/$module-web-setup-bundle.tar.gz "$(basename $staging)"

cd $outdir

printf "\nUpdate of '$module-web-setup-bundle.tar.gz.' is complete.\n"
printf "\n\tTo install on the $moduleDir server:\n"
printf "\n\t(Log into $moduleDir server)\n"
printf "\tcd /home/service\n"
printf "\tscp $USER@$(hostname):$PWD/$module-web-setup-bundle.tar.gz ./\n"
printf "\ttar xzvf $module-web-setup-bundle.tar.gz\n"
printf "\tsudo sh ~/$module-staging-area/web-setup.sh ~/$module-staging-area $module\n"
printf "\tsudo service apache2 restart\n"
printf "\nFinished.\n"

exit 0

