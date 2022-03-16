#!/bin/bash
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


if [[ $(basename $PWD) != "deploy" ]]; then
    out_folder=../../../output/simpleui/simpleui-server
    echo Copy files to ${out_folder} folder;
    mkdir -p ${out_folder}
    cp dist.tgz  ${out_folder}
fi

echo "------------------ Finished post-build-step at $(date) -----------------------"
