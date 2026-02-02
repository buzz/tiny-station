#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$PROJECT_DIR/.env"
if [ -f "$PROJECT_DIR/.env.local" ]; then
  source "$PROJECT_DIR/.env.local"
fi

bold() {
  printf "\033[1m%s\033[0m\n" "$1"
}

ensure_mkcert() {
  if ! command -v mkcert >/dev/null 2>&1; then
    echo "⚠️ mkcert is not installed"
    echo "   https://github.com/FiloSottile/mkcert"
    return 1
  fi
}

ensure_certs() {
  CERT_DIR="${PROJECT_DIR}/docker/certs"
  CERT="${CERT_DIR}/cert.pem"
  KEY="${CERT_DIR}/privkey.pem"
  FULLCHAIN="${CERT_DIR}/fullchain.pem"

  if [ ! -f "$CERT" ] || [ ! -f "$KEY" ] || [ ! -f "$FULLCHAIN" ]; then
    mkdir -p "$CERT_DIR"
    mkcert -key-file "$KEY" -cert-file "$CERT" "$ICECAST_HOSTNAME"
    cat "$CERT" "$(mkcert -CAROOT)/rootCA.pem" > "$FULLCHAIN"
  fi
}

cd "$PROJECT_DIR"
ensure_mkcert
ensure_certs
mkdir -p docker/tiny-station-public

bold "🐳 Starting stack..."
docker compose up -d --build
