#!/usr/bin/env bash
# Build a deployable standalone release directory (run in CI after npm run build).
# Usage: package-release.sh <out-dir>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:?output directory required}"
cd "$ROOT"

if [[ ! -f .next/standalone/server.js ]]; then
  echo "Missing .next/standalone — run npm run build first" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

echo "==> Copy standalone"
cp -a .next/standalone/. "$OUT/"

echo "==> Copy static + public"
mkdir -p "$OUT/.next"
cp -a .next/static "$OUT/.next/"
cp -a public "$OUT/"

echo "==> Copy prisma + migrate tooling"
cp -a prisma "$OUT/"
cp package.json "$OUT/"
# Prisma CLI + engines (standalone tree may omit them)
mkdir -p "$OUT/node_modules"
if [[ -d node_modules/prisma ]]; then
  rm -rf "$OUT/node_modules/prisma"
  cp -a node_modules/prisma "$OUT/node_modules/"
fi
if [[ -d node_modules/@prisma ]]; then
  rm -rf "$OUT/node_modules/@prisma"
  cp -a node_modules/@prisma "$OUT/node_modules/"
fi

# Optional prod seed helper
mkdir -p "$OUT/scripts"
if [[ -f scripts/seed-prod.mjs ]]; then
  cp scripts/seed-prod.mjs "$OUT/scripts/"
fi

# Ship activate script inside release for convenience
mkdir -p "$OUT/deploy/scripts"
cp deploy/scripts/activate-release.sh "$OUT/deploy/scripts/"
chmod +x "$OUT/deploy/scripts/activate-release.sh"

echo "Packaged → $OUT"
du -sh "$OUT"
