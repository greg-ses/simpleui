#!/bin/bash

# This script creates the docker container (sui-dev-container) from the dev env image (sui-dev-image)


## GOALS
#   1. have the LGO assets only appear in the docker container
#       AKA after downloading code from repo, there should only be the sample assets (and maybe the archived LGO stuff?)
#   2. dont compress the LGO or sample files into garbage
#   3. Have this system clean up after itself so I dont have to worry about potentially sending LGO stuff to repo

# is this over-engineered / too complicated?


# env var SUI_ASSETS = directory for LGO stuff

# if -d $SUI_ASSETS == true
#     unpack and use lgo stuff
# else
#     use sample resources


# pushd "$(pwd)"/base_app/src || exit 1
# tar cvzf sample.assets.tar.gz assets; # tar sample assets
# rm -rf assets                         # delete assets folder to make room for LGO assets
# tar xvzf LGO.assets.tar.gz;           # untar LGO assets

# popd || exit 1


# if -d $SUI_SAMPLE_DATA == true
#     unpack and use lgo stuff
# else
#     use sample resources
    
# pushd "$(pwd)"/simpleui-server || exit 1
# if [[ -d test ]]; then
#     tar cvzf sample.test.tar.gz test;   # tar sample test
#     rm -rf test                         # delete test folder to make room from LGO test
#     tar xvzf LGO.test.tar.gz;           # untar LGO test
# fi
# popd || exit 1   


echo "Using SIMPLEUI_TEST_DATA: ${SIMPLEUI_TEST_DATA}"

docker run \
    -it \
    --rm \
    --name sui-dev-container \
    --mount type=bind,src="$(pwd)"/base_app,dst=/usr/src/app/base_app/ \
    --mount type=bind,src="$(pwd)"/simpleui-server,dst=/usr/src/app/simpleui-server/ \
    --mount type=bind,src="$(pwd)"/develop_docker/install-script.bash,dst=/usr/src/app/install-script.bash \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/bms/opt/,dst=/opt/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/bms,dst=/var/www/bms/ \
    --mount type=bind,src="${SIMPLEUI_TEST_DATA}"/dcbatt-data,dst=/var/www/dcbatt-data/ \
    -p 4200:4200 \
    -p 4100:4100 \
    -p 9876:9876 \
    -w /usr/src/app/base_app \
    sui-dev-image /bin/bash /usr/src/app/install-script.bash




# pushd "$(pwd)"/base_app/src || exit 1
# if [[ -d assets ]]; then 
#     tar cvzf LGO.assets.tar.gz assets;       # tar LGO assets
#     #rm -rf assets                           # delete assets folder to make room for sample assets
#     tar xvzf sample.assets.tar.gz;           # untar sample assets
# fi
# popd || exit 1

# pushd "$(pwd)"/simpleui-server || exit 1
# if [[ -d test ]]; then
#     tar cvzf LGO.test.tar.gz test;         # tar LGO test
#     #rm -rf test                           # delete test folder to make room for sample tests
#     tar xvzf sample.test.tar.gz;           # untar sample test
# fi
# popd || exit 1


echo ""
docker ps -a


#    -p 9229:9229 \
#    -p 2223:22 \
