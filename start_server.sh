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

# Besitzrechte setzen
sudo chown -R ubuntu:ubuntu .

# Dev+Build → Prod-only
echo "Installing dev dependencies, building, then pruning to production…"
yarn install --silent
yarn build
yarn install --production --silent

# Logs-Ordner sicherstellen
mkdir -p logs

nest start

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

echo "====== DONE: start_server.sh ======"
