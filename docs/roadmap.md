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
| Activity Log | ✅ Selesai | Model + migration + helper + integrasi semua Server Actions + halaman Activity Log (filter/pagination/detail modal). Normalisasi snapshot via `toJsonValue()` — Date/NaN/undefined handling. `meta.entityName` untuk identitas entity. No-op UPDATE guard. Diff petugas di UPDATE kegiatan. |
| Dashboard Baru | ✅ Selesai | Dashboard lanjutan dengan distribusi status (donut), progress dokumen (bar), top petugas & leading sector (horizontal bar chart), card Perlu Perhatian. Tidak mengubah layout existing. |
| Laporan SPJ (XLSX + Print) | ✅ Selesai | Halaman `/laporan` — date range filter, summary cards, tabel responsif, export XLSX (SheetJS), Cetak via `window.print()` + `@media print`. Akses semua role. |
| Export | ✅ Selesai | Upgrade ke XLSX (SheetJS) dengan auto-width, format tanggal DD/MM/YYYY, freeze header |
| Kolom Lembur | ✅ Selesai | `isLembur Boolean @default(false)` di schema + migration + form checkbox + kolom tabel + filter (Semua/Ya/Tidak) + detail + export |
| Dashboard Flex Range | ✅ Selesai | Grafik 6 bulan (-3, now, +2) dengan `rangeConfig` object, siap custom date range |
| Filter Petugas per Divisi | ✅ Selesai | Enum `KategoriPetugas` + field `kategori` di Petugas, query terpisah Protokol/Liputan |
| Multi Petugas | ✅ Selesai | Junction table `KegiatanPetugas` + multi-select modal + validasi kategori (Sesi 8) |
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

### 28 Juli 2026 — Sesi 8: Refactor Domain Model

| Fitur | Status | Catatan |
|-------|--------|---------|
| Multi Petugas via Junction Table | ✅ Selesai | `KegiatanPetugas` + migration dengan data migration + seed |
| Workflow 4 Status | ✅ Selesai | 7 → 4: `ACARA_MASUK → MENUNGGU_PENUGASAN → KEGIATAN_SELESAI → SPJ_SELESAI` |
| StatusPublikasi | ✅ Selesai | Enum `BELUM_DIRILIS / DIRILIS` |
| JenisPenugasan | ✅ Selesai | Enum `LEMBUR / SPPD` gantikan `isLembur` Boolean |
| Fix Edit Multi Petugas | ✅ Selesai | Modal init dari data existing junction table |
| Validasi Server-Side | ✅ Selesai | Field wajib + leading sector exists check |

### 30 Juli 2026 — Sesi 11: Dashboard Lanjutan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Distribusi Status Workflow | ✅ Selesai | Donut chart (PieChart) — 4 status: ACARA_MASUK, MENUNGGU_PENUGASAN, KEGIATAN_SELESAI, SPJ_SELESAI. Warna berbeda per status. Legend + Tooltip. |
| Progress Dokumen SPJ | ✅ Selesai | Progress bar per kegiatan via `hitungProgressDokumen()`. Scope: tahun berjalan. Kategori: lengkap (100%) vs belum lengkap (< 100%). Label persentase + count. |
| Petugas Paling Aktif | ✅ Selesai | Horizontal BarChart — top 5 petugas berdasarkan jumlah penugasan. Warna dibedakan Protokol (navy) / Liputan (gold). |
| Leading Sector Terbanyak | ✅ Selesai | Horizontal BarChart — top 5 leading sector berdasarkan jumlah kegiatan. Warna solid navy. |
| Perlu Perhatian | ✅ Selesai | Card kondisional — muncul jika ada kegiatan tanpa petugas atau dokumen belum lengkap. List nama kegiatan (max 3). |

**Decisions:**
- Semua chart baru dimasukkan dalam satu file `DashboardStats` (`dashboard-stats.tsx`) untuk maintainability.
- Progress dokumen menggunakan `hitungProgressDokumen()` yang sudah ada — tidak duplikasi logika.
- Scope progress dokumen: semua kegiatan tahun berjalan (`currentYearStart`), bukan range chart existing.
- Donut chart (PieChart innerRadius) untuk distribusi status — lebih ringkas dari stacked bar.
- Horizontal BarChart untuk ranking — lebih mudah dibaca dari vertical untuk data ranking.
- Card "Perlu Perhatian" kondisional — tidak muncul jika semuanya sudah rapi.
- Tidak ada perubahan pada query/layout existing dashboard — hanya tambahan di Row 3 dan Row 4.

