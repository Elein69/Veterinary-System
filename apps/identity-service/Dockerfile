FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build identity-service
CMD ["node", "dist/apps/identity-service/main.js"]

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules


COPY --from=builder /app/dist/apps/identity-service ./dist


EXPOSE 3001

CMD ["node", "dist/main"]