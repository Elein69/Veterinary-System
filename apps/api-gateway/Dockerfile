FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx turbo run build --filter=api-gateway

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000

CMD ["node", "dist/main"]