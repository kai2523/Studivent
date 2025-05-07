#!/bin/bash
set -euo pipefail

echo "====== START: start_server.sh ======"
echo "Working dir: $(pwd)"

# 1) Web-Root anlegen und Rechte setzen
echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu:ubuntu /var/www/Studivent
cd /var/www/Studivent

# ────────────── FRONTEND ──────────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd frontend

# Dependencies installieren
echo "Installing frontend dependencies…"
npm install

# Production-Build
echo "Building Angular production bundle…"
npm run build

# Zurück ins Root
cd /var/www/Studivent

# ────────────── BACKEND ──────────────

echo "--- Backend: /var/www/Studivent/backend ---"
cd backend
echo "Working dir: $(pwd)"

# Dev+Build → Prod-only
echo "Installing dev dependencies, building, then pruning to production…"
/home/ubuntu/.nvm/versions/node/v22.15.0/bin/yarn install
/home/ubuntu/.nvm/versions/node/v22.15.0/bin/yarn build

BACKEND_APP="backend-api"

if pm2 list | grep -q "$BACKEND_APP"; then
  echo "Reload bestehender PM2-Prozess ($BACKEND_APP)..."
  pm2 reload ecosystem.config.js --only "$BACKEND_APP"
else
  echo "Starte neue PM2-App ($BACKEND_APP) mit ecosystem.config.js..."
  pm2 start ecosystem.config.js
fi


echo "====== DONE: start_server.sh ======"