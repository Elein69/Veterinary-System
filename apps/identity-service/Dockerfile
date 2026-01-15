# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build identity-service

# Etapa 2: Runner (Cambiado de 18 a 20 para soportar crypto.randomUUID)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/identity-service ./dist

# Puerto para Identity
EXPOSE 3001

CMD ["node", "dist/main"]