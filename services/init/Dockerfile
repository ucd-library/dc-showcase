ARG FIN_INIT
FROM ${FIN_INIT}

COPY fcrepo /etc/ucdlib-service-init/fcrepo-dams
COPY postgres /etc/ucdlib-service-init/postgres-dams

COPY init-dams.sh /init-dams.sh
RUN chmod +x /init-dams.sh

CMD ["/init-dams.sh"]