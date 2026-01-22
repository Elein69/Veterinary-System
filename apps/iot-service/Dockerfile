# Dockerfile para IoT Service (Puerto 3004)
# Misma estructura corregida que Staff y Medical

# --- ETAPA 1: BUILD ---
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# 1. Copiamos todo el monorepo
COPY . .

# 2. Instalamos dependencias
RUN npm install --legacy-peer-deps

# 3. Build ESPECÍFICO (Sin Turbo, directo con Nest)
RUN npx nest build iot-service

# --- ETAPA 2: RUNNER ---
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# 4. Copiamos dependencias
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 5. APLANAMOS LA RUTA:
# Copiamos de /dist/apps/iot-service -> ./dist
COPY --from=builder /app/dist/apps/iot-service ./dist

# 6. Puerto correcto para IoT (Según tu Terraform es 3004)
EXPOSE 3004

# 7. Ejecutamos desde la raíz de dist
CMD ["node", "dist/main.js"]