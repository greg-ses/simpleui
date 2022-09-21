#!/bin/bash



cd /usr/src/app/
npm install -g @angular/cli@14.2.2

# -------------- base_app --------------
cd /usr/src/app/base_app;
NPM_COPY_DIST_TO_OUTPUT=false
if [[ ! -d node_modules ]]; then
    npm install;
fi
npm run build-client-dev;

#ng serve --host 0.0.0.0 --port 4200 #--configuration development

# ----------- simpleui-server -----------
cd /usr/src/app/simpleui-server;
NPM_COPY_DIST_TO_OUTPUT=false
if [[ ! -d node_modules ]]; then 
    npm install -f;
fi
npm run build;

node /usr/src/app/simpleui-server/dist/simpleui-server/simpleui-server.js \
--mode=daemon \
--appName=bms \
--webPort=4100




