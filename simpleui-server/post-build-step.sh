#!/bin/sh
PROJ=simpleui-server

echo "------------------ Starting post-build-step -----------------------"


if $(! test -d dist/simpleui-server/node_modules); then
    mkdir dist/simpleui-server/node_modules
fi

for d in $(cat src/node_modules-dirs-to-copy.txt); do
    if $(! test -d dist/simpleui-server/node_modules/${d}); then
        cp -r ${d} dist/simpleui-server/node_modules;
    fi
done

# Create dist.tgz
cd dist
tar czvf ../dist.tgz *
cd ..

echo "------------------ Finished post-build-step at $(date) -----------------------"
