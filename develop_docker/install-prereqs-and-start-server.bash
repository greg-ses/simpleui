#!/bin/bash

echo ""
echo "Building simpleui-server..."
cd /usr/src/app/simpleui-server
cp -r /usr/src/app/simpleui-server.win/* /usr/src/app/simpleui-server
NPM_COPY_DIST_TO_OUTPUT=false
npm run build

echo ""
echo "Building base_app..."
cd /usr/src/app/base_app
cp -r /usr/src/app/base_app.win/* /usr/src/app/base_app
NPM_COPY_DIST_TO_OUTPUT=false
cp -r /usr/src/app/simpleui-server.win/test/data/bms/overlay-1/* /usr/src/app/base_app/src/assets/overlay
npm run build-client-dev



# Debug config for vscode
if [[ -f /usr/src/app/.vscode ]]; then
    echo "\n Debug config already installed";
else
    cd /usr/src/app/
    mkdir .vscode && cd .vscode
    touch launch.json
    echo '{"configurations": [{"name": "Debug server","type": "node","request": "launch","program": "${workspaceFolder}/simpleui-server/dist/simpleui-server/simpleui-server.js","args": ["--mode=daemon","--appName=bms","--webPort=4100"]}]}' > launch.json
fi
#####


cd /usr/src/app/base_app
ng serve --host 0.0.0.0 --port 4200 #--configuration development

