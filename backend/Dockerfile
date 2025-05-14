FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN npx prisma generate

RUN yarn build

EXPOSE 3000

CMD ["node", "dist/main"]

HEALTHCHECK --interval=5m --timeout=10s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1
