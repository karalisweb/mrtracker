# MR Tracker - Morning Routine Tracker

PWA per tracciare la routine mattutina quotidiana.

## Stack Tecnologico

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Database:** Prisma + SQLite
- **PWA:** next-pwa
- **Email:** Nodemailer (SMTP)
- **Deploy:** Docker + GitHub Actions

## Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Genera Prisma client
npx prisma generate

# Crea database
npx prisma db push

# Avvia dev server
npm run dev
```

Apri http://localhost:3000

## Variabili d'Ambiente

Crea `.env.local`:

```env
DATABASE_URL="file:./dev.db"
CRON_SECRET="your-secret-key"

# SMTP
SMTP_HOST=smtp.tuodominio.it
SMTP_PORT=587
SMTP_USER=noreply@tuodominio.it
SMTP_PASS=password
SMTP_FROM=MR Tracker <noreply@tuodominio.it>
REPORT_EMAIL=tua@email.it
```

## Deploy su VPS

### 1. Setup GitHub Repository

1. Crea repo su GitHub
2. Aggiungi Secrets in Settings > Secrets > Actions:
   - `VPS_HOST` - IP del VPS
   - `VPS_USER` - username SSH (es: root)
   - `VPS_SSH_KEY` - chiave privata SSH
   - `VPS_PORT` - porta SSH (default: 22)

### 2. Setup VPS

```bash
# Crea directory
sudo mkdir -p /opt/mr-tracker
cd /opt/mr-tracker

# Crea .env con le variabili
nano .env

# Copia docker-compose.prod.yml dal repo
# ...

# Login a GitHub Container Registry
docker login ghcr.io -u TUO_USERNAME

# Pull e avvia
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 3. Configurazione DNS

Aggiungi record A:
```
mr.karalisweb.net -> IP_DEL_VPS
```

### 4. Reverse Proxy (opzionale)

Se usi Traefik/Nginx, configura per proxy pass alla porta 3100.

## Cron Report Settimanale

Aggiungi cron job sul VPS:

```bash
# Ogni domenica alle 20:00
0 20 * * 0 curl -X POST https://mr.karalisweb.net/api/cron/weekly-report -H "Authorization: Bearer $CRON_SECRET"
```

## Comandi Utili

```bash
# Sviluppo
npm run dev
npm run build
npm run lint

# Database
npx prisma studio     # GUI database
npx prisma db push    # Applica schema
npx prisma generate   # Rigenera client

# Docker locale
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
```

## Struttura Progetto

```
src/
├── app/
│   ├── api/           # API routes
│   ├── stats/         # Pagina statistiche
│   ├── history/       # Pagina storico
│   └── page.tsx       # Dashboard principale
├── components/        # Componenti React
├── hooks/            # Custom hooks
├── lib/              # Utilities e config
└── types/            # TypeScript types

docker/
├── Dockerfile
├── docker-compose.yml      # Build locale
└── docker-compose.prod.yml # Deploy con immagine GHCR

prisma/
└── schema.prisma     # Schema database
```

## Licenza

Uso personale - Alessio Karalisweb
