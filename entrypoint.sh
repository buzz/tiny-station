#!/bin/sh

cp -R packages/frontend/dist/* frontend/
exec /listen-app/packages/server/node_modules/.bin/pm2-runtime \
  start \
  --name listen-app \
  -- /listen-app/packages/server/dist/index.js
