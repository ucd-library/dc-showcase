FROM debian:bookworm

RUN apt-get update && apt-get install -y lighttpd procps curl vim iipimage-server

RUN cd /etc/lighttpd/conf-enabled && ln -s ../conf-available/10-fastcgi.conf
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

RUN mkdir /etc/iipimage-server
COPY start.sh /etc/iipimage-server/start.sh

WORKDIR /etc/iipimage-server

CMD ["./start.sh"]
