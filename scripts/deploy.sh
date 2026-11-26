#!/usr/bin/env bash
# Local/manual note: production deploys via GitHub Actions (build off-server + rsync).
# On the VPS, activate a already-rsynced release with:
#   /opt/posa/apps/eticaret/releases/<sha>/deploy/scripts/activate-release.sh <sha>
set -euo pipefail

echo "Production deploy is CI-driven (see .github/workflows/deploy.yml)."
echo "Do NOT run next build on the 2 GB droplet (build still runs in CI)."
echo ""
echo "Manual activate (after rsync):"
echo "  APP_ROOT=/opt/posa/apps/eticaret"
echo "  \$APP_ROOT/releases/<sha>/deploy/scripts/activate-release.sh <sha>"
exit 0
