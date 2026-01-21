# ========================
# STAGE 1: BUILD (ROOT)
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /repo

# Copiamos archivos del monorepo
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./
COPY apps ./apps

# Instalamos dependencias UNA VEZ
RUN npm install

# Build SOLO appointment-service
RUN npx turbo run build --filter=appointment-service

# ========================
# STAGE 2: RUNTIME
# ========================
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY --from=builder /repo/apps/appointment-service/dist ./dist
COPY --from=builder /repo/apps/appointment-service/package.json ./
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 3005
CMD ["node", "dist/main.js"]
