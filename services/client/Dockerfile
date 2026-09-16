# Independent standup - no longer FROM a fin base image or npm-linking
# @ucd-lib/fin-service-utils/@ucd-lib/fin-api (see docs/PORT-PLAN.md Phase 0).
FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

# Browser client code
COPY client client
RUN cd client/public && npm install

COPY controllers controllers
COPY lib lib
COPY models models
COPY index.js .
COPY config.js .

# development client build, so we have one by default
RUN npm run build
# production client build
RUN npm run dist

EXPOSE 8000

CMD [ "npm", "start" ]
