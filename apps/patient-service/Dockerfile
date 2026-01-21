# Etapa 1: Constructor
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# Copiamos la raíz (necesario para ver los workspaces y el package.json global)
COPY . .

# Instalamos y compilamos dentro de Docker
RUN npm install --legacy-peer-deps
RUN npx nest build patient-service

# Etapa 2: Ejecutor (Imagen liviana)
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# Copiamos solo lo necesario desde la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Esta es la ruta donde Nest guarda el build en monorepos
COPY --from=builder /app/dist/apps/patient-service ./dist

EXPOSE 3002
CMD ["node", "dist/main.js"]