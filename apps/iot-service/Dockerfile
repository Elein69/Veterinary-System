# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx @nestjs/cli build iot-service

# Etapa 2: Runner (Actualizado a Node 20)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/iot-service ./dist

# Puerto para IoT
EXPOSE 3004

CMD ["node", "dist/main"]