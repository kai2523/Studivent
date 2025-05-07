#!/bin/bash
set -euo pipefail

echo "====== START: start_server.sh ======"
echo "Working dir: $(pwd)"

# 1) Web-Root anlegen und Rechte setzen
echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu:ubuntu /var/www/Studivent
cd /var/www/Studivent

# 2) Node.js ≥20 installieren
echo "Installing dependencies..."
sudo apt-get update
sudo apt-get install -y nodejs
sudo apt-get install -y yarn
sudo npm install -g @nestjs/cli
nest --version

# ────────────── BACKEND ──────────────

echo "--- Backend: /var/www/html/backend ---"
cd backend

# Besitzrechte setzen
sudo chown -R ubuntu:ubuntu .

# Dev+Build → Prod-only
echo "Installing dev dependencies, building, then pruning to production…"
sudo yarn install
sudo yarn build

# Logs-Ordner sicherstellen
mkdir -p logs

sudo nest start

# Zurück ins Root
cd /var/www/Studivent

# ────────────── FRONTEND ──────────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd frontend

# Dependencies installieren
echo "Installing frontend dependencies…"
sudo npm install

# Production-Build
echo "Building Angular production bundle…"
sudo npm run build

echo "====== DONE: start_server.sh ======"
