#!/usr/bin/env bash
# Daily Postgres dump; keep last 7 days.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

# Load DB name/user from env file if present
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-posa360}"
POSTGRES_DB="${POSTGRES_DB:-posa360}"
STAMP="$(date -u +%Y%m%d_%H%M%S)"
OUT="${BACKUP_DIR}/posa360_${STAMP}.sql.gz"

echo "==> Dumping ${POSTGRES_DB} → ${OUT}"
$COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
  | gzip -c > "$OUT"

echo "==> Removing dumps older than ${KEEP_DAYS} days"
find "$BACKUP_DIR" -type f -name 'posa360_*.sql.gz' -mtime "+${KEEP_DAYS}" -print -delete || true

ls -lh "$OUT"
echo "Backup done."

# Cron (root or deploy user), once daily at 03:15:
# 15 3 * * * cd /opt/posa360 && ENV_FILE=.env.production /opt/posa360/scripts/backup-db.sh >> /var/log/posa360-backup.log 2>&1
