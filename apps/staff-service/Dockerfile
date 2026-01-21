FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# 1. Copiamos la raíz para que vea los Workspaces
COPY . .

# 2. Instalamos con el mapa de versiones limpio
RUN npm install --legacy-peer-deps

# 3. Build específico
RUN npx nest build staff-service

FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copiamos el build desde la ruta del monorepo
COPY --from=builder /app/dist/apps/staff-service ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]