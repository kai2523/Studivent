#!/bin/bash
set -euo pipefail

echo "====== START: start_server.sh ======"
echo "Working dir: $(pwd)"

# Definiere den Pfad zu deiner gewünschten Node-Version einmal
NODE_BIN_PATH="/home/ubuntu/.nvm/versions/node/v22.15.0/bin"

# 1) Web-Root anlegen und Rechte setzen
echo "--- Setup /var/www/Studivent ---"
sudo mkdir -p /var/www/Studivent
sudo chown -R ubuntu:ubuntu /var/www/Studivent
# cd /var/www/Studivent # Du bist schon hier oder wechselst gleich explizit

# Zurück ins Root Verzeichnis (des Projekts)
cd /var/www/Studivent

# ────────────── BACKEND ──────────────

echo "--- Backend: /var/www/Studivent/backend ---"
cd backend # cd /var/www/Studivent/backend wäre sicherer
echo "Working dir: $(pwd)"

# Dev+Build → Prod-only
echo "Installing dev dependencies, building, then pruning to production…"
"$NODE_BIN_PATH/yarn" install
"$NODE_BIN_PATH/yarn" build

BACKEND_APP="backend-api"

if pm2 list | grep -q "$BACKEND_APP"; then
  echo "Reload bestehender PM2-Prozess ($BACKEND_APP)..."
  pm2 reload ecosystem.config.js --only "$BACKEND_APP"
else
  echo "Starte neue PM2-App ($BACKEND_APP) mit ecosystem.config.js..."
  pm2 start ecosystem.config.js --only "$BACKEND_APP" # Sicherstellen, dass ecosystem.config.js den richtigen Interpreter für Node 22.15.0 nutzt!
fi

# ────────────── CMS ──────────────

cd /var/www/Studivent/cms
echo "Working directory: $(pwd)"

CMS_APP="cms-directus"

echo "🔧 Installing CMS dependencies…"
"$NODE_BIN_PATH/npm" install # Node-Version hier explizit setzen

echo "🔧 Installing extension dependencies…"
EXTENSIONS_PATH="./extensions"
if [ -d "$EXTENSIONS_PATH" ]; then
  for EXT in "$EXTENSIONS_PATH"/*; do
    if [ -f "$EXT/package.json" ]; then
      echo "📦 Installing in: $EXT"
      ( # In einer Subshell arbeiten, um cd-Effekte zu isolieren
        cd "$EXT"
        "$NODE_BIN_PATH/npm" install # Node-Version hier explizit setzen
        "$NODE_BIN_PATH/npm" run build # Node-Version hier explizit setzen
      )
    fi
  done
else
  echo "⚠️ No extensions directory found"
fi

# Vor dem Bootstrap, lösche node_modules und package-lock.json, um sicherzustellen, dass alles frisch mit Node 22 gebaut wird
echo "🧹 Cleaning CMS node_modules and package-lock.json to ensure fresh install with correct Node version..."
rm -rf node_modules package-lock.json # oder yarn.lock falls du yarn für CMS nutzt
"$NODE_BIN_PATH/npm" install # Erneut installieren mit der korrekten Node-Version

echo "🚀 Bootstrapping Directus..."
"$NODE_BIN_PATH/npx" directus bootstrap # Node-Version hier explizit setzen

if pm2 list | grep -q "$CMS_APP"; then
  echo "Reloading existing PM2 app ($CMS_APP)…"
  pm2 reload ecosystem.config.js --only "$CMS_APP"
else
  echo "Starting PM2 app ($CMS_APP)…"
  pm2 start ecosystem.config.js --only "$CMS_APP" # Sicherstellen, dass ecosystem.config.js den richtigen Interpreter für Node 22.15.0 nutzt!
fi

# ────────────── FRONTEND ──────────────

echo "--- Frontend: /var/www/Studivent/frontend ---"
cd /var/www/Studivent/frontend

# Dependencies installieren
echo "Installing frontend dependencies…"
# Hier könntest du auch die Node-Version explizit setzen, wenn nötig.
# Frontend-Builds sind oft weniger anfällig für Node-Versionen als Backend/CMS mit nativen Modulen.
# Aber Konsistenz schadet nicht:
"$NODE_BIN_PATH/npm" install --no-optional --no-interactive

# Production-Build
echo "Building Angular production bundle…"
"$NODE_BIN_PATH/npm" run build

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
