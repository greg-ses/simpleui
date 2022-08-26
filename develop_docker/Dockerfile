FROM node:16-bullseye

RUN mkdir -p /usr/src/app/base_app/
RUN mkdir /usr/src/app/simpleui-server/
# ZMQ
RUN wget --no-check-certificate --quiet \
    https://github.com/zeromq/libzmq/releases/download/v4.3.2/zeromq-4.3.2.tar.gz && \
    tar -xzf zeromq-4.3.2.tar.gz && \
    cd zeromq-4.3.2 && \
    ./configure && \
    make -j$(nproc) && \
    make install && \
    cd .. && \
    rm -rf ./zeromq-4.3.2 zeromq-4.3.2.tar.gz && \
    ldconfig
RUN touch /usr/src/app/base_app/idk.txt

RUN touch /usr/src/app/simpleui-server/idk.txt

RUN npm install -g @angular/cli

COPY ./base_app/package.json /usr/src/app/base_app/
COPY ./simpleui-server/package.json /usr/src/app/simpleui-server/
RUN cd /usr/src/app/base_app/ && \
    bash -c "npm install  --legacy-peer-deps"
RUN cd /usr/src/app/simpleui-server && \
    bash -c "npm install -f"
