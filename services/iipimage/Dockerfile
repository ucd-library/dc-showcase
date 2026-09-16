FROM debian:bookworm

RUN apt-get update && apt-get install -y lighttpd procps curl apt-transport-https ca-certificates gnupg lsb-release vim iipimage-server

RUN export LSB_RELEASE=$(lsb_release -c -s)
ENV GCSFUSE_REPO=gcsfuse-bullseye
RUN echo "deb https://packages.cloud.google.com/apt $GCSFUSE_REPO main" | tee /etc/apt/sources.list.d/gcsfuse.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | \
  tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
  apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && apt-get update -y && apt-get install -y fuse gcsfuse google-cloud-cli

RUN cd /etc/lighttpd/conf-enabled && ln -s ../conf-available/10-fastcgi.conf 
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

RUN mkdir /etc/iipimage-server
COPY setup-gcsfuse.sh /etc/iipimage-server/setup-gcsfuse.sh
COPY start.sh /etc/iipimage-server/start.sh

WORKDIR /etc/iipimage-server

CMD ["./start.sh"]