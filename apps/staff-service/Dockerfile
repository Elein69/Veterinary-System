FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY . .


RUN npm install --legacy-peer-deps

RUN npx nest build staff-service

FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/apps/staff-service ./dist

ENV NODE_ENV=qa
EXPOSE 3001
CMD ["node", "dist/main.js"]