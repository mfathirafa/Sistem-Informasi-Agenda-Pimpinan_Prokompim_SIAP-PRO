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
| Detail Worksheet | 🟡 Sebagian | Route `worksheet/[id]` sudah dibuat, tetapi masih **broken** — dua file yang di-import belum ada (`detail-client.tsx` dan `lib/queries/kegiatan.ts`) |

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
