FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3003
CMD ["node", "dist/main"]