FROM node:alpine as build
LABEL maintainer="buzz <buzz@users.noreply.github.com>"

WORKDIR /listen-app
COPY . .
RUN set -xe && \
  apk add --update --no-cache \
    build-base \
    python3 && \
  yarn install \
    --non-interactive \
    --pure-lockfile && \
  yarn build

FROM node:alpine
WORKDIR /listen-app
COPY --from=build /listen-app/package.json .
COPY --from=build /listen-app/packages/frontend/dist ./packages/frontend/dist
COPY --from=build /listen-app/packages/server/package.json ./packages/server/
COPY --from=build /listen-app/packages/server/dist ./packages/server/dist
COPY entrypoint.sh /
RUN set -xe && \
  addgroup -S listen-app && \
  adduser -S -g listen-app listen-app && \
  mkdir frontend && \
  yarn add \
    --cwd packages/server \
    --no-lockfile \
    pm2 && \
  yarn install \
    --cwd packages/server \
    --no-lockfile \
    --non-interactive \
    --production=true && \
  rm -r $(yarn cache dir) && \
  chmod +x /entrypoint.sh

EXPOSE 3001
VOLUME /listen-app/frontend

USER listen-app

ENTRYPOINT ["/entrypoint.sh"]
