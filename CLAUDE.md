# SIMAKP - Sistem Manajemen SPJ

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Tailwind CSS
- Vercel
- Server Actions

## Coding Rules

- Jangan gunakan any.
- Gunakan TypeScript strict.
- Gunakan Server Components jika memungkinkan.
- Gunakan Server Actions untuk CRUD.
- Jangan membuat API Route kecuali diperlukan.
- Semua query database melalui Prisma.
- Gunakan import alias @/.

## Folder Structure

src/
app/
components/
lib/
actions/
prisma/

## Naming

Page -> page.tsx
Client Component -> xxx-client.tsx
Action -> actions/*.ts

## UI

- Responsive
- Gunakan Tailwind
- Jangan mengubah desain tanpa diminta.

## Database

PostgreSQL (Supabase)

Semua perubahan schema wajib melalui Prisma Migration.

## Deployment

Frontend + Backend:
Vercel

Database:
Supabase

## Goal

Membangun Sistem Manajemen SPJ yang stabil, maintainable, dan production-ready.