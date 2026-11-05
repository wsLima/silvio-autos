# Silvio Autos — Backend

API do site de anúncios de veículos. NestJS + PostgreSQL (Prisma) + MinIO (armazenamento de imagens, S3-compatible). Autenticação por admin único via JWT em cookie httpOnly — não há cadastro público.

## Requisitos

- Node.js 22+
- Docker Desktop (Postgres + MinIO)

## Setup

```bash
npm install

# sobe Postgres e MinIO (bucket público criado automaticamente)
docker compose up -d

# aplica o schema no banco
npx prisma migrate dev

# cria o admin único a partir das variáveis ADMIN_* do .env
npm run seed

# sobe a API em modo desenvolvimento (http://localhost:3333)
npm run start:dev
```

Copie `.env.example` para `.env` e ajuste os valores (já vem com defaults funcionais para desenvolvimento local).

> As portas do Postgres (`55432`) e da API (`3333`) foram escolhidas para não colidir com outros projetos que já podem estar rodando na máquina. Ajuste em `docker-compose.yml`/`.env` se precisar.

## Endpoints principais

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /listings`, `GET /listings/:id` — públicos, só anúncios `ACTIVE`
- `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id` — admin (multipart para criar, campo `images`)
- `POST /listings/:id/images`, `DELETE /listings/:id/images/:imageId` — admin
- `GET /admin/listings`, `GET /admin/listings/:id` — admin, qualquer status

## Scripts

- `npm run start:dev` — desenvolvimento com watch
- `npm run build` / `npm run start:prod` — produção
- `npm run seed` — cria/atualiza o admin único
- `npm run lint` — oxlint
- `npm test` / `npm run test:e2e` — vitest
