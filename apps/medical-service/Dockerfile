# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx @nestjs/cli build medical-service

# Etapa 2: Runner (Cambiado de 18 a 20 para consistencia y evitar errores de crypto)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/medical-service ./dist

# Puerto para Medical
EXPOSE 3003

CMD ["node", "dist/main"]