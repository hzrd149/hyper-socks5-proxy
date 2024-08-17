# syntax=docker/dockerfile:1
FROM node:22-alpine
EXPOSE 1080

WORKDIR /app

COPY ./package*.json .
COPY ./yarn.lock .
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

ENTRYPOINT ["node", "dist/bin/start.js", "start"]
