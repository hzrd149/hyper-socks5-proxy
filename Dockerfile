# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# install dependencies for native hyperdht build
RUN apk add --update --no-cache python3 make build-base

WORKDIR /app
COPY ./package*.json .
COPY ./pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:22-alpine AS main
EXPOSE 1080

WORKDIR /app
COPY --from=builder /app /app

ENTRYPOINT ["node", "dist/bin/proxy.js", "start"]
