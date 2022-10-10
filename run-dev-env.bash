#!/bin/bash

# This script creates the docker container (sui-dev-container) from the dev env image (sui-dev-image)

install_script=install-script.bash
if [[ $1 == "debugserver" ]]; then
    install_script=install-script-debug-simpleui-server.bash
fi

echo "Using SIMPLEUI_TEST_DATA: ${SIMPLEUI_TEST_DATA}"

docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="$(pwd)"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="$(pwd)"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
    --mount type=bind,src="$(pwd)"/develop_docker/${install_script},dst=/usr/src/app/${install_script} \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/bms/opt/,dst=/opt/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/bms,dst=/var/www/bms/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/dcbatt-data,dst=/var/www/dcbatt-data/ \
    -p 4200:4200 \
    -p 4100:4100 \
    -p 9876:9876 \
    -w /usr/src/app/base_app \
    sui-dev-image /bin/bash /usr/src/app/${install_script}



echo ""
docker ps -a


#    -p 9229:9229 \
#    -p 2223:22 \
