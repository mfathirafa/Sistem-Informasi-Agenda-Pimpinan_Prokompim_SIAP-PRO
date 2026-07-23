# Roadmap

## Sprint 1

| Fitur | Status | Catatan |
|-------|--------|---------|
| Login | ✅ Selesai | Login form dengan JWT + bcrypt + middleware redirect |
| Dashboard | ✅ Selesai | Halaman dashboard dengan stat cards dan chart (recharts) |
| Worksheet | ✅ Selesai | CRUD worksheet dengan filter, search, CSV export |

## Sprint 2

| Fitur | Status | Catatan |
|-------|--------|---------|
| Workflow Status Manajemen | 🟡 Sebagian | Enum status sudah di Prisma schema + constants + UI dropdown di modal. Namun belum ada logika transisi status (validasi urutan workflow, status blocking, dsb.) |
| Manajemen Dokumen | 🟡 Sebagian | Model Dokumen + backfill script + auto-create 7 dokumen saat tambah kegiatan sudah ada. Namun belum ada UI khusus untuk upload/manajemen dokumen per kegiatan |
| Detail Worksheet | ✅ Selesai | Route `worksheet/[id]` + `detail-client.tsx` + `lib/queries/kegiatan.ts` sudah dibuat. Fitur read-only (lihat detail kegiatan + progress dokumen). Edit/upload dokumen belum ada |

## Sprint 3

| Fitur | Status | Catatan |
|-------|--------|---------|
| Activity Log | ⏳ Belum | Belum ada implementasi activity log di codebase |
| Dashboard Baru | ⏳ Belum | Dashboard saat ini masih basic. "Dashboard Baru" kemungkinan dashboard lanjutan dengan metrik lebih lengkap |
| Export | 🟡 Sebagian | Export CSV sudah ada di Worksheet. Mungkin perlu format tambahan |

## Fitur yang Ada di Project tapi Belum di Roadmap

| Fitur | Status | Catatan |
|-------|--------|---------|
| Master Petugas | ✅ Selesai | CRUD master petugas dengan status aktif/nonaktif |
| Master Leading Sector | ✅ Selesai | CRUD master leading sector |
| Kelola Pengguna (Users) | ✅ Selesai | CRUD pengguna khusus role ADMIN, dengan proteksi agar tidak bisa hapus akun sendiri |
| Manajemen Session | ✅ Selesai | JWT session dengan expiry 7 hari, cookie httpOnly, middleware redirect |

## Changelog

### 23 Juli 2026 — Sesi 4: Architecture Cleanup

| Temuan | Status | Catatan |
|--------|--------|---------|
| H1: AUTH_SECRET fallback | ✅ Fixed | `lib/auth.ts` + `middleware.ts` sekarang throw error jika AUTH_SECRET tidak ada |
| H2: `canEditRole()` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua action mengimport dari satu sumber |
| H3: Action import konsisten | ✅ Fixed | `kegiatan.ts`, `petugas.ts`, `leading-sector.ts` semua pakai `canEditRole()` dari `@/lib/auth` |
| H4: `ActionResult` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua 4 action files mengimport dari satu sumber |
| M1: Error handling page | 🟡 Partial | `dashboard/page.tsx` dan `master-petugas/page.tsx` sudah ditambah try/catch. 2 page lainnya (master-leading-sector, users) belum |
| L1: setTimeout cleanup | ⏳ Belum | `searchable-select.tsx` handleBlur |
| L2: "Lainnya" custom input | ⏳ Belum | `kegiatan-modal.tsx` pejabat select |
