#!/bin/bash
# scripts/setup-vps.sh
# Script per setup iniziale sul VPS

set -e

echo "=== MR Tracker - Setup VPS ==="

# Crea directory
sudo mkdir -p /opt/mr-tracker
cd /opt/mr-tracker

# Crea file .env (da compilare manualmente)
if [ ! -f .env ]; then
  cat > .env << 'EOF'
# MR Tracker - Environment Variables
# COMPILARE CON I VALORI CORRETTI

# GitHub (per pull immagine)
GITHUB_USERNAME=tuo-username-github

# Sicurezza
CRON_SECRET=genera-una-stringa-random-qui

# SMTP Email
SMTP_HOST=smtp.tuodominio.it
SMTP_PORT=587
SMTP_USER=noreply@tuodominio.it
SMTP_PASS=password-smtp
SMTP_FROM=MR Tracker <noreply@tuodominio.it>
REPORT_EMAIL=alessio@karalisweb.net
EOF
  echo "File .env creato. MODIFICARE con i valori corretti!"
fi

# Copia docker-compose.prod.yml
echo "Scarica docker-compose.prod.yml dal repo GitHub dopo averlo pushato"

echo ""
echo "=== Setup completato ==="
echo ""
echo "Prossimi passi:"
echo "1. Modifica /opt/mr-tracker/.env con i valori corretti"
echo "2. Copia docker-compose.prod.yml in /opt/mr-tracker/"
echo "3. docker login ghcr.io"
echo "4. docker compose -f docker-compose.prod.yml pull"
echo "5. docker compose -f docker-compose.prod.yml up -d"
echo ""
