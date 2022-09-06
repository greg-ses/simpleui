FROM node:18-bullseye

RUN mkdir /output && chmod 777 /output

#---------- ZMQ ---------------
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

#---------- ssh server ---------------
RUN apt-get update && apt-get install -y \
    ssh \
    vim \
    openssh-server \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get -y clean
RUN service ssh start && \
    useradd -m user && yes password | passwd user && \
    usermod -aG sudo user

#---------- base_app (client) ---------------
RUN mkdir -p /usr/src/app/base_app/
COPY ./base_app/package.json /usr/src/app/base_app/
RUN mkdir -p /usr/src/app/base_app/ && \
    cd /usr/src/app/base_app/ && \
    npm install -g @angular/cli && \
    npm install -f && \
    chmod -R 777 /usr/src/app/base_app


#---------- simpleui-server (express app) ---------------
RUN mkdir /usr/src/app/simpleui-server/
COPY ./simpleui-server/package.json /usr/src/app/simpleui-server/
RUN cd /usr/src/app/simpleui-server && \
    npm install -f && \
    chmod -R 777 /usr/src/app/simpleui-server

# Bottom of dockerfile
CMD ["/usr/sbin/sshd", "-D"]
