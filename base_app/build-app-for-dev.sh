#!/bin/sh

BASE_DIR=ng-simple-ui

if (($#<3)); then
    printf "\nERROR - missing arguments - expected 4 but saw $#\n"
    printf "    arg[1] - 0: SKIP ANGULAR BUILD, 1: RUN ANGULAR BUILD \n"
    printf "    arg[2] - app: one of (device, bms, bsc, CorrosionStation, FlowStation, purification, SimDoeServer, SimPureServer, SimVNX1000Server, VTSServer)\n"
    printf "    arg[3] - workspace path\n"
    printf "    arg[4] - (optional) username to own files in /var/www/app (default: service)\n"
    printf "    arg[5] - (optional) any value: ignore /var/www ownership (use when invoking with sudo)\n"
    printf "\n"
    exit 1
fi

VAR_WWW_OWNER_AND_GROUP=$(stat --format="%U:%G" /var/www)
if (($#<4)) && $(test "${USER}:${USER}" != ${VAR_WWW_OWNER_AND_GROUP}); then
    printf "\nERROR - unable to write subdirectory of /var/www"
    printf "\n  USER:GROUP expected: ${USER}:${USER}"
    printf "\n  USER:GROUP observed: ${VAR_WWW_OWNER_AND_GROUP}\n"
    printf "\n  You may need to run with 'sudo' and add args 3 and 4 to so you can write to /var/www\n\n"
    exit 1
fi

runFolder="$(basename $(dirname $(dirname $PWD)))/$(basename $(dirname $PWD))/$(basename $PWD)"
if $(test "$runFolder" != "web/apps/${BASE_DIR}"); then
        printf "\nERROR\n\nbuild-app-for-dev.sh\n\n    Usage: Must execute from target/bsc/setup/web-setup folder\n\n"
        exit 1
fi

build_angular=$1

if (($build_angular==1)); then
  npm run build-dev && npm run post-build-step
  if (($? != 0)); then
    printf ">>> ERROR in 'npm run build' <<<\n";
    exit 1;
  fi
fi

app=$2
src=${app}

# Fix src that are different than app
if $(test "${app}" = "device");       then src=arm;          fi
if $(test "${app}" = "bms");          then src=BMSServer;    fi
if $(test "${app}" = "purification"); then src=Purification; fi

NG_SIMPLE_UI_DIR=~/$3/vionx_linux/target/common/web/apps/${BASE_DIR}
APP_DERIVATIVE_DIR=~/$3/vionx_linux/target/${src}/web/simple_ui.derivative

printf "app: ${app}\n"
printf "src: ${src}\n"
printf "NG_SIMPLE_UI_DIR: ${NG_SIMPLE_UI_DIR}\n"
printf "APP_DERIVATIVE_DIR: ${APP_DERIVATIVE_DIR}\n"


username="service"
if (($#>3)); then
    username="$4"
fi

# Merge the derived app with ng-simple-ui
sh -x src/public/merge-derived-app.sh ./dist.tgz ${APP_DERIVATIVE_DIR} /var/www/${app} -i -d ${username}

# Create a link to the mock files we test with
if $(test -d /var/www/${app}/mock-data); then rm -r /var/www/${app}/mock-data; fi
ln -s ${NG_SIMPLE_UI_DIR}/src/public/mock-data   /var/www/${app}/mock-data

# link all ui properties files
if $(test -d ${APP_DERIVATIVE_DIR}); then
  for f in $(ls -1 ${APP_DERIVATIVE_DIR}/*.properties); do
    rm -f /var/www/${app}/$(basename ${f})
    ln -s ${f} /var/www/${app}/$(basename ${f});
  done
fi

# link to mock ui.properties file
if $( (test -L /var/www/${app}/ui.properties) || (test -f /var/www/${app}/ui.properties)); then rm /var/www/${app}/ui.properties; fi
ln -s ${NG_SIMPLE_UI_DIR}/src/public/mock-data/ui.${app}.mock.properties   /var/www/${app}/ui.properties

# Link to ng-simple-ui mock-data files
for f in $(ls -1 ${NG_SIMPLE_UI_DIR}/src/public/mock-data/*.*); do
    rm /var/www/${BASE_DIR}/mock-data/$(basename ${f});
    ln -s ${f} /var/www/${BASE_DIR}/mock-data/$(basename ${f});
done

if $(! test -d /var/www/${app}/nodejs); then mkdir /var/www/${app}/nodejs; fi

# Remove all installed nodejs .js scripts so we can link to the development versions
for f in $(ls -1 /var/www/${app}/nodejs/*.*); do
    rm ${f};
done

# Link to ng-simple-ui php scripts
for f in $(ls -1 ${NG_SIMPLE_UI_DIR}/dist/nodejs/*); do
    ln -s ${f} /var/www/${app}/nodejs/$(basename ${f});
done


if $(! test -d /var/www/${app}/php); then mkdir /var/www/${app}/php; fi

# Remove all installed php scripts so we can link to the development versions
for f in $(ls -1 /var/www/${app}/php/*.*); do
    rm ${f};
done

# Link to ng-simple-ui php scripts
for f in $(ls -1 ${NG_SIMPLE_UI_DIR}/src/public/php/*.*); do
    ln -s ${f} /var/www/${app}/php/$(basename ${f});
done

# Link to derived php scripts
if $(test -d ${APP_DERIVATIVE_DIR}); then

  for f in $(ls -1 ${APP_DERIVATIVE_DIR}/php/*.php); do
    ln -s ${f} /var/www/${app}/php/$(basename ${f});
  done
fi

#Symbollically link htaccess, if it exists
for f in $(ls -1 /var/www/${app}/.htaccess); do
    rm ${f};
done

for f in $(ls -1 ${APP_DERIVATIVE_DIR}/.htaccess); do
    ln -s ${f} /var/www/${app}/$(basename ${f});
done

printf "\nBUILD ORIGIN: ${NG_SIMPLE_UI_DIR}\n" >> /var/www/${app}/version.txt

