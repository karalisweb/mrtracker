# docker/Dockerfile
# MR Tracker - Dockerfile Multi-stage per Produzione

# ====================
# Stage 1: Dependencies
# ====================
FROM node:20-alpine3.18 AS deps

WORKDIR /app

# Installa dipendenze sistema per Prisma (Alpine 3.18 ha OpenSSL 3.1 compatibile)
RUN apk add --no-cache libc6-compat openssl

# Copia package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Installa dipendenze
RUN npm ci

# ====================
# Stage 2: Builder
# ====================
FROM node:20-alpine3.18 AS builder

WORKDIR /app

# Installa OpenSSL per Prisma
RUN apk add --no-cache openssl

# Copia dipendenze
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Genera Prisma client
RUN npx prisma generate

# Variabili ambiente per build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build applicazione
RUN npm run build

# ====================
# Stage 3: Runner
# ====================
FROM node:20-alpine3.18 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crea utente non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installa curl per healthcheck e OpenSSL per Prisma
RUN apk add --no-cache curl openssl

# Copia file pubblici
COPY --from=builder /app/public ./public

# Imposta permessi corretti per prerendered cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copia Prisma per migrations runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Crea directory dati e imposta permessi
RUN mkdir -p /app/data
RUN chown -R nextjs:nodejs /app/data

# Usa utente non-root
USER nextjs

# Esponi porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando avvio
CMD ["node", "server.js"]
