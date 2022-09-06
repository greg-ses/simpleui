#!/bin/bash

echo ""
echo "Building simpleui-server..."
cd /usr/src/app/simpleui-server
cp -r /usr/src/app/simpleui-server.win/* /usr/src/app/simpleui-server
NPM_COPY_DIST_TO_OUTPUT=false
npm run build

#echo ""
#echo "Building base_app..."

#ls -la /usr/src/app/simpleui-server/dist/simpleui-server
#ln -s  /usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.25 /echusr/lib/x86_64-linux-gnu/libstdc++.so.6
#ls -la /usr/lib/x86_64-linux-gnu/libstdc++.so*

cd /usr/src/app/base_app
cp -r /usr/src/app/base_app.win/* /usr/src/app/base_app
NPM_COPY_DIST_TO_OUTPUT=false
#npm run build-client-dev

# chmod -R 777 /usr/src/app/simpleui-server && chmod -R 777 /usr/src/app/base_app

#ng serve --host 0.0.0.0 --port 4200


#cd /usr/src/app/simpleui-server

#node /usr/src/app/simpleui-server/dist/simpleui-server/simpleui-server.js --mode=daemon --appName=bms --webPort=4100;
