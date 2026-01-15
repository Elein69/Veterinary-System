# Etapa 1: Builder (Usamos Node 20 del mirror de AWS)
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

# Copiamos todo el monorepositorio
COPY . .

# Instalamos y compilamos
RUN npm install
RUN npx @nestjs/cli build appointment-service

# Etapa 2: Runner (Cambiado a Node 20 para evitar error de crypto)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# Copiamos los archivos generados
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/appointment-service ./dist

# Puerto específico de Appointment Service
EXPOSE 3005

# Ejecución
CMD ["node", "dist/main"]