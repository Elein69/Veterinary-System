FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /repo


COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./
COPY apps ./apps


RUN npm install


RUN npx turbo run build --filter=appointment-service

FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY --from=builder /repo/apps/appointment-service/dist ./dist
COPY --from=builder /repo/apps/appointment-service/package.json ./
COPY --from=builder /repo/node_modules ./node_modules

ENV NODE_ENV=qa
EXPOSE 3005
CMD ["node", "dist/main.js"]
