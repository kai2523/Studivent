\#!/usr/bin/env bash
set -euo pipefail

# ====================================================

# START: start\_server.sh (überarbeitet)

# ====================================================

echo "====== START: start\_server.sh ======"
echo "Working dir: \$(pwd)"

# 1) Setup Verzeichnis und Rechte

echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu\:ubuntu /var/www/Studivent
cd /var/www/Studivent

# 2) Node.js ≥20 installieren (NodeSource) inkl. npm

echo "--- Installing Node.js (NodeSource) ---"
sudo apt-get update

# Entferne ggf. altes Ubuntu-npm, um Konflikte zu vermeiden

sudo apt-get purge -y npm || true
sudo apt-get install -y nodejs

# Corepack für Yarn aktivieren (ab Node.js 20 enthalten)

echo "--- Activating Corepack / Yarn ---"
sudo corepack enable
sudo corepack prepare yarn\@stable --activate

echo "Node.js: \$(node --version)"
echo "npm:       \$(npm --version)"
echo "Yarn:      \$(yarn --version)"

# ────────── BACKEND ──────────

echo "--- Backend: /var/www/html/backend ---"
cd /var/www/html/backend

echo "Installing dependencies and building…"
yarn install --frozen-lockfile
yarn build

# PM2-Prozess verwalten

BACKEND\_APP="backend-api"
if pm2 list | grep -q "\$BACKEND\_APP"; then
echo "Reload existing PM2 process (\$BACKEND\_APP)..."
pm2 reload ecosystem.config.js --only "\$BACKEND\_APP"
else
echo "Start new PM2 app (\$BACKEND\_APP) with ecosystem.config.js..."
pm2 start ecosystem.config.js
fi

# ────────── FRONTEND ──────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd /var/www/Studivent/frontend

echo "Installing frontend dependencies and building…"
yarn install --frozen-lockfile
yarn build

echo "====== DONE: start\_server.sh ======"
