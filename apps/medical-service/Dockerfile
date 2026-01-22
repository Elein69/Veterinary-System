# Dockerfile para Medical Service
# Basado en el éxito de Staff Service

# --- ETAPA 1: BUILD ---
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# 1. Copiamos todo el código fuente
COPY . .

# 2. Instalamos dependencias (legacy-peer-deps ayuda a evitar conflictos)
RUN npm install --legacy-peer-deps

# 3. Build ESPECÍFICO usando Nest CLI directamente (Más seguro que Turbo aquí)
# Esto generará la carpeta en dist/apps/medical-service
RUN npx nest build medical-service

# --- ETAPA 2: RUNNER (Imagen limpia) ---
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# 4. Traemos las dependencias y archivos base
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 5. EL TRUCO MAESTRO:
# Copiamos el contenido de la carpeta compilada DIRECTAMENTE a ./dist
# Así evitamos errores de nombres de carpetas
COPY --from=builder /app/dist/apps/medical-service ./dist

# 6. Puerto de Medical Service
EXPOSE 3003

# 7. Ejecutamos directo (La ruta ahora es corta y segura)
CMD ["node", "dist/main.js"]