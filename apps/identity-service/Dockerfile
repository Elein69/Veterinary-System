FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copiamos todo (QA tolera esto)
COPY . .

# Instalación reproducible
RUN npm ci

# Build correcto del microservicio
RUN npx turbo run build --filter=identity-service

ENV NODE_ENV=qa

EXPOSE 3001

CMD ["node", "dist/apps/identity-service/main.js"]
