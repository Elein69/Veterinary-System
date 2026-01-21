# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

COPY . .

# Instalación con Nest 11
RUN npm install --legacy-peer-deps

# Build del servicio
RUN npx nest build identity-service

# Etapa 2: Runner
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# COPIA CRÍTICA: Traemos el contenido específico a la carpeta dist
COPY --from=builder /app/dist/apps/identity-service ./dist

EXPOSE 3001

# Ahora main.js estará en /app/dist/main.js
CMD ["node", "dist/main.js"]