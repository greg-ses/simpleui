###############################################################################
# build stage-0: BUILD THE BASE CLIENT PACKAGE
FROM node:16 as build_base_client

COPY "base_app/" "/base_app/"
WORKDIR /base_app/
RUN npm install
RUN npm run build-client-prod

###############################################################################
# build stage-1: BUILD THE BASE SERVER PAKCGAE
FROM node:16 as build_base_server

COPY "simpleui-server/" "/simpleui-server/"
WORKDIR /simpleui-server/
RUN npm install
RUN npm run build

###############################################################################
# build stage-2: FINAL IMAGE
FROM php:7-apache

WORKDIR /tmp

# Node 16 script, mostly just adds it to apt
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -

# Install nodejs, install wget for zmq, install git for php-zmq
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    git \
    nodejs \
    vim \
    wget \
    && rm -rf /var/lib/apt/lists/*

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

# php-zmq
RUN git clone https://github.com/mkoppanen/php-zmq.git && \
    cd php-zmq && \
    phpize && ./configure && make install -j$(nproc) && \
    cd .. && \
    rm -rf ./php-zmq

# Enable apache modules, set default apache configs
RUN a2enmod rewrite && \
    a2enmod proxy && \
    a2enmod proxy_http
COPY deploy_docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY deploy_docker/apache2.conf /etc/apache2/apache2.conf

# Install mysqli
RUN docker-php-ext-install mysqli

# Php config
COPY deploy_docker/php.ini "$PHP_INI_DIR/php.ini"

# Copy params app
COPY "web/" "/staging/"

# Copy client and server packages from the build stages
COPY --from=build_base_client "/base_app/dist.tgz" "/tmp/client_dist.tgz"
COPY --from=build_base_server "/simpleui-server/dist.tgz" "/tmp/server_dist.tgz"

# Copy the deployment/run scripts
WORKDIR /scripts
COPY "deploy_docker/*.sh" "/scripts/"

ENTRYPOINT [ "bash", "/scripts/run.sh" ]
CMD [ "" ]
