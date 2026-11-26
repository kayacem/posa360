#!/usr/bin/env bash
# Production deploy on the VPS: pull, build, up, migrate (via entrypoint).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.production.example and fill secrets."
  exit 1
fi

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build"
$COMPOSE build

echo "==> docker compose up -d"
$COMPOSE up -d

echo "==> waiting for app health (migrate runs in entrypoint)"
for i in $(seq 1 60); do
  if $COMPOSE exec -T app wget -qO- http://127.0.0.1:3000/api/internal/domain-check?domain=posa360.com >/dev/null 2>&1 \
    || $COMPOSE exec -T app node -e "fetch('http://127.0.0.1:3000/api/internal/domain-check?domain=posa360.com').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    echo "==> app is up"
    break
  fi
  if [[ "$i" -eq 60 ]]; then
    echo "App did not become ready in time. Check: $COMPOSE logs app"
    exit 1
  fi
  sleep 2
done

echo "==> status"
$COMPOSE ps
echo "Deploy complete."
