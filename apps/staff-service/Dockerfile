FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci

RUN npx turbo run build --filter=staff-service

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/staff-service ./dist
EXPOSE 3009
CMD ["node", "dist/main"]