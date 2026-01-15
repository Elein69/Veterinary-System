# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

# Construimos el api-gateway
RUN npx @nestjs/cli build api-gateway

# Etapa 2: Runner
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api-gateway ./dist

# El API Gateway suele usar el puerto 3000 o 8080 (verifica tu ecs.tf)
EXPOSE 3000

CMD ["node", "dist/main"]