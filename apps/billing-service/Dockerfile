# ========================
# STAGE 1: BUILD (ROOT)
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /repo

# Copiamos archivos del monorepo (root)
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./
COPY apps ./apps

# Instalamos dependencias UNA VEZ
RUN npm install

# Build SOLO billing-service
RUN npx turbo run build --filter=billing-service

# ========================
# STAGE 2: RUNTIME
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copiamos la build correcta desde builder
COPY --from=builder /repo/dist/apps/billing-service ./dist
COPY --from=builder /repo/apps/billing-service/package.json ./
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 3006
CMD ["node", "dist/main.js"]
