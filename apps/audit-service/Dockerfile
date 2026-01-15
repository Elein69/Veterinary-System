# Etapa 1: Builder (Usamos Node 20 de Amazon para evitar bloqueos)
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

# Copiamos archivos de configuración primero para aprovechar el caché
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copiamos todo el código
COPY . .

# Instalamos dependencias y construimos
RUN npm install
RUN npx @nestjs/cli build audit-service

# Etapa 2: Runner (¡Aquí TAMBIÉN debe ser Node 20!)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# Copiamos lo necesario del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/audit-service ./dist

# Exponemos el puerto del microservicio
EXPOSE 3010

# Ejecutamos la aplicación
CMD ["node", "dist/main"]