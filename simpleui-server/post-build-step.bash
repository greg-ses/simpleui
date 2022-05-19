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

if [[ "${NPM_COPY_DIST_TO_OUTPUT}" != "false" ]]; then
    out_folder=../../../output/simpleui/simpleui-server

    # Use sudo as necessary to create / modify out_folder and its two ancestors to make them writeable
    for d in ../../../output ../../../output/simpleui ../../../output/simpleui/simpleui-server; do
        if (! $(test -d $d) ); then sudo mkdir -m777 $d; sudo chown service:service $d; fi
        if (! $(test -w $d) ); then sudo chmod 777 $d; sudo chown service:service $d; fi
    done

    echo Copy files to ${out_folder} folder;

    cp dist/simpleui-server/SERVICE-TEMPLATE.service ${out_folder}
    chmod 755 ${out_folder}/SERVICE-TEMPLATE.service

    cp dist.tgz  ${out_folder}
    chmod 755 ${out_folder}/dist.tgz

fi
echo "------------------ Finished post-build-step at $(date) -----------------------"
