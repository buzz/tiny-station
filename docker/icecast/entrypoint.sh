#!/bin/sh
set -e

# ensure new files are 600
umask 177

# Defaults
: "${ICECAST_CLIENTS:=200}"
: "${ICECAST_SOURCES:=1}"
: "${ICECAST_PORT:=4443}"
: "${ICECAST_ADMIN_USER:=admin}"
: "${ICECAST_SOURCE_USER:=source}"
: "${ICECAST_LOGLEVEL:=2}"

# Require variables
: "${ICECAST_LOCATION:?ICECAST_LOCATION must be set}"
: "${ICECAST_ADMIN_EMAIL:?ICECAST_ADMIN_EMAIL must be set}"
: "${ICECAST_HOSTNAME:?ICECAST_HOSTNAME must be set}"
: "${ICECAST_ADMIN_PASSWORD:?ICECAST_ADMIN_PASSWORD must be set}"
: "${ICECAST_SOURCE_PASSWORD:?ICECAST_SOURCE_PASSWORD must be set}"
: "${ICECAST_HEADER_CORS_ORIGIN:?ICECAST_HEADER_CORS_ORIGIN must be set}"

# Generate config
envsubst < /usr/local/share/icecast/doc/icecast.xml.dist > /etc/icecast/icecast.xml

# Copy certs
cp /etc/certificates/fullchain.pem /etc/icecast/fullchain.pem
cp /etc/certificates/privkey.pem /etc/icecast/privkey.pem
chown icecast:icecast /etc/icecast/fullchain.pem /etc/icecast/privkey.pem

exec icecast -c /etc/icecast/icecast.xml
