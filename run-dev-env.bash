#!/bin/bash

# This script creates the docker container (sui-dev-container) from the dev env image (sui-dev-image)


install_script=install-script.bash
# if [[ $1 == "debugserver" ]]; then
#     install_script=install-script-debug-simpleui-server.bash
# fi

SIMPLEUI_TEST_DATA=/home/zbeucler/repos/sui_dev_data

echo "Using SIMPLEUI_TEST_DATA: ${SIMPLEUI_TEST_DATA}"

DEV_TARGET=sample_app
if [ "$1" != "" ]; then
    DEV_TARGET=$1
    echo "Setting up ${DEV_TARGET}..."
fi


echo "${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"


docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="${PWD}"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="${PWD}"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
    --mount type=bind,src="${PWD}"/develop_docker/${install_script},dst=/usr/src/app/${install_script} \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}",dst=/usr/src/app/base_app/src/assets/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}",dst=/var/www/simple_ui/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/opt,dst=/opt/ \
    -p 4200:4200 \
    -p 4100:4100 \
    -w /usr/src/app/base_app/src/assets \
    sui-dev-image /bin/bash /usr/src/app/${install_script}


# docker run \
#     -v \
#     -it \
#     --rm \
#     --name sui-dev-container \
#     --mount type=bind,src="${PWD}"/base_app,dst=/usr/src/app/base_app/ \
#     --mount type=bind,src="${PWD}"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
#     --mount type=bind,src="${PWD}"/develop_docker/${install_script},dst=/usr/src/app/${install_script} \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/overlay-1,dst=/usr/src/app/base_app/src/assets/overlay-1/ \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/images,dst=/usr/src/app/base_app/src/assets/images/ \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/image-overlays.css,dst=/usr/src/app/base_app/src/assets/image-overlays.css \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/ui.properties,dst=/var/www/simple_ui/ui.properties \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/test_data,dst=/var/www/simple_ui/test_data/ \
#     --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/opt,dst=/opt/ \
#     -p 4200:4200 \
#     -p 4100:4100 \
#     -w /usr/src/app/base_app \
#     sui-dev-image /bin/bash /usr/src/app/${install_script}

# download node_modules and build+start client and server
