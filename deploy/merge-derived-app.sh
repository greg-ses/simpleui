#!/bin/bash

if $(test "$#" \< "3"); then
  printf "\n    merge-derived-app.sh - Create a ng-simple-ui app, merging custom ui.properties and php folder\n"
  printf "\n    Usage: (only the given argument order is supported)\n"
  printf "\n      merge-derived-app.sh  simpleui_root_folder  derived_merge_folder  output_folder  [-d] [-i]\n"
  printf "\n"
  printf "      where 'simple_ui_dist' is the location of the built ng-simple-ui distribution 'dist.tgz'.\n"
  printf "            'merge_from_folder' is the folder to be merged with ng-simple-ui.\n"
  printf "            'output_folder' is the place to merge the contents of ng-simple-ui and custom files.\n"
  printf "            '-d' indicates to remove outputFolder if it already exists.\n"
  printf "            '-e' indicates that the example-overlay and test files also be included.\n"
  printf "            '-i' indicates that files from mock-data should also be included.\n"
  printf "\n    Example 1: (executed from linux/target/common/web/ng-simple-ui)\n"
  printf "           sh src/public/merge-derived-app.sh dist.tgz ../../../../bsc/web/simple_ui.derivative /var/www/bsc -d\n"
  printf "\n    Example 2: (executed from linux/target/bsc/setup)\n"
  printf "           sh ../../common/web/apps/ng-simple-ui/src/public/merge-derived-app.sh ../../common/web/apps/ng-simple-ui/dist.tgz ../web/simple_ui.derivative  /var/www/bsc -d\n"

