FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npx @nestjs/cli build medical-service
CMD ["node", "dist/apps/medical-service/main.js"]


FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules


COPY --from=builder /app/dist/apps/medical-service ./dist


EXPOSE 3003

CMD ["node", "dist/main"]