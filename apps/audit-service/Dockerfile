# ========================
# STAGE 1: BUILD
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /repo

# Copiamos archivos del monorepo
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./
COPY apps ./apps

# Instalamos dependencias
RUN npm install

# Build solo audit-service
RUN npx turbo run build --filter=audit-service

# ========================
# STAGE 2: RUNTIME
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copiamos la build correcta desde builder
COPY --from=builder /repo/dist/apps/audit-service ./dist
COPY --from=builder /repo/apps/audit-service/package.json ./
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 3010
CMD ["node", "dist/main.js"]