else

  simple_ui_dist="$1/base_app/dist.tgz"
  simpleui_server_dist="$1/simpleui-server/dist.tgz"

  merge_from_folder="$2"
  output_folder="$3"
  basedir="$(basename ${output_folder})"

  web_port="2080"
  if [ "$4" == "-p" ]; then web_port="$5"; fi
  if [ "$5" == "-p" ]; then web_port="$6"; fi
  if [ "$6" == "-p" ]; then web_port="$7"; fi

  if $(test -d "${output_folder}"); then
      if [ "$4" == "-d" ] || [ "$5" == "-d" ] || [ "$6" == "-d" ]; then
        rm -rf "${output_folder}"
      else
        printf "\nError: Folder \"${output_folder}\" already exists.  Use \"-d\" to remove it first.\n\n"
        exit 1
     fi
  fi

  printf " + Add simple_ui files\n"
  mkdir "${output_folder}"

  tar xzf "${simple_ui_dist}" -C "${output_folder}"  --exclude=mock-data --exclude=example-overlay.tgz --exclude=example-overlay --exclude=examples

  tar xzf "${simpleui_server_dist}" -C "${output_folder}"

  mv ${output_folder}/simpleui-server/SERVICE-TEMPLATE.service ${output_folder}/simpleui-server/${basedir}-web.service
  sed -i \
    -e "1,\$s^{{APP_NAME}}^${basedir}^g" \
    -e "1,\$s^{{APP_LIST}}^${basedir}^g" \
    -e "1,\$s^{{APP_PORT}}^${web_port}^g" \
    ${output_folder}/simpleui-server/${basedir}-web.service

  # Include mock-data if -i was passed
  if [ "$4" == "-i" ] || [ "$5" == "-i" ] || [ "$6" == "-i" ] || [ "$7" == "-i" ]; then
    printf " + Add simple_ui mock-data, mock-config, and mock-php folders due to -i flag\n"
    tar xzf "${simple_ui_dist}" -C "${output_folder}" mock-config mock-data mock-php
  fi

  # Include example-overlay.tgz and example-overlay folder if -e was passed
  if [ "$4" == "-e" ] || [ "$5" == "-e" ] || [ "$6" == "-e" ]; then
    printf " + Add simple_ui example-overlay.tgz and folder due to -e flag\n"
    tar xzf "${simple_ui_dist}" -C "${output_folder}" example-overlay.tgz
    tar xzf "${output_folder}/example-overlay.tgz" -C "${output_folder}"
    tar xzf "${simple_ui_dist}" -C "${output_folder}" test
  fi


  # Add comments about the derivative app to the version.txt file
  printf "\n=======================================================" >> ${output_folder}/version.txt
  printf "\nSimple UI Derivative Information for [${basedir} web ui]" >> ${output_folder}/version.txt
  printf "\n=======================================================" >> ${output_folder}/version.txt
  printf "\n  built by: ${USER} on $(date +%Y-%m-%d_%H-%M)." >> ${output_folder}/version.txt
  printf "\n  pwd:      ${PWD}" >> ${output_folder}/version.txt
  printf "\n  based on: $(ls -la ${simple_ui_dist})" >> ${output_folder}/version.txt
  printf "\n  sha1sum:  $(sha1sum ${simple_ui_dist})\n" >> ${output_folder}/version.txt


  saveDir="$PWD"

 if $(test -d "${merge_from_folder}"); then
    cd "${merge_from_folder}"

    linksAtEndOfHead=""
    i=1
    while $(test -d "overlay-${i}/");
      do
        if $(test -d "${output_folder}/overlay-${i}/"); then
          printf "\nRemoving folder ${output_folder}/overlay-${i}/.\n"
          rm -rf "${output_folder}/overlay-${i}/\n"
        fi

        printf "\nAdd overlay-${i}/...\n"
        tar czf overlay-${i}.tgz overlay-${i}
        tar xzf overlay-${i}.tgz -C "${output_folder}"

        linksAtEndOfHead="${linksAtEndOfHead}\n<link href=\"/${basedir}/overlay-${i}/image-overlays.css\" rel=\"stylesheet\">"
        i=$(expr ${i} + 1)

      done

      cd "${saveDir}"
  fi


    linksAtEndOfHead="${linksAtEndOfHead}\n</head>"

  cd "${output_folder}"
  cp index.html index.0.html
  cat index.0.html | \
      awk -v newdir="$basedir" -v linksAtEndOfHead="$linksAtEndOfHead" -v web_port="$web_port"\
          '{ s=$0; \
             gsub("simple_ui", newdir, s); \
             gsub("simpleui", newdir, s); \
             gsub("WEB_PORT", web_port, s); \
             gsub("NgSimpleUi", newdir, s); \
             gsub("ng-simple-ui", newdir, s); \
             gsub("app-" newdir ">", "app-simpleui>", s); \
             gsub("</head>", linksAtEndOfHead, s); \
             print s;}' > index.html
  cd ${saveDir}

  if $(test -d "${merge_from_folder}"); then
    if $(! test -d "${output_folder}/doc"); then mkdir "${output_folder}/doc"; fi
    if $(! test -d "${output_folder}/images"); then mkdir "${output_folder}/images"; fi
    if $(! test -d "${output_folder}/nodejs"); then mkdir "${output_folder}/nodejs"; fi
    if $(! test -d "${output_folder}/php"); then mkdir "${output_folder}/php"; fi

    if $(test -d "${merge_from_folder}/doc"); then cp ${merge_from_folder}/doc/*.* ${output_folder}/doc; fi
    if $(test -d "${merge_from_folder}/images"); then cp ${merge_from_folder}/images/*.* ${output_folder}/images; fi
    if $(test -d "${merge_from_folder}/nodejs"); then cp -r ${merge_from_folder}/nodejs ${output_folder}; fi
    if $(test -d "${merge_from_folder}/php"); then cp ${merge_from_folder}/php/*.php ${output_folder}/php; fi
    cp ${merge_from_folder}/*.properties ${output_folder}
    if $(test -f "${merge_from_folder}/.htaccess"); then cp "${merge_from_folder}/.htaccess" ${output_folder}; fi
  else
    printf "\nWarning: Missing merge_from_folder folder ${merge_from_folder}\n"
  fi

fi
