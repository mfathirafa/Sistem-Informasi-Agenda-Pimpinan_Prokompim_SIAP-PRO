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
          dashboard-stats.tsx  ← Client Component (recharts: distribusi status, progress dokumen, top petugas/sektor)
        worksheet/
          page.tsx        ← Server Component (query + searchParams filter + pagination server-side)
          worksheet-client.tsx  ← Client Component (table, filter, search, pagination)
          kegiatan-modal.tsx    ← Client Component (form modal + PetugasPicker)
          [id]/
            page.tsx            ← Server Component (detail kegiatan)
            detail-client.tsx   ← Client Component (detail + inline edit dokumen)
        kalender/
          page.tsx        ← Server Component (grid bulanan via lib/kalender.ts)
          kalender-client.tsx   ← Client Component (popover agenda per hari)
        laporan/
          page.tsx        ← Server Component (query date range)
          laporan-client.tsx    ← Client Component (filter, export XLSX, print)
        master-petugas/
          page.tsx        ← Server Component
          master-petugas-client.tsx  ← Client Component
        master-leading-sector/
          page.tsx        ← Server Component
          master-leading-sector-client.tsx  ← Client Component
        users/
          page.tsx        ← Server Component (role check ADMIN)
          users-client.tsx      ← Client Component
        activity-log/
          page.tsx        ← Server Component (guard ADMIN || STAFF)
          activity-log-client.tsx  ← Client Component (filter, pagination, detail modal)
  login/
    page.tsx              ← Server Component (redirect jika sudah login)
    login-form.tsx        ← Client Component (form dengan useActionState)
```

## Prisma Models

```
User
  - id, username (unique), password, nama, role (ADMIN | STAFF | KEPALA_BAGIAN)
  - activityLog: ActivityLog[]

Petugas
  - id, nama, jabatan?, noHp?, kategori (PROTOKOL | LIPUTAN), statusAktif
  - kegiatan: KegiatanPetugas[]

LeadingSector
  - id, nama (unique)
  - kegiatan: Kegiatan[]

Kegiatan
  - id, namaKegiatan, tanggal, waktu?, tempat, pejabat
  - leadingSectorId → LeadingSector (FK)
  - statusSambutan (SUDAH | BELUM), statusKegiatan (ACARA_MASUK → MENUNGGU_PENUGASAN → KEGIATAN_SELESAI → SPJ_SELESAI)
  - statusPublikasi (BELUM_DIRILIS | TIDAK_DIRILIS | DIRILIS)
  - jenisPenugasan (LEMBUR | SPPD | KEGIATAN)
  - perihalSurat?, picNama?, picNoHp?
  - linkUpload?, catatan?
  - dokumen: Dokumen[], petugas: KegiatanPetugas[]

KegiatanPetugas (junction table)
  - kegiatanId → Kegiatan (FK, onDelete: Cascade)
  - petugasId → Petugas (FK, onDelete: Cascade)
  - @@id([kegiatanId, petugasId])

Dokumen
  - id, kegiatanId → Kegiatan (FK, onDelete: Cascade)
  - jenis (SURAT_TUGAS | SURAT_UNDANGAN | NASKAH_SAMBUTAN | DOKUMENTASI_FOTO | DOKUMENTASI_VIDEO | BERKAS_SPJ | LAPORAN_AKHIR)
  - status (BELUM_UPLOAD | SUDAH_UPLOAD | PERLU_REVISI)
  - link?, catatan?
  - @@unique([kegiatanId, jenis]) → Satu jenis dokumen per kegiatan

ActivityLog
  - id, entity (KEGIATAN | DOKUMEN | PETUGAS | LEADING_SECTOR | USER)
  - entityId, action (CREATE | UPDATE | DELETE)
  - userId → User (FK)
  - changes (Json?), createdAt
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
    actions/          ← Server Actions (CRUD: kegiatan, petugas, leading-sector, users, dokumen)
    login/            ← Login page
    (protected)/      ← Semua halaman yang butuh auth
      layout.tsx      ← Auth check
      app-shell.tsx   ← Nav shell
      dashboard/      ← Dashboard + dashboard-stats.tsx (recharts)
      worksheet/      ← Worksheet kegiatan + kegiatan-modal + [id]/ detail
      kalender/       ← Kalender kegiatan bulanan
      laporan/        ← Laporan SPJ (export XLSX, cetak)
      master-petugas/
      master-leading-sector/
      users/
      activity-log/   ← Log riwayat perubahan (read-only)
  components/         ← Reusable components (searchable-select, petugas-picker, pagination, confirm-dialog)
  lib/
    auth.ts           ← Auth helpers (JWT, session, password, canEditRole, ActionResult)
    prisma.ts         ← Prisma client singleton
    workflow.ts       ← State machine transisi status kegiatan
    worksheet.ts      ← Shared types (KegiatanRow) + query helpers
    kalender.ts       ← Grid helper kalender (getMonthGrid)
    format.ts         ← Date helpers (padDate, toDateInput, formatTanggal)
    activity-log.ts   ← logActivity() helper + normalizeSnapshot + toJsonValue
    constants/        ← Status constants, labels, badge classes
    queries/          ← Shared Prisma queries (kegiatan detail)
```
