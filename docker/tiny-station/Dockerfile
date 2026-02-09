ARG NODE_VERSION=25
ARG ALPINE_VERSION=3.23
ARG BASE_IMAGE=node:${NODE_VERSION}-alpine${ALPINE_VERSION}
FROM ${BASE_IMAGE} AS build
LABEL maintainer="buzz <buzz@users.noreply.github.com>"

WORKDIR /tiny-station
COPY .env ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY tsconfig*.json ./
COPY packages ./packages

ARG VITE_BASE_URL
ARG VITE_COOKIE_TOKEN
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_COOKIE_TOKEN=$VITE_COOKIE_TOKEN

RUN set -xe && \
  npm install -g pnpm && \
  pnpm install --frozen-lockfile && \
  pnpm build && \
  pnpm --filter=server --prod deploy /pruned

FROM ${BASE_IMAGE}
WORKDIR /tiny-station
COPY --from=build /pruned/package.json ./package.json
COPY --from=build /pruned/node_modules ./node_modules
COPY --from=build /tiny-station/packages/server/dist ./dist
COPY --from=build /tiny-station/packages/frontend/dist ./public-dist
COPY docker/tiny-station/entrypoint.sh /entrypoint.sh

RUN set -xe && \
  addgroup -S tiny-station && \
  adduser -S -g tiny-station tiny-station && \
  npm add -g pm2

EXPOSE 3001
VOLUME ["/tiny-station/public"]

USER tiny-station

ENTRYPOINT ["/entrypoint.sh"]
