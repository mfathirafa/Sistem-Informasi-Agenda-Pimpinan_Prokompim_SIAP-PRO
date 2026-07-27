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
| Workflow Status Manajemen | ✅ Selesai | State machine di `lib/workflow.ts` + validasi transisi di `updateKegiatan()` |
| Manajemen Dokumen | ✅ Selesai | Edit inline status/link/catatan per dokumen via server action `updateDokumen()` |
| Detail Worksheet | ✅ Selesai | Route `worksheet/[id]` + inline edit dokumen + progress bar |

## Sprint 3

| Fitur | Status | Catatan |
|-------|--------|---------|
| Activity Log | ⏳ Belum | Belum ada implementasi activity log di codebase |
| Dashboard Baru | ⏳ Belum | Dashboard saat ini masih basic. "Dashboard Baru" kemungkinan dashboard lanjutan dengan metrik lebih lengkap |
| Export | ✅ Selesai | Upgrade ke XLSX (SheetJS) dengan auto-width, format tanggal DD/MM/YYYY, freeze header |
| Kolom Lembur | ✅ Selesai | `isLembur Boolean @default(false)` di schema + migration + form checkbox + kolom tabel + filter (Semua/Ya/Tidak) + detail + export |
| Dashboard Flex Range | ✅ Selesai | Grafik 6 bulan (-3, now, +2) dengan `rangeConfig` object, siap custom date range |
| Filter Petugas per Divisi | ✅ Selesai | Enum `KategoriPetugas` + field `kategori` di Petugas, query terpisah Protokol/Liputan |
| Multi Select Petugas | 🟡 Sebagian | Kode type + lookup utility sudah dipersiapkan di `lib/worksheet.ts`. Implementasi multi-select masih menunggu |
| Seed Data | ✅ Selesai | 20 data kegiatan realistis dengan variasi tanggal, pejabat, status, lembur, petugas |

## Fitur yang Ada di Project tapi Belum di Roadmap

| Fitur | Status | Catatan |
|-------|--------|---------|
| Master Petugas | ✅ Selesai | CRUD master petugas dengan status aktif/nonaktif |
| Master Leading Sector | ✅ Selesai | CRUD master leading sector |
| Kelola Pengguna (Users) | ✅ Selesai | CRUD pengguna khusus role ADMIN, dengan proteksi agar tidak bisa hapus akun sendiri |
| Manajemen Session | ✅ Selesai | JWT session dengan expiry 7 hari, cookie httpOnly, middleware redirect |

## Changelog

### 24 Juli 2026 — Sesi 5: UI Improvements & Lembur Field

| Temuan | Status | Catatan |
|--------|--------|---------|
| R1: Konfirmasi Logout | ✅ Selesai | `confirm-dialog.tsx` reusable component + animasi + aksesibilitas (role=dialog, aria-modal, Escape, focus mgmt) + loading state |
| R2: Kolom Lembur | ✅ Selesai | `isLembur Boolean @default(false)` di schema + form checkbox + kolom tabel + detail + CSV + seed. Belum migration |

### 27 Juli 2026 — Sesi 6: Fitur Lengkap + Seed Data

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Konfirmasi Logout | ✅ Selesai | `confirm-dialog.tsx` reusable + native Server Action pattern (`<form action={logoutAction}>`) |
| R2: Kolom Lembur + Filter | ✅ Selesai | `isLembur` migration + filter dropdown (Semua/Ya/Tidak) |
| R3: Export Excel | ✅ Selesai | XLSX (SheetJS) gantikan CSV — auto-width, format tanggal, tanpa bold/freeze (CE limitation) |
| R4: Dashboard Grafik | ✅ Selesai | rangeConfig `{startOffset:-3, monthCount:6}`, label tahun 2-digit |
| R5: Filter Petugas Protokol | ✅ Selesai | Enum `KategoriPetugas` + field `kategori` di model Petugas |
| R6: Filter Petugas Liputan | ✅ Selesai | Query terpisah Protokol/Liputan dari database |
| R7: Persiapan Multi Petugas | ✅ Selesai | Type + lookup utility di `lib/worksheet.ts`, siap array migration |
| R8: Seed Data | ✅ Selesai | 20 data realistis, -90 s/d +60 hari, 7 status kegiatan, variasi lembur & pejabat |

### 27 Juli 2026 — Sesi 7: Workflow + Manajemen Dokumen

| Fitur | Status | Catatan |
|-------|--------|---------|
| Validasi Workflow Status | ✅ Selesai | `lib/workflow.ts` state machine + validasi di `updateKegiatan()` — transisi hanya maju 1 langkah |
| Manajemen Dokumen | ✅ Selesai | `actions/dokumen.ts` + inline edit di `detail-client.tsx` — edit status/link/catatan per dokumen |

**Decisions:**
- Tidak perlu Prisma migration — schema Dokumen sudah lengkap (status, link, catatan)
- Tidak ada file upload / Supabase Storage — hanya metadata + link Google Drive
- Inline edit per dokumen (bukan modal) — konsisten dengan UX aplikasi
- Progress dihitung dari helper `hitungProgressDokumen()` yang sudah ada

**Files:**
- `src/app/actions/dokumen.ts` — NEW: server action `updateDokumen()` dengan validasi URL + enum
- `src/app/(protected)/worksheet/[id]/detail-client.tsx` — MODIFIED: view mode + edit mode per dokumen
- `src/lib/workflow.ts` — NEW (Sesi 7 sebelumnya): state machine `canTransition()` + `validateTransition()`

### 23 Juli 2026 — Sesi 4: Architecture Cleanup

| Temuan | Status | Catatan |
|--------|--------|---------|
| H1: AUTH_SECRET fallback | ✅ Fixed | `lib/auth.ts` + `middleware.ts` sekarang throw error jika AUTH_SECRET tidak ada |
| H2: `canEditRole()` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua action mengimport dari satu sumber |
| H3: Action import konsisten | ✅ Fixed | `kegiatan.ts`, `petugas.ts`, `leading-sector.ts` semua pakai `canEditRole()` dari `@/lib/auth` |
| H4: `ActionResult` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua 4 action files mengimport dari satu sumber |
| M1: Error handling page | ✅ Fixed | Semua 4 page sudah ditambah try/catch: `dashboard`, `master-petugas`, `master-leading-sector`, `users` |
| L1: setTimeout cleanup | ✅ Fixed | `searchable-select.tsx` — tambah `useEffect` cleanup untuk `blurTimeout` saat unmount |
| L2: "Lainnya" custom input | ✅ Fixed | `kegiatan-modal.tsx` — pejabat select sekarang support custom input "Lainnya" dengan validasi + edit mode sync |
