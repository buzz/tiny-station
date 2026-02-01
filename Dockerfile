ARG NODE_VERSION=25
ARG ALPINE_VERSION=3.22
ARG BASE_IMAGE=node:${NODE_VERSION}-alpine${ALPINE_VERSION}
FROM ${BASE_IMAGE} AS build
LABEL maintainer="buzz <buzz@users.noreply.github.com>"

WORKDIR /tiny-station
COPY . .

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
COPY entrypoint.sh /entrypoint.sh

RUN set -xe && \
  addgroup -S tiny-station && \
  adduser -S -g tiny-station tiny-station && \
  mkdir /tiny-station/public && \
  chown tiny-station /tiny-station/public && \
  npm add -g pm2

EXPOSE 3001
VOLUME /tiny-station/public

USER tiny-station

ENTRYPOINT ["/entrypoint.sh"]
