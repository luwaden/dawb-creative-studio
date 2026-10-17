#!/bin/bash
# DAWB Creative Studio - local start for macOS. Requires Node.js 20+.
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Install Node.js LTS from https://nodejs.org first."; read -r; exit 1; }
[ -d node_modules ] || npm ci || npm install
[ -f .next/BUILD_ID ] || npm run build
(sleep 4 && open http://localhost:3000) &
npm run start
