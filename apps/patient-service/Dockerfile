
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install


RUN npx nest build patient-service


FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist/apps/patient-service ./dist

EXPOSE 3002


CMD ["node", "dist/main"]