# Architecture

## Data Flow

```
Browser (React)
  ↓  (client component: form submission / event handling)
Next.js Server Actions ('use server')
  ↓  (validasi, autorisasi, business logic)
Prisma Client
  ↓  (SQL query via @prisma/client)
Supabase PostgreSQL
```

## Request Lifecycle

```
1. User action (click/submit di client component)
2. Server Action dipanggil (dengan 'use server' directive)
3. Cek session user via getCurrentUser()
4. Validasi autorisasi (cek role)
5. Validasi input
6. Eksekusi query via Prisma
7. Return ActionResult { ok: boolean, error?: string }
8. Client update UI (revalidate + optimistic state)
```

## Component Architecture

```
src/app/
  layout.tsx              ← Root layout (Server Component)
    (protected)/
      layout.tsx          ← Auth check (Server Component, redirect jika belum login)
        app-shell.tsx     ← Layout shell: nav + header (Client Component — uses usePathname)
        dashboard/
          page.tsx        ← Server Component (data fetching di server)
          dashboard-charts.tsx  ← Client Component (recharts, interaktif)
        worksheet/
          page.tsx        ← Server Component
          worksheet-client.tsx  ← Client Component (table, filter, search)
          kegiatan-modal.tsx    ← Client Component (form modal)
          [id]/
            page.tsx            ← Server Component (detail kegiatan)
            detail-client.tsx   ← Client Component (read-only detail view + progress dokumen)
        master-petugas/
          page.tsx        ← Server Component
          master-petugas-client.tsx  ← Client Component
        master-leading-sector/
          page.tsx        ← Server Component
          master-leading-sector-client.tsx  ← Client Component
        users/
          page.tsx        ← Server Component (role check ADMIN)
          users-client.tsx      ← Client Component
  login/
    page.tsx              ← Server Component (redirect jika sudah login)
    login-form.tsx        ← Client Component (form dengan useActionState)
```

## Prisma Models

```
User
  - id, username (unique), password, nama, role (ADMIN | STAFF | KEPALA_BAGIAN)

Petugas
  - id, nama, jabatan?, noHp?, statusAktif

LeadingSector
  - id, nama (unique)

Kegiatan
  - id, namaKegiatan, tanggal, waktu?, tempat, pejabat
  - leadingSectorId → LeadingSector (FK)
  - statusSambutan (SUDAH | BELUM)
  - statusKegiatan (DRAFT | MENUNGGU_PERSETUJUAN | DISETUJUI | DILAKSANAKAN | MENUNGGU_DOKUMEN | SPJ_DIPROSES | SPJ_SELESAI)
  - petugasProtokolId? → Petugas (FK)
  - petugasLiputanId? → Petugas (FK)
  - linkUpload?, catatan?
  - 1:N → Dokumen

Dokumen
  - id, kegiatanId → Kegiatan (FK, onDelete: Cascade)
  - jenis (SURAT_TUGAS | SURAT_UNDANGAN | NASKAH_SAMBUTAN | DOKUMENTASI_FOTO | DOKUMENTASI_VIDEO | BERKAS_SPJ | LAPORAN_AKHIR)
  - status (BELUM_UPLOAD | SUDAH_UPLOAD | PERLU_REVISI)
  - link?, catatan?
  - @@unique([kegiatanId, jenis]) → Satu jenis dokumen per kegiatan
```

## Authentication

- JWT token via `jose` library (HS256)
- Password hash via `bcryptjs`
- Token disimpan di httpOnly cookie (`spj_session`, expiry 7 hari)
- Middleware redirect: unauthenticated → /login, authenticated → /dashboard
- Helper: `getCurrentUser()`, `canEditRole()`, `ActionResult` type di `src/lib/auth.ts`

## File Naming Convention

- Page → `page.tsx` (Server Component)
- Client Component → `xxx-client.tsx`
- Modal → `xxx-modal.tsx`
- Server Action → `src/app/actions/*.ts`
- Shared constants → `src/lib/constants/*.ts`
- Shared lib → `src/lib/*.ts`
- Shared components → `src/components/*.tsx`
- Prisma schema → `prisma/schema.prisma`

## Folder Structure

```
prisma/
  schema.prisma       ← Database schema (single source of truth)
  seed.ts             ← Data contoh untuk development

src/
  app/
    page.tsx          ← Root redirect (ke /dashboard atau /login)
    layout.tsx        ← Root layout
    globals.css       ← Global styles (Tailwind)
    actions/          ← Server Actions (CRUD)
    login/            ← Login page
    (protected)/      ← Semua halaman yang butuh auth
      layout.tsx      ← Auth check
      app-shell.tsx   ← Nav shell
      dashboard/      ← Dashboard
      worksheet/      ← Worksheet kegiatan
      master-petugas/
      master-leading-sector/
      users/
  components/         ← Reusable components
  lib/
    auth.ts           ← Auth helpers (JWT, session, password, canEditRole, ActionResult)
    prisma.ts         ← Prisma client singleton
    constants/        ← Status constants, labels, badge classes
    queries/          ← Shared Prisma queries (e.g. kegiatan detail)
```
