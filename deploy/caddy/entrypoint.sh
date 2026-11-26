#!/bin/sh
set -e

MODE="${TLS_MODE:-ondemand}"
echo "==> Caddy TLS_MODE=${MODE}"

if [ "$MODE" = "dns" ]; then
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "ERROR: TLS_MODE=dns requires CLOUDFLARE_API_TOKEN"
    exit 1
  fi
  cp /etc/caddy/Caddyfile.dns /etc/caddy/Caddyfile
else
  cp /etc/caddy/Caddyfile.ondemand /etc/caddy/Caddyfile
fi

# Substitute platform domain placeholder if present
if [ -n "${PLATFORM_DOMAIN:-}" ]; then
  sed -i "s/posa360.com/${PLATFORM_DOMAIN}/g" /etc/caddy/Caddyfile
fi

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
