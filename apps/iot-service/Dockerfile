FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install

RUN npx @nestjs/cli build iot-service
CMD ["node", "dist/apps/iot-service/main.js"]

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/iot-service ./dist
EXPOSE 3004
CMD ["node", "dist/main"]