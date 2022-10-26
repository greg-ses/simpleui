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

#---------- SSH Server ---------------
RUN apt-get update && apt-get install -y \
    ssh \
    vim \
    openssh-server \
    && rm -rf /var/lib/apt/lists/*
RUN service ssh start && \
    useradd -m user && yes password | passwd user && \
    usermod -aG sudo user


#----------- Chromium (headless tests) --------
RUN apt update && \
    apt install && \
    apt install chromium -y

ENV CHROME_BIN=/usr/bin/chromium


#---------- Angular CLI --------------
RUN mkdir -p /usr/src/app && \
    cd /usr/src/app/ && \
    npm install -g @angular/cli@14.2.2


#---------- base_app (client) ---------------
RUN mkdir -p /usr/src/app/base_app/


#---------- simpleui-server (express app) ---------------
RUN mkdir /usr/src/app/simpleui-server/


#---------- Tini (init system) ---------------
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]


#---------- Run SSH Daemon ---------------
CMD ["/usr/sbin/sshd", "-D"]
