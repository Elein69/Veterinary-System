# ----------------------------
# BUILDER
# ----------------------------
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias primero
COPY package*.json ./

# Instalación reproducible
RUN npm ci

# Copiar TODO el monorepo
COPY . .

# Build solo el microservicio inventory-service
RUN npx turbo run build --filter=inventory-service

# ----------------------------
# RUNNER
# ----------------------------
FROM public.ecr.aws/docker/library/node:20-alpine AS runner

WORKDIR /app

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/inventory-service ./dist

# Set environment
ENV NODE_ENV=qa

EXPOSE 3007

CMD ["node", "dist/main.js"]
