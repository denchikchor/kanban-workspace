# Kanban Workspace

Lightweight Kanban pet project — **SSR landing + CSR app shell**.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · React Query · Prisma · Postgres (Neon) · Vercel

## Features (MVP)

- Boards list (create)
- Board page with Columns & Tasks (create)
- Client fetching with React Query (focus refetch + soft polling)

## Routes

- `/` – SSR landing
- `/app` – boards list (CSR)
- `/app/board/[boardId]` – board view (CSR)

## API (App Router)

- `GET /api/boards` · `POST /api/boards`
- `GET /api/boards/[boardId]`
- `GET /api/boards/[boardId]/columns`
- `POST /api/columns`
- `POST /api/tasks`
- `DELETE /api/boards/[boardId]/columns/[columnId]`

## Quickstart

```bash
pnpm i
# set DATABASE_URL in .env (Neon pooled URL, sslmode=require)
pnpm prisma migrate dev
pnpm dev
```
