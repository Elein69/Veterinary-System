FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# Copiamos todo el monorepositorio
COPY . .

RUN npm install --legacy-peer-deps

# Build del servicio específico
RUN npx nest build notification-service

FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Ajuste de ruta según tu estructura de 'dist'
COPY --from=builder /app/dist/apps/notification-service ./dist

EXPOSE 3008
CMD ["node", "dist/main.js"]