# PROCEDURA DI PUBBLICAZIONE - MR Tracker

## Prerequisiti

- GitHub account
- VPS Contabo con Docker installato
- Accesso SSH al VPS
- Dominio configurabile (karalisweb.net)
- Credenziali SMTP per invio email

---

## Step 1: Creare Repository GitHub

1. Vai su https://github.com/new
2. Nome repository: `mr-tracker`
3. Visibilità: **Private**
4. NON inizializzare con README (il codice esiste già)
5. Clicca "Create repository"

---

## Step 2: Push del Codice

```bash
cd "/Users/alessio/Desktop/Sviluppo App Claude Code/Morning Routin/mr-tracker"

# Inizializza git
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Initial commit - MR Tracker PWA"

# Collega al repository remoto
git remote add origin git@github.com:TUO_USERNAME/mr-tracker.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 3: Configurare GitHub Secrets

1. Vai su: `https://github.com/TUO_USERNAME/mr-tracker/settings/secrets/actions`
2. Clicca "New repository secret"
3. Aggiungi questi secrets:

| Nome | Valore |
|------|--------|
| `VPS_HOST` | IP del VPS Contabo (es: 123.456.789.0) |
| `VPS_USER` | Username SSH (es: root) |
| `VPS_SSH_KEY` | Chiave privata SSH (contenuto di ~/.ssh/id_rsa) |
| `VPS_PORT` | Porta SSH (default: 22) |

### Come ottenere la chiave SSH:
```bash
cat ~/.ssh/id_rsa
```
Copia TUTTO il contenuto incluso `-----BEGIN RSA PRIVATE KEY-----`

---

## Step 4: Preparare il VPS

### 4.1 Connettiti al VPS
```bash
ssh root@IP_DEL_VPS
```

### 4.2 Verifica Docker
```bash
docker --version
docker compose version
```

Se Docker non è installato:
```bash
curl -fsSL https://get.docker.com | sh
```

### 4.3 Crea directory progetto
```bash
mkdir -p /opt/mr-tracker
cd /opt/mr-tracker
```

### 4.4 Crea file .env
```bash
nano /opt/mr-tracker/.env
```

Contenuto:
```env
# GitHub (per pull immagine)
GITHUB_USERNAME=tuo-username-github

# Sicurezza
CRON_SECRET=genera-una-stringa-random-32-caratteri

# SMTP Email
SMTP_HOST=smtp.tuodominio.it
SMTP_PORT=587
SMTP_USER=noreply@tuodominio.it
SMTP_PASS=la-tua-password-smtp
SMTP_FROM=MR Tracker <noreply@tuodominio.it>
REPORT_EMAIL=alessio@karalisweb.net
```

Salva con: `Ctrl+X`, poi `Y`, poi `Enter`

### 4.5 Crea docker-compose.yml
```bash
nano /opt/mr-tracker/docker-compose.yml
```

Contenuto:
```yaml
version: '3.8'

services:
  mr-tracker:
    image: ghcr.io/${GITHUB_USERNAME}/mr-tracker:latest
    container_name: mr-tracker
    restart: unless-stopped
    ports:
      - "3100:3000"
    environment:
      - DATABASE_URL=file:/app/data/mr-tracker.db
      - CRON_SECRET=${CRON_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
      - REPORT_EMAIL=${REPORT_EMAIL}
      - NEXT_PUBLIC_APP_URL=https://mr.karalisweb.net
      - TZ=Europe/Rome
    volumes:
      - mr-data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mr-data:
```

---

## Step 5: Configurare DNS

Nel pannello di controllo del tuo dominio (karalisweb.net):

1. Aggiungi record **A**:
   - Nome: `mr`
   - Tipo: `A`
   - Valore: `IP_DEL_VPS`
   - TTL: 3600

Attendi propagazione DNS (5-30 minuti).

Verifica:
```bash
ping mr.karalisweb.net
```

---

## Step 6: Primo Deploy

### 6.1 Login a GitHub Container Registry (sul VPS)
```bash
# Crea Personal Access Token su GitHub:
# https://github.com/settings/tokens/new
# Seleziona: read:packages, write:packages

docker login ghcr.io -u TUO_USERNAME
# Inserisci il token come password
```

### 6.2 Primo push da locale
Il push su GitHub trigghera automaticamente il workflow CI/CD.

```bash
# Dal Mac
cd "/Users/alessio/Desktop/Sviluppo App Claude Code/Morning Routin/mr-tracker"
git push
```

### 6.3 Monitora il workflow
Vai su: `https://github.com/TUO_USERNAME/mr-tracker/actions`

Attendi che il workflow completi (circa 5-10 minuti).

### 6.4 Deploy manuale (se il workflow fallisce)
```bash
# Sul VPS
cd /opt/mr-tracker
docker compose pull
docker compose up -d
```

---

## Step 7: Configurare HTTPS (opzionale ma consigliato)

### Opzione A: Traefik (se già installato)
Aggiungi labels al docker-compose.yml

### Opzione B: Nginx + Certbot
```bash
# Sul VPS
apt install nginx certbot python3-certbot-nginx

# Crea config nginx
nano /etc/nginx/sites-available/mr-tracker
```

Contenuto:
```nginx
server {
    listen 80;
    server_name mr.karalisweb.net;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Attiva sito
ln -s /etc/nginx/sites-available/mr-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Ottieni certificato SSL
certbot --nginx -d mr.karalisweb.net
```

---

## Step 8: Configurare Cron per Report Settimanale

### Opzione A: Crontab sul VPS
```bash
# Sul VPS
crontab -e

# Aggiungi questa riga (domenica alle 20:00):
0 20 * * 0 curl -X POST https://mr.karalisweb.net/api/cron/weekly-report -H "Authorization: Bearer TUO_CRON_SECRET"
```

### Opzione B: cron-job.org (servizio esterno gratuito)
1. Registrati su https://cron-job.org
2. Crea nuovo cron job:
   - URL: `https://mr.karalisweb.net/api/cron/weekly-report`
   - Metodo: POST
   - Header: `Authorization: Bearer TUO_CRON_SECRET`
   - Schedulazione: Domenica 20:00

---

## Step 9: Verifica Finale

### Test health check
```bash
curl https://mr.karalisweb.net/api/health
# Deve rispondere: {"status":"ok"}
```

### Test da browser
1. Apri https://mr.karalisweb.net
2. Verifica caricamento app
3. Prova a cliccare su un'attività

### Test PWA su iPhone
1. Apri Safari su iPhone
2. Vai a https://mr.karalisweb.net
3. Tap icona condivisione (quadrato con freccia)
4. "Aggiungi a Home"
5. Apri l'app dalla home

---

## Troubleshooting

### Container non si avvia
```bash
cd /opt/mr-tracker
docker compose logs -f
```

### Database non accessibile
```bash
docker compose exec mr-tracker ls -la /app/data/
```

### Workflow GitHub fallisce
- Verifica i secrets siano configurati correttamente
- Controlla i log su GitHub Actions

### Email non arrivano
- Verifica credenziali SMTP nel .env
- Controlla log container per errori nodemailer

---

## Aggiornamenti Futuri

Per deployare nuove versioni:

```bash
# Dal Mac
cd "/Users/alessio/Desktop/Sviluppo App Claude Code/Morning Routin/mr-tracker"
git add .
git commit -m "Descrizione modifiche"
git push
```

Il deploy è automatico via GitHub Actions.
