#!/bin/sh

cp -R public-dist/* public/
export NODE_ENV=production
exec pm2-runtime \
  start \
  --name listen-app \
  -- /listen-app/dist/index.js
