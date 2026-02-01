#!/bin/sh

cp -R public-dist/* public/
export NODE_ENV=production
exec pm2-runtime \
  start \
  --name tiny-station \
  -- /tiny-station/dist/index.js
