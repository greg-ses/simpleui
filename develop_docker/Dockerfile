FROM node:16-bullseye

RUN mkdir -p /usr/src/app/base_app/
RUN mkdir /usr/src/app/simpleui-server/

###### SSH
RUN apt-get update && apt-get install -y \
    ssh \
    openssh-server && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get -y clean
RUN service ssh start && \
    useradd -m user && yes password | passwd user && \
    usermod -aG sudo user
###############################

##### ZMQ
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
###############################

#RUN npm install -g @angular/cli

COPY ./base_app/package.json /usr/src/app/base_app/
COPY ./simpleui-server/package.json /usr/src/app/simpleui-server/

RUN cd /usr/src/app/base_app/ && \
    npm install -f

RUN cd /usr/src/app/simpleui-server && \
    npm install -f









