# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx @nestjs/cli build patient-service

# Etapa 2: Runner
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/patient-service ./dist

EXPOSE 3002
CMD ["node", "dist/main"]