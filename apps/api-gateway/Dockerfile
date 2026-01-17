FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copiamos todo (QA tolera esto)
COPY . .

# Instalación reproducible
RUN npm ci

# Build correcto del microservicio
RUN npx turbo run build --filter=api-gateway

ENV NODE_ENV=qa

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main.js"]
