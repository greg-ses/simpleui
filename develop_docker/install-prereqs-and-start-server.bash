#!/bin/bash -e
    #rm docker-install-complete.txt
    if $(test -f docker-install-complete.txt); then
        echo ADDINS ALREADY INSTALLED
    else
        echo INSTALLING ADDINS ...

        touch docker-install-complete.txt
    fi

echo ""
echo "Building simpleui-server..."
pushd /usr/src/app/simpleui-server
NPM_COPY_DIST_TO_OUTPUT=false
npm run build
popd

echo ""
echo "Starting simpleui-server..."
ls -la /usr/src/app/simpleui-server/dist/simpleui-server
# ln -s  /usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.25 /usr/lib/x86_64-linux-gnu/libstdc++.so.6
ls -la /usr/lib/x86_64-linux-gnu/libstdc++.so*
pushd /usr/src/app/base_app
npm run build-client-dev
ng serve --host 0.0.0.0 --port 4200&
popd
cd /usr/src/app/simpleui-server
#node --inspect=localhost:9229 /usr/src/app/simpleui-server/dist/simpleui-server/simpleui-server.js --mode=daemon --appName=bms --webPort=4100;
