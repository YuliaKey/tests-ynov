FROM mysql:9.6
COPY ./sqlfiles /docker-entrypoint-initdb.d
EXPOSE 3306