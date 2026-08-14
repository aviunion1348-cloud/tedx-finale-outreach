#!/usr/bin/env bash
set -e
# TEDx BIT Jaipur Outreach Engine — one-command push
# Run from THIS repo folder. If you haven't initialized git yet:
#   git init -b main && git remote add origin https://github.com/aviunion1348-cloud/tedx-bit-jaipur-outreach-engine.git
cd "$(dirname "$0")"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repo. Initialize:"
  echo "  git init -b main"
  echo "  git remote add origin https://github.com/aviunion1348-cloud/tedx-bit-jaipur-outreach-engine.git"
  echo "then re-run this script."
  exit 1
fi
# Upgrade lockfile sanity: reinstall to align package-lock with package.json
npm install --no-audit --no-fund --loglevel=error
git add -A
git commit -m "Upgrade Next.js to 15.5.23 (fix CVE-2025-66478 Vercel block)" || true
git push -u origin main
echo "Done. Trigger Redeploy in Vercel."