**Files:**
- `src/app/(protected)/dashboard/page.tsx` — MODIFIED: tambah 4 query baru, compute server-side, render DashboardStats + Perlu Perhatian
- `src/app/(protected)/dashboard/dashboard-stats.tsx` — NEW: Client component dengan PieChart + ProgressBar + 2× Horizontal BarChart

### 30 Juli 2026 — Sesi 10: Halaman Laporan SPJ (XLSX + Print)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Sidebar Activity Log | ✅ Selesai | Tambah nav item Activity Log khusus ADMIN — icon History, hanya muncul jika role ADMIN |
| Halaman Laporan SPJ | ✅ Selesai | Route `/laporan` — Server Component query dengan date range, client component dengan filter tanggal + summary cards + tabel responsif + export XLSX + Cetak |
| Export XLSX Laporan | ✅ Selesai | Reuse SheetJS (xlsx) yang sudah terinstall — 12 kolom (tanggal s/d status publikasi), auto-width, filename `laporan-spj-{start}-{end}.xlsx` |
| Print Laporan | ✅ Selesai | `window.print()` + `@media print` — sembunyikan nav/header/button saat cetak, font-size 10pt, page-break-inside |

**Decisions:**
- Halaman Laporan adalah view-only (tidak ada CRUD) — fokus pada report, berbeda dari Worksheet.
- Semua role bisa akses Laporan (tidak dibatasi ADMIN).
- Tidak ada dependency baru — SheetJS sudah terinstall.
- Helper `mapPetugasByKategori()` lokal di page.tsx untuk mengurangi duplikasi `.filter().map()`.

**Files:**
- `src/app/(protected)/app-shell.tsx` — MODIFIED: tambah import FileText + nav item `/laporan` untuk semua role, tambah nav item `/activity-log` untuk ADMIN
- `src/app/(protected)/laporan/page.tsx` — NEW: Server Component dengan query Prisma + date range filter + endOfDay
- `src/app/(protected)/laporan/laporan-client.tsx` — NEW: Client Component dengan filter/export/print

### 29 Juli 2026 — Sesi 9: Activity Log — Normalisasi Snapshot & Type Safety

| Fitur | Status | Catatan |
|-------|--------|---------|
| Schema Activity Log | ✅ Selesai | `Entity`/`ActionLog` enum + `ActivityLog` model + migration |
| Helper `logActivity()` + `getEntityName()` | ✅ Selesai | Integrasi via `prisma.$transaction`. `getEntityName()` prioritaskan `meta.entityName`, fallback pola lama. |
| Integrasi ke Actions | ✅ Selesai | CREATE/UPDATE/DELETE kegiatan, dokumen, petugas, leading-sector, users |
| UI Activity Log | ✅ Selesai | Halaman `/activity-log` — filter entity/action/user/search, pagination sliding window, detail modal CREATE/UPDATE/DELETE |
| Normalisasi snapshot (`toJsonValue`) | ✅ Selesai | Recursive converter — Date→ISO string, Number.isFinite guard, undefined→null/omit, prototype guard. Type-safe tanpa cast `as unknown as Prisma.InputJsonValue`. |
| `meta.entityName` | ✅ Selesai | Semua log menyertakan `meta.entityName` untuk identitas entity. Kompatibel dengan log lama. |
| No-op UPDATE guard | ✅ Selesai | UPDATE tanpa perubahan field skip transaction — `updatedAt` tidak berubah tanpa audit log. |
| Diff petugas di UPDATE kegiatan | ✅ Selesai | Existing vs baru via sort+dedup. Log `{id, nama}` per kategori Protokol/Liputan. |

**Decisions:**
- `toJsonValue()` (recursive internal, return `InputJsonValue \| null`) dipisah dari `normalizeSnapshot()` (root, return `InputJsonObject`) untuk type safety tanpa casts di pipeline normalisasi.
- Proto guard via `Object.getPrototypeOf(value)` cegah Map/Set/class instances masuk diam-diam.
- `meta.entityName` ditambahkan di semua log — fallback ke pola lama untuk kompatibilitas.

**Files:**
- `src/lib/activity-log.ts` — MODIFIED: `toJsonValue()` + `normalizeSnapshot()` + `getEntityName(changes)`
- `src/app/actions/kegiatan.ts` — MODIFIED: petugas diff, no-op guard, meta
- `src/app/actions/petugas.ts` — MODIFIED: no-op guard, meta
- `src/app/actions/leading-sector.ts` — MODIFIED: meta
- `src/app/actions/users.ts` — MODIFIED: meta
- `src/app/actions/dokumen.ts` — MODIFIED: hasDiff guard, meta via nama kegiatan
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: `getEntityName(log.changes)`
