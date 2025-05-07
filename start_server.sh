#!/bin/bash
set -euo pipefail

echo "====== START: start_server.sh ======"
echo "Working dir: $(pwd)"

# 1) Web-Root anlegen und Rechte setzen
echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu:ubuntu /var/www/Studivent
cd /var/www/Studivent

# 2) Node.js ≥20 installieren (non-interactive)
if ! node -v; then
  sudo apt-get update
  sudo apt-get install -y nodejs
fi

# 3) Yarn installieren (falls nicht vorhanden)
if ! command -v yarn &> /dev/null; then
  echo "Installing Yarn..."
  sudo apt-get update
  sudo apt-get install -y yarn
fi

# ────────────── BACKEND ──────────────

echo "--- Backend: /var/www/html/backend ---"
cd backend

# Alte node_modules entfernen
echo "Removing old node_modules…"
rm -rf node_modules

# Besitzrechte setzen
sudo chown -R ubuntu:ubuntu .

# Dev+Build → Prod-only
echo "Installing dev dependencies, building, then pruning to production…"
yarn install --silent
yarn build
yarn install --production --silent

# Logs-Ordner sicherstellen
mkdir -p logs

# 4) Backend per PM2 starten oder reloaden
BACKEND_APP="backend-api"
echo "--- PM2: Backend ($BACKEND_APP) ---"
if pm2 list | grep -q "$BACKEND_APP"; then
  pm2 reload ecosystem.config.js --only "$BACKEND_APP"
else
  pm2 start ecosystem.config.js --only "$BACKEND_APP"
fi

# Zurück ins Root
cd /var/www/Studivent

# ────────────── FRONTEND ──────────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd frontend

# Dependencies installieren
echo "Installing frontend dependencies…"
npm install --silent

# Production-Build
echo "Building Angular production bundle…"
npm run build -- --configuration production

# 5) Frontend per PM2 serve starten/reload
FRONTEND_APP="frontend-static"
DIST_DIR="../frontend/dist"
echo "--- PM2: Frontend ($FRONTEND_APP) ---"
if pm2 list | grep -q "$FRONTEND_APP"; then
  pm2 reload "$FRONTEND_APP"
else
  pm2 serve $DIST_DIR 80 --name "$FRONTEND_APP" --spa
fi

# 6) PM2-Prozesse persistieren
echo "Saving PM2 process list…"
pm2 save

echo "====== DONE: start_server.sh ======"
