#!/usr/bin/env bash
# Daily Postgres dump of posa_eticaret (native local Postgres). Keep last 7 days.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/posa/apps/eticaret}"
ENV_FILE="${ENV_FILE:-$APP_ROOT/.env}"
BACKUP_DIR="${BACKUP_DIR:-$APP_ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL missing" >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%d_%H%M%S)"
OUT="${BACKUP_DIR}/posa_eticaret_${STAMP}.sql.gz"

echo "==> Dumping via pg_dump → ${OUT}"
pg_dump "$DATABASE_URL" --clean --if-exists | gzip -c > "$OUT"

echo "==> Removing dumps older than ${KEEP_DAYS} days"
find "$BACKUP_DIR" -type f -name 'posa_eticaret_*.sql.gz' -mtime "+${KEEP_DAYS}" -print -delete || true

ls -lh "$OUT"
echo "Backup done."

# Cron example (posa user):
# 15 3 * * * APP_ROOT=/opt/posa/apps/eticaret /opt/posa/apps/eticaret/current/scripts/backup-db.sh >> /var/log/posa-eticaret-backup.log 2>&1
