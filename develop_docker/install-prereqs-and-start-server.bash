#!/bin/bash
#    rm docker-install-complete.txt
    if $(test -f docker-install-complete.txt); then
        echo ADDINS ALREADY INSTALLED
    else
        echo INSTALLING ADDINS ...
        mkdir ~/Downloads
        pushd ~/Downloads
        # Install specific version of gcc
        #apt-get install software-properties-common
        #add-apt-repository -y ppa:ubuntu-toolchain-r/test
        #apt-get install -y g++-9
        #apt-get install -y gcc-9
        #update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 90
        #update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 90
        #update-alternatives --install /usr/bin/gcov gcov /usr/bin/gcov-9 90
        #update-alternatives --auto g++
        #update-alternatives --auto gcc
        #update-alternatives --auto gcov
        wget https://github.com/zeromq/libzmq/archive/refs/tags/v4.3.4.tar.gz https://github.com/zeromq/libzmq/releases/download/v4.3.4/zeromq-4.3.4.tar.gz
        tar -xzf zeromq-4.3.4.tar.gz
        cd zeromq-4.3.4 && ./configure && make -j4 && make install
        ldconfig
        popd

        pushd /usr/src/app/base_app
        npm install -f
        popd

        pushd /usr/src/app/simpleui-server
        npm install -f
        popd

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
node /usr/src/app/simpleui-server/dist/simpleui-server/simpleui-server.js --mode=daemon --appName=bms --webPort=4100;
