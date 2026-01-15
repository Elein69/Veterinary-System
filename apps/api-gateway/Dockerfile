FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build api-gateway
CMD ["node", "dist/apps/api-gateway/main.js"]

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000

CMD ["node", "dist/main"]