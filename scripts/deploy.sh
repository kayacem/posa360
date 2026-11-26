#!/usr/bin/env bash
# Production deploy on the VPS: pull, build, up, migrate (entrypoint + verify), health check.
# Keeps the previous app image as posa360-app:previous for quick rollback.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"
APP_IMAGE="${APP_IMAGE:-posa360-app}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.production.example and fill secrets."
  exit 1
fi

rollback_app() {
  if docker image inspect "${APP_IMAGE}:previous" >/dev/null 2>&1; then
    echo "==> Health check failed — rolling back to ${APP_IMAGE}:previous"
    docker tag "${APP_IMAGE}:previous" "${APP_IMAGE}:latest"
    $COMPOSE up -d --no-build app
    echo "==> Rollback started. Check: $COMPOSE logs -f app"
  else
    echo "==> No previous image to roll back to (${APP_IMAGE}:previous missing)."
  fi
  exit 1
}

echo "==> Tagging current app image as ${APP_IMAGE}:previous (if present)"
if docker image inspect "${APP_IMAGE}:latest" >/dev/null 2>&1; then
  docker tag "${APP_IMAGE}:latest" "${APP_IMAGE}:previous"
  echo "    Saved ${APP_IMAGE}:previous"
else
  echo "    No existing ${APP_IMAGE}:latest — first deploy, skip previous tag"
fi

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build"
$COMPOSE build

echo "==> docker compose up -d"
$COMPOSE up -d

echo "==> waiting for /api/health (prisma migrate deploy runs in container entrypoint)"
healthy=0
for i in $(seq 1 90); do
  if $COMPOSE exec -T app wget -qO- http://127.0.0.1:3000/api/health 2>/dev/null | grep -q '"ok":true' \
    || $COMPOSE exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(async r=>{const j=await r.json();process.exit(r.ok&&j.ok?0:1)}).catch(()=>process.exit(1))"; then
    echo "==> app healthy"
    healthy=1
    break
  fi
  sleep 2
done

if [[ "$healthy" -ne 1 ]]; then
  echo "App did not become healthy in time. Logs:"
  $COMPOSE logs --tail=80 app || true
  rollback_app
fi

echo "==> prisma migrate deploy (idempotent; entrypoint already ran it)"
$COMPOSE exec -T app npx prisma migrate deploy

echo "==> status"
$COMPOSE ps
echo "Deploy complete."
echo "Rollback tip: docker tag ${APP_IMAGE}:previous ${APP_IMAGE}:latest && $COMPOSE up -d --no-build app"
