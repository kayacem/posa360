#!/bin/sh
set -e

echo "==> Waiting for Postgres..."
i=0
until node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.end()).catch(() => process.exit(1));
"; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Postgres not ready after 60s"
    exit 1
  fi
  sleep 1
done
echo "==> Postgres ready"

echo "==> prisma migrate deploy"
npx prisma migrate deploy

if [ -n "${SEED_SUPER_ADMIN_EMAIL:-}" ] && [ -n "${SEED_SUPER_ADMIN_PASSWORD:-}" ]; then
  echo "==> Optional production seed (super admin)"
  node scripts/seed-prod.mjs
fi

echo "==> Starting app"
exec "$@"
