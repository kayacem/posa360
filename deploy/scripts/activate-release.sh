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

# Service runs as an unprivileged user; release files must be readable/writable by it
RUN_USER="${RUN_USER:-posa}"
if [[ "$(id -u)" -eq 0 ]] && id "$RUN_USER" >/dev/null 2>&1; then
  chown -R "$RUN_USER:$RUN_USER" "$RELEASE_DIR"
fi

# actions/upload-artifact does not preserve file modes: restore exec bits on the
# Prisma engine binaries (schema-engine is spawned by `migrate deploy`) and scripts.
find "$RELEASE_DIR/prisma-cli/node_modules/@prisma/engines" "$RELEASE_DIR/node_modules/@prisma/engines" \
  -maxdepth 1 -type f -name 'schema-engine-*' -exec chmod +x {} + 2>/dev/null || true
find "$RELEASE_DIR/prisma-cli/node_modules/.bin" "$RELEASE_DIR/deploy/scripts" \
  -maxdepth 1 \( -type f -o -type l \) -exec chmod +x {} + 2>/dev/null || true

PREV=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREV="$(readlink -f "$CURRENT_LINK" || true)"
fi

echo "==> prisma migrate deploy"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
cd "$RELEASE_DIR"
# Never fall back to `npx prisma` (would download the latest major from npm).
PRISMA_CLI=./prisma-cli/node_modules/prisma/build/index.js
[[ -f "$PRISMA_CLI" ]] || PRISMA_CLI=./node_modules/prisma/build/index.js
if [[ -f "$PRISMA_CLI" ]]; then
  node "$PRISMA_CLI" migrate deploy --schema prisma/schema.prisma
else
  echo "prisma CLI not found in release" >&2
  exit 1
fi

if [[ -f ./scripts/seed-prod.mjs ]]; then
  echo "==> seed-prod (idempotent: plans + optional super admin)"
  node ./scripts/seed-prod.mjs || echo "WARN: seed-prod failed (continuing)"
fi

echo "==> Symlink current → releases/${SHA}"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

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
CUR_REAL="$(readlink -f "$CURRENT_LINK" || true)"
ls -1dt */ 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
  old="${old%/}"
  [[ "$(readlink -f "$old")" == "$CUR_REAL" ]] && continue
  echo "Removing releases/${old}"
  rm -rf "$old"
done

echo "Activated ${SHA}"
