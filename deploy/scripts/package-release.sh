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
# Prisma client runtime (standalone trace may omit the generated engine files)
mkdir -p "$OUT/node_modules"
if [[ -d node_modules/@prisma ]]; then
  rm -rf "$OUT/node_modules/@prisma"
  cp -a node_modules/@prisma "$OUT/node_modules/"
fi
if [[ -d node_modules/.prisma ]]; then
  rm -rf "$OUT/node_modules/.prisma"
  cp -a node_modules/.prisma "$OUT/node_modules/"
fi

# Self-contained Prisma CLI for `migrate deploy` on the server (copying only
# node_modules/prisma misses transitive deps like effect/fast-check/c12).
PRISMA_VERSION="$(node -p "require('./node_modules/prisma/package.json').version")"
echo "==> Install prisma CLI ${PRISMA_VERSION} → prisma-cli/"
mkdir -p "$OUT/prisma-cli"
echo '{"private":true}' > "$OUT/prisma-cli/package.json"
npm install --prefix "$OUT/prisma-cli" --no-audit --no-fund --no-save \
  "prisma@${PRISMA_VERSION}" >/dev/null

# Optional prod seed helper
mkdir -p "$OUT/scripts"
if [[ -f scripts/seed-prod.mjs ]]; then
  cp scripts/seed-prod.mjs "$OUT/scripts/"
fi

# Ship activate script inside release for convenience
mkdir -p "$OUT/deploy/scripts"
cp deploy/scripts/activate-release.sh "$OUT/deploy/scripts/"
chmod +x "$OUT/deploy/scripts/activate-release.sh"

# actions/upload-artifact@v4 drops hidden paths (.next, node_modules/.prisma) and file
# modes. In CI, ship the tree as one tarball + the activate script; activate-release.sh
# unpacks it on the server. (Fixing this in deploy.yml would need include-hidden-files.)
if [[ "${GITHUB_ACTIONS:-}" == "true" || "${PACK_TARBALL:-}" == "1" ]]; then
  echo "==> Pack release tree → release.tgz"
  TMP_TGZ="$(mktemp -d)/release.tgz"
  tar czf "$TMP_TGZ" -C "$OUT" .
  rm -rf "$OUT"
  mkdir -p "$OUT/deploy/scripts"
  mv "$TMP_TGZ" "$OUT/release.tgz"
  cp deploy/scripts/activate-release.sh "$OUT/deploy/scripts/"
  chmod +x "$OUT/deploy/scripts/activate-release.sh"
fi

echo "Packaged → $OUT"
du -sh "$OUT"
