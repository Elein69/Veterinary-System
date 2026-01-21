# Etapa 1: Builder
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npx nest build api-gateway

# Etapa 2: Runner
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Ajustamos la ruta para que coincida con el comando de ejecución
COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000
# El comando ahora buscará en /app/dist/main.js
CMD ["node", "dist/main.js"]