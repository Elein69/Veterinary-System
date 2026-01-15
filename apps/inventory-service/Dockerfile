# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build inventory-service

# Etapa 2: Runner (Cambiado a Node 20 para evitar el ReferenceError: crypto)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/inventory-service ./dist

# Puerto para Inventory
EXPOSE 3007

CMD ["node", "dist/main"]