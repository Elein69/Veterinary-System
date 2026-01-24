FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx turbo run build --filter=inventory-service


FROM public.ecr.aws/docker/library/node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/inventory-service ./dist

ENV NODE_ENV=qa

EXPOSE 3007

CMD ["node", "dist/main.js"]
