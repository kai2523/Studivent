#!/bin/bash
set -euo pipefail

# Ganz am Anfang des Skripts
export NVM_DIR="$HOME/.nvm"
# lade nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# standard Node-Version aktivieren
nvm use 22.15.0

echo "====== START: start_server.sh ======"
echo "Working dir: $(pwd)"

# 1) Web-Root anlegen und Rechte setzen
echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu:ubuntu /var/www/Studivent
cd /var/www/Studivent

# Zurück ins Root Verzeichnis
cd /var/www/Studivent

# ────────────── BACKEND & CMS ──────────────

sudo docker compose down 

sudo docker compose build backend

sudo docker compose up -d

sudo docker image prune -f

# ────────────── FRONTEND ──────────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd /var/www/Studivent/frontend

# Dependencies installieren
echo "Installing frontend dependencies…"
npm install --no-optional --no-interactive

# Production-Build
echo "Building Angular production bundle…"
npm run build

# Zielverzeichnis für Nginx
NGINX_WWW_DIR="/var/www/html/studivent"

echo "Deploying frontend build to $NGINX_WWW_DIR …"

# Vorhandenes Zielverzeichnis löschen (falls vorhanden)
sudo rm -rf "$NGINX_WWW_DIR"
sudo mkdir -p "$NGINX_WWW_DIR"

# Dateien aus dem dist-Build kopieren
sudo cp -r dist/studivent/browser/* "$NGINX_WWW_DIR/"

# Berechtigungen setzen
sudo chown -R www-data:www-data "$NGINX_WWW_DIR"
sudo chmod -R 755 "$NGINX_WWW_DIR"

# Optional: Nginx reload (nur nötig, wenn Konfiguration geändert wurde)
# sudo systemctl reload nginx

echo "====== DONE: start_server.sh ======"
