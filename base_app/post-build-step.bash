#!/bin/bash
PROJ=simpleui

echo "------------------ Starting post-build-step -----------------------"

if $(test -d dist/js); then rm -r dist/js; fi
mkdir dist/js
if $(test -d dist/css); then rm -r dist/css; fi
if $(test -d dist/php); then rm -r dist/php; fi
if $(test -d dist/mock-config); then rm -r dist/mock-config; fi
if $(test -d dist/mock-data); then rm -r dist/mock-data; fi
if $(test -d dist/mock-php); then rm -r dist/mock-php; fi
if $(test -f dist/index.html); then rm -r dist/index.html; fi
if $(test -d dist/setup-helpers); then rm -r dist/setup-helpers; fi

cp -rv src/app/css dist
cp src/app/cmdsets/popup-dialog.css dist/css/

cp -rv src/public/doc dist
cp -rv src/public/images dist
cp -rv src/public/php dist
cp -rv ../deploy/setup-helpers dist

cp src/public/version.txt dist/

cp src/public/example-overlay.tgz dist/
cp src/public/proxy-index.php dist/
cp src/public/collect-apache-coredumps.bash dist/
cp ../deploy/merge-derived-app.sh dist/
cp src/public/sample_ui.properties.txt dist/
cp src/public/service-worker.js dist/
cp src/public/LoggingFeatures.js dist/

cp dist/${PROJ}/*.css dist/css/
cp dist/${PROJ}/*.css.map dist/css/
cp dist/${PROJ}/*.js dist/js/
cp dist/${PROJ}/*.js.map dist/js/


if (($# > 0)) && [[ "$1" == "--include-mocks" ]]; then
    cp -rv src/public/mock-config dist
    cp -rv src/public/mock-data dist
    cp -rv src/public/mock-php dist
fi

# Fix names of javascript files
cat dist/simpleui/index.html | \
  awk -v JS_FOLDER="/${PROJ}/js/" -v CSS_FOLDER="/${PROJ}/css/" \
        '{ s=$0; \
         cssPrefix="<link rel=\"stylesheet\" href=\""; \
         jsPrefix="<script src=\""; \
         gsub(cssPrefix, cssPrefix CSS_FOLDER, s); \
         gsub(jsPrefix, jsPrefix JS_FOLDER, s); \
         gsub("</script>", "</script>\n", s); \
         print s;}' > dist/index.html

# -- end: add GUID to js files and fix up index.html --

# Create dist.tgz
cd dist
tar czvf ../dist.tgz --exclude="${PROJ}"  *
cd ..

if [[ "${NPM_COPY_DIST_TO_OUTPUT}" != "false" ]]; then
    out_folder=../../../output/simpleui/base_app
    sudo chmod -R 777 ${out_folder}
    echo Copy files to ${out_folder} folder;
    mkdir -p ${out_folder}
    cp dist.tgz  ${out_folder}
fi

echo "------------------ Finished post-build-step at $(date) -----------------------"
