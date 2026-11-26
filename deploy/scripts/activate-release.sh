#!/usr/bin/env bash
# Activate a release dir under /opt/posa/apps/eticaret/releases/<sha>
# Usage: activate-release.sh <sha>
set -euo pipefail

SHA="${1:?release sha required}"
APP_ROOT="${APP_ROOT:-/opt/posa/apps/eticaret}"
RELEASE_DIR="${APP_ROOT}/releases/${SHA}"
CURRENT_LINK="${APP_ROOT}/current"
ENV_FILE="${APP_ROOT}/.env"
SERVICE="${SERVICE_NAME:-posa-eticaret}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3030/api/health}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

if [[ ! -d "$RELEASE_DIR" ]]; then
  echo "Missing release: $RELEASE_DIR" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env: $ENV_FILE" >&2
  exit 1
fi

PREV=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREV="$(readlink -f "$CURRENT_LINK" || true)"
fi

echo "==> Symlink current → releases/${SHA}"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

echo "==> prisma migrate deploy"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
cd "$CURRENT_LINK"
if [[ -x ./node_modules/.bin/prisma ]]; then
  ./node_modules/.bin/prisma migrate deploy
elif command -v npx >/dev/null 2>&1; then
  npx prisma migrate deploy
else
  echo "prisma CLI not found in release" >&2
  exit 1
fi

echo "==> systemctl restart ${SERVICE}"
sudo systemctl restart "$SERVICE"

echo "==> health check ${HEALTH_URL}"
ok=0
for i in $(seq 1 40); do
  if curl -fsS "$HEALTH_URL" | grep -q '"ok":true'; then
    ok=1
    break
  fi
  sleep 2
done

if [[ "$ok" -ne 1 ]]; then
  echo "Health check failed — rolling back"
  if [[ -n "$PREV" && -d "$PREV" ]]; then
    ln -sfn "$PREV" "$CURRENT_LINK"
    sudo systemctl restart "$SERVICE"
    echo "Rolled back to $PREV"
  else
    echo "No previous release to restore"
  fi
  exit 1
fi

echo "==> Prune old releases (keep ${KEEP_RELEASES})"
cd "${APP_ROOT}/releases"
ls -1dt */ 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
  echo "Removing releases/${old}"
  rm -rf "$old"
done

echo "Activated ${SHA}"
