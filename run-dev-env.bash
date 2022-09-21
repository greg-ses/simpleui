#!/bin/bash


docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="$(pwd)"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="$(pwd)"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
    --mount type=bind,src="$(pwd)"/develop_docker/install-script.bash,dst=/usr/src/app/install-script.bash \
    --mount type=bind,src="$(pwd)"/simpleui-server/test/config,dst=/opt/config \
    --mount type=bind,src="$(pwd)"/simpleui-server/test/data/bms,dst=/var/www/bms \
    --mount type=bind,src="$(pwd)"/simpleui-server/test/data/dcbatt-data,dst=/var/www/dcbatt-data \
    -p 4200:4200 \
    -p 4100:4100 \
    -p 2223:22 \
    -p 9229:9229 \
    -w /usr/src/app \
    sui-dev-image /bin/bash /usr/src/app/install-script.bash

echo ""
echo $?



#      - '../simpleui-server/test/config:/opt/config'
#      - '../simpleui-server/test/data/bms:/var/www/bms'
#      - '../simpleui-server/test/data/dcbatt-data:/var/www/dcbatt-data'