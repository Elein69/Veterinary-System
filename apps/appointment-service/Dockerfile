FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install

RUN npx turbo run build --filter=appointment-service

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/appointment-service ./dist
EXPOSE 3005
CMD ["node", "dist/main"]