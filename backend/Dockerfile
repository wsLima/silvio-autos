FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && npm run seed && node dist/main.js"]
