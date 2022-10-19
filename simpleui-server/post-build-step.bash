#!/bin/bash
PROJ=simpleui-server

echo "------------------ Starting post-build-step -----------------------"


if $(! test -d dist/simpleui-server/node_modules); then
    mkdir dist/simpleui-server/node_modules
fi

cp -r node_modules dist/node_modules

# Create dist.tgz
cd dist
#tar czvf ../dist.tgz *
tar czf ../dist.tgz *
cd ..

echo "------------------ Finished simpleui-server post-build-step at $(date) -----------------------"
