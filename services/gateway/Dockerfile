FROM node:22

RUN apt update && apt install -y \
  vim

RUN mkdir /service
WORKDIR /service

COPY package.json .
COPY package-lock.json* .
RUN npm install

COPY index.js .
COPY lib lib

CMD ["node", "index.js"]
