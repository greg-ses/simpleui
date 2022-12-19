# Dev Env 2.0



## Goals
- [ ] Make it easier to switch in and out assets
  - so we can use vts or purification stuff in dev env
- [ ] Connect to the simulators
- [ ] Build simpleui server on save

### `run-dev-env.bash`
```bash
docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="${PWD}"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="${PWD}"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
    --mount type=bind,src="${PWD}"/develop_docker/${install_script},dst=/usr/src/app/${install_script} \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/sample-app/opt,dst=/opt/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/sample-app,dst=/var/www/simple_ui/ \
    -p 4200:4200 \
    -p 4100:4100 \
    -p 9876:9876 \
    -w /usr/src/app/base_app \
    sui-dev-image /bin/bash /usr/src/app/${install_script} # download node_modules and build+start client and server
```


# Switching in and out assets
- `base_app` assets folder should be EMPTY

## dev targets
- sample-app
- vts
- vcharge
- purification

### Required
- ui.properties
- overlay-1
- image-overlays.css
- opt/*.properties


| Required files and folders | Outside container (simpleui-test-data) | Inside container      |
| -------------------------- | -------------------------------------- | --------------------- |
| ui.properties      | /sample-app/ui.properties | /var/www/simple_ui/ui.properties           |
| overlay-1          | /sample-app/overlay-1/*   | /var/www/simple_ui/overlay-1/*             |
| image-overlays.css | /sample-app/image-overlays.css | /var/www/simple_ui/image-overlays.css | (and assets for index.html)
| opt/*              | /sample-app/opt/*         | /opt/                                      |


```
sui-dev-data
|- sample_app
|- vts
|- vcharge
|- pure
    |- image-overlays.css
    |- ui.properties
    |- images
        |- logo.png
        |- favicon.ico
    |- overlay-1
        |- images
            |- source_images
            | *.png
            | *.gif
            | create_links.sh
    |- test_data
        |- *.xml
```


- `image-overlays.css` , `ui.properties` , and `test_data` should be in `/var/www/simple_ui`


- mount `overlay-1` , `images` and `image-overlays.css` into assets
- mount `ui.properties` , `test-data` into `/var/www/simple_ui`
- mount `opt` into `/opt/`
- link `assets/image-overlays.css` to `/var/www/simple_ui/image-overlays.css`

```bash

#!/bin/bash

#

install_script=install-script.bash
if [[ $1 == "debugserver" ]]; then
    install_script=install-script-debug-simpleui-server.bash
fi

echo "Using SIMPLEUI_TEST_DATA: ${SIMPLEUI_TEST_DATA}"

DEV_TARGET=sample_app
if [ "$2" != "" ]; then
    DEV_TARGET=$2
    echo "Setting up ${DEV_TARGET}..."
fi




docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="${PWD}"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="${PWD}"/simpleui-server,dst=/usr/src/app/simpleui-server/ \                          # mounting folder
    --mount type=bind,src="${PWD}"/develop_docker/${install_script},dst=/usr/src/app/${install_script} \        # mounting single file
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/overlay-1,dst=/usr/src/app/base_app/src/assets/overlay-1/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/images,dst=/usr/src/app/base_app/src/assets/images/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/image-overlays.css,dst=/usr/src/app/base_app/src/assets/image-overlays.css \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/ui.properties,dst=/var/www/simple_ui/ui.properties \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/test-data,dst=/var/www/simple_ui/test-data/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}/${DEV_TARGET}"/opt,dst=/opt/ \
    -p 4200:4200 \
    -p 4100:4100 \
    -w /usr/src/app/base_app \
    sui-dev-image /bin/bash /usr/src/app/${install_script} # download node_modules and build+start client and server

```
