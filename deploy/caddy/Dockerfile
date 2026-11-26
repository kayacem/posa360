# Caddy with Cloudflare DNS plugin (for TLS_MODE=dns wildcard certs)
FROM caddy:2.9-builder-alpine AS builder
RUN xcaddy build \
  --with github.com/caddy-dns/cloudflare

FROM caddy:2.9-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY Caddyfile.dns /etc/caddy/Caddyfile.dns
COPY Caddyfile.ondemand /etc/caddy/Caddyfile.ondemand
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
