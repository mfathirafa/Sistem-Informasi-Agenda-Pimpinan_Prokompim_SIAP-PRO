# Deployment

## Stack

| Layer | Technology | Catatan |
|-------|-----------|---------|
| Frontend | Vercel | Static + server rendering via Vercel |
| Backend | Server Actions | Berjalan di Vercel (serverless) |
| Database | Supabase PostgreSQL | Managed PostgreSQL |
| Storage | Supabase Storage | Belum digunakan — untuk kebutuhan file di masa depan |

## Environment Variables

```
DATABASE_URL=postgresql://...          # Supabase PostgreSQL connection string (via connection pooler)
DIRECT_URL=postgresql://...            # Supabase PostgreSQL direct connection (tanpa pooler, untuk Prisma Migrate)
AUTH_SECRET=<random-strong-string>     # JWT secret key. WAJIB ter-set, aplikasi gagal jika tidak ada
```

**Catatan:** `AUTH_SECRET` harus berupa string random yang kuat. Jika environment variable ini tidak ter-set, aplikasi akan throw error saat startup.

## Deployment Flow

```
1. Push kode ke branch main
2. Vercel otomatis build dan deploy
3. Prisma generate client (postinstall script)
4. Aplikasi siap diakses di Vercel URL
```

## Prisma Migration Flow

```
1. Edit prisma/schema.prisma
2. Jalankan: npx prisma migrate dev --name <nama-migration>
3. Jalankan: npx prisma generate
4. Push ke branch → Vercel deploy otomatis
```

Jangan pernah mengedit database langsung dari Supabase — semua perubahan schema wajib melalui Prisma Migration.

## Build Commands

```bash
# Development
npm run dev

# Production build test (sebelum push ke Vercel)
npm run build

# Prisma
npm run db:push       # Push schema ke DB (tanpa migration file)
npm run db:migrate    # Jalankan migration dev
npm run db:seed       # Seed data contoh
npm run db:studio     # Buka Prisma Studio

# Backfill data lama
npm run backfill:dokumen
```

## Development

```bash
# Jalankan Prisma migration dulu
npm run db:migrate

# Seed data contoh
npm run db:seed

# Jalankan dev server
npm run dev
```
