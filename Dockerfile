###############################################################################
# build stage-0: BUILD THE BASE CLIENT PACKAGE
FROM node:18 as build_base_client

COPY "base_app/" "/base_app/"
WORKDIR /base_app/
RUN npm install
RUN npm run build-client-prod

###############################################################################
# build stage-1: BUILD THE BASE SERVER PAKCGAE
FROM node:18 as build_base_server

COPY "simpleui-server/" "/simpleui-server/"
WORKDIR /simpleui-server/
RUN npm install
RUN npm run build


###############################################################################
# build stage-2: FINAL IMAGE
FROM php:7.1-apache

WORKDIR /tmp

ARG DEBIAN_FRONTEND noninteractive

# Node 18 script, mostly just adds it to apt
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -

# Install nodejs, install wget for zmq, install git for php-zmq
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    git \
    nodejs \
    vim \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Tini init-system
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

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
COPY "deploy_docker/*.sh" "/scripts/"

WORKDIR /
ENTRYPOINT [ "/tini", "-g", "--", "bash", "/scripts/run.sh" ]
CMD [ "" ]
