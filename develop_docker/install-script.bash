#!/bin/bash


# ----- allow vscode simpleui-server debugging
(
    cd /usr/src/app || exit 1;
    if [[ ! -d .vscode ]]; then
        mkdir .vscode;
        cd .vscode && touch launch.json;
        echo '{"configurations": [{"name": "Debug server","type": "node","request": "launch","program": "${workspaceFolder}/simpleui-server/dist/simpleui-server/simpleui-server.js","args": ["--mode=daemon","--appName=bms","--webPort=4100"]}]}' > launch.json
    fi
)

# -------------- base_app --------------
cd /usr/src/app/base_app || exit 1
if [[ ! -d node_modules ]]; then
    npm install;
fi
#npm run build-client-dev;

ng serve --host 0.0.0.0 --port 4200& #--configuration development


# ----------- simpleui-server -----------
cd /usr/src/app/simpleui-server || exit 1
if [[ ! -d node_modules ]]; then 
    npm install -f;
fi
npm run build;

node /usr/src/app/simpleui-server/dist/simpleui-server/simpleui-server.js \
--mode=daemon \
--appName=simple_ui \
--webPort=4100


