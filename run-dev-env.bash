#!/bin/bash

# This script creates the docker container (sui-dev-container) from the dev env image (sui-dev-image)


install_script=install-script.bash
for arg in "$@"
do
    if [ "$arg" == "debugserver" ]; then
        install_script=install-script-debug-simpleui-server.bash
    fi
done

echo "Using SIMPLEUI_TEST_DATA: ${SIMPLEUI_TEST_DATA}"

DEV_TARGET=sample_app
if [ "$1" != "" ]; then
    DEV_TARGET=$1
    echo "Setting up ${DEV_TARGET}..."
fi


if [ ! -d "${SIMPLEUI_TEST_DATA}/${DEV_TARGET}" ]; then
    echo "${SIMPLEUI_TEST_DATA}/${DEV_TARGET} doesn't exist, using sample assets..."
    DEV_TARGET=sample_app
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
