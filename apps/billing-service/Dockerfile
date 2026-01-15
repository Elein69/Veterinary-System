# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build billing-service

# Etapa 2: Runner (Cambiado a Node 20 para arreglar el error de crypto)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/billing-service ./dist

# Puerto para Billing
EXPOSE 3006

CMD ["node", "dist/main"]