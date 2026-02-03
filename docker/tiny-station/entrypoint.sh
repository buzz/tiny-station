#!/bin/sh
set -e

export NODE_ENV=production

# Copy frontend dist to volume for HTTP service
cp -R public-dist/* public/

exec pm2-runtime \
  start \
  --name tiny-station \
  -- /tiny-station/dist/index.js
