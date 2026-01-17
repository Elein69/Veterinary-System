FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copiamos todo (QA tolera esto)
COPY . .

# Instalación reproducible
RUN npm ci

# Build correcto del microservicio
RUN npx turbo run build --filter=staff-service

ENV NODE_ENV=qa

EXPOSE 3009

CMD ["node", "dist/apps/staff-service/main.js"]
