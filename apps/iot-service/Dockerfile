FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json turbo.json ./
RUN npm ci
COPY . .
RUN npx turbo run build --filter=iot-service

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/iot-service ./dist
EXPOSE 3004
CMD ["node", "dist/main"]