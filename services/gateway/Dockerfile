FROM node:22

RUN mkdir /service
WORKDIR /service

COPY package.json .
COPY package-lock.json* .
RUN npm install

COPY index.js .
COPY lib lib

CMD ["node", "index.js"]
