ARG NODE_VERSION=25
ARG ALPINE_VERSION=3.22
ARG BASE_IMAGE=node:${NODE_VERSION}-alpine${ALPINE_VERSION}
FROM ${BASE_IMAGE} AS build
LABEL maintainer="buzz <buzz@users.noreply.github.com>"

WORKDIR /listen-app
COPY . .

RUN set -xe && \
  npm install -g pnpm && \
  pnpm install --frozen-lockfile && \
  pnpm build && \
  pnpm --filter=server --prod deploy /pruned

FROM ${BASE_IMAGE}
WORKDIR /listen-app
COPY --from=build /pruned/package.json ./package.json
COPY --from=build /pruned/node_modules ./node_modules
COPY --from=build /listen-app/packages/server/dist ./dist
COPY --from=build /listen-app/packages/frontend/dist ./public-dist
COPY entrypoint.sh /entrypoint.sh

RUN set -xe && \
  addgroup -S listen-app && \
  adduser -S -g listen-app listen-app && \
  mkdir /listen-app/public && \
  chown listen-app /listen-app/public && \
  npm add -g pm2

EXPOSE 3001
VOLUME /listen-app/public

USER listen-app

ENTRYPOINT ["/entrypoint.sh"]
