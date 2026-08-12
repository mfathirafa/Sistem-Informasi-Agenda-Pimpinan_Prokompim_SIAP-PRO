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
| Seed Data | ✅ Selesai | 20 data kegiatan realistis dengan variasi tanggal, pejabat, status, lembur, petugas. Sesi 12: tambah 7 dokumen per kegiatan dengan variasi status |
| Kalender Kegiatan | ✅ Selesai | Halaman `/kalender` — grid bulanan (Sen→Min), prev/next via `?bulan=YYYY-MM`, chip nama + warna status di desktop, dot + count di mobile, klik chip ke `/worksheet/[id]`. Server Component murni tanpa library baru. Akses semua role. |

## Fitur yang Ada di Project tapi Belum di Roadmap

| Fitur | Status | Catatan |
|-------|--------|---------|
| Master Petugas | ✅ Selesai | CRUD master petugas dengan status aktif/nonaktif |
| Master Leading Sector | ✅ Selesai | CRUD master leading sector |
| Kelola Pengguna (Users) | ✅ Selesai | CRUD pengguna khusus role ADMIN, dengan proteksi agar tidak bisa hapus akun sendiri |
| Manajemen Session | ✅ Selesai | JWT session dengan expiry 7 hari, cookie httpOnly, middleware redirect |

## Changelog

### 11 Agustus 2026 — QC Batch1: Mobile UX + Export + PDF ✅ SELESAI

> **Status: ✅ Selesai** — Batch1 dari work plan QC (3 batch) selesai 11 Agustus 2026. Fokus: penyempurnaan mobile UX, fix export kolom, dan print PDF. Murni layout/UI — tanpa perubahan schema, database, query, atau behavior CRUD.

| # | Item | Status | Catatan |
|---|------|--------|---------|
| P1 | Worksheet: fix export kolom (localStorage) | ✅ Selesai | Root cause React StrictMode double-mount menimpa localStorage → baca sekali + cache di state. `laporan-client.tsx` |
| P2 | Laporan: card layout mobile | ✅ Selesai | 16 field dalam `<dl>` 2-kolom `md:hidden print:hidden`, `col-span-2` untuk field panjang. `laporan-client.tsx` |
| P3 | Laporan: print PDF global styles | ✅ Selesai | `<style jsx>` → `<style>` global agar `nav/header/button/.no-print` ikut disembunyikan saat `window.print()`. `laporan-client.tsx` |
| P4 | Worksheet: tabel responsif | ✅ Selesai | Tanggal sticky kiri (anchor scroll), 4 kolom inti selalu tampil, 13 kolom sekunder `hidden md:table-cell`, `min-w-[1100px]` di md+. `worksheet-client.tsx` |
| P5 | Worksheet: filter grid mobile | ✅ Selesai | `grid grid-cols-2 sm:flex sm:flex-wrap`, wrapper SearchableSelect `w-full sm:w-48`. `worksheet-client.tsx` |
| P6 | Petugas: sorting Nama/Jabatan | ✅ Selesai | `sortKey`/`sortDir` + `toggleSort`, `localeCompare('id')`, tombol `<th>` + icon panah + `aria-sort`. `master-petugas-client.tsx` |
| P7 | Petugas: kolom No (#) | ✅ Selesai | Nomor urut baris (`index + 1`), `colSpan` empty state 8/7. `master-petugas-client.tsx` |
| P8 | Petugas: responsive mobile | ✅ Selesai | Header tumpuk vertikal, search `w-full sm:w-56`, tabel `overflow-x-auto` + `min-w-[640px]`. `master-petugas-client.tsx` |
| P9 | Leading Sector: order swap | ✅ Selesai | Form Tambah `order-1 lg:order-2` (atas di mobile), tabel `order-2 lg:order-1`. `master-leading-sector-client.tsx` |
| P10-P12 | Kelola Pengguna: responsive | ✅ Selesai | Order swap form/tabel, select filter `w-full sm:w-auto`, tabel `overflow-x-auto` + `min-w-[480px]`. `users-client.tsx` |

**Decisions:**
- Semua item murni UI/layout — tidak menyentuh schema, query, server action, atau behavior CRUD.
- Pola `overflow-x-auto` + `min-w-[Npx]`: tanpa `min-w`, tabel `w-full` tidak pernah overflow → scroll horizontal tidak aktif. `min-w` menentukan ambang scroll di mobile.
- Pola order swap `order-1 lg:order-2` / `order-2 lg:order-1` — menempatkan form di atas di mobile tanpa mengubah layout desktop.
- Sticky anchor kolom butuh `z-10` + `bg` solid (header `bg-app`, body `bg-white hover:bg-slate-50`) + `border-r`.

**Files (5):**
- `src/app/(protected)/laporan/laporan-client.tsx` — P1-P3
- `src/app/(protected)/worksheet/worksheet-client.tsx` — P4-P5
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — P6-P8
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — P9
- `src/app/(protected)/users/users-client.tsx` — P10-P12

**Verifikasi:** dilakukan per item via review kode (OLD→NEW) oleh user + verifikasi Claude. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 11 Agustus 2026 — QC Batch2: Filter Labels + Loading Skeleton + Navbar Mobile ✅ SELESAI

> **Status: ✅ Selesai** — Batch2 dari work plan QC selesai 11 Agustus 2026. Murni UX — tanpa perubahan data/schema/behavior.

| # | Item | Status | Catatan |
|---|------|--------|---------|
| P13 | Worksheet: filter labels | ✅ Selesai | Default tiap dropdown jadi self-describing: "Semua Bulan", "Semua Sambutan", "Semua Status Kegiatan", "Semua Pejabat", "Semua Jenis Tugas", placeholder Sektor "Semua Sektor". `value` tidak berubah. `worksheet-client.tsx` |
| P14 | Loading skeleton global | ✅ Selesai | NEW `(protected)/loading.tsx` — Suspense fallback bawaan App Router; header/nav langsung tampil, konten skeleton pulse saat query Prisma jalan. Berlaku semua halaman protected, tanpa per-halaman. |
| P15 | Navbar mobile | ✅ Selesai | `<nav>` `flex-wrap` → `overflow-x-auto`: 1 baris horizontal scroll di HP, desktop tidak berubah. `app-shell.tsx` |

**Decisions:**
- P13: ganti teks option default, bukan menambah elemen `<label>` — minimal & langsung menyebut nama filter.
- P14: satu `loading.tsx` shared alih-alih per-halaman — cukup & idiomatic App Router.
- P15: horizontal scroll alih-alih hamburger menu — tanpa JS/state baru, header height stabil.

**Files (3):**
- `src/app/(protected)/worksheet/worksheet-client.tsx` — P13
- `src/app/(protected)/loading.tsx` — P14 (NEW)
- `src/app/(protected)/app-shell.tsx` — P15

**Verifikasi:** review OLD→NEW per item. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 11 Agustus 2026 — QC Batch3: Dashboard + Kalender + Sort Worksheet + Activity Log ✅ SELESAI

> **Status: ✅ Selesai** — Batch3 QC selesai 12 Agustus 2026 (item1 Dashboard 11 Agt; Kalender, sort worksheet, activity log 12 Agt). Murni UX/UI — tanpa perubahan data/schema/behavior.

| # | Item | Status | Catatan |
|---|------|--------|---------|
| P16 | Kegiatan Terdekat clickable | ✅ Selesai | Setiap item di "Kegiatan Terdekat" dibungkus `Link href="/worksheet"` — user bisa langsung klik ke halaman Worksheet. `hover:bg-app transition-colors`. `page.tsx` |
| P17 | Hero banner mobile padding | ✅ Selesai | Padding hero `p-6` → `p-5` di mobile (hemat ~16px vertikal). Desktop tetap `sm:p-8`. `page.tsx` |
| P18 | Kalender: nav + today + weekend | ✅ Selesai | Prev/Next jadi icon-only (`ChevronLeft`/`ChevronRight`), nomor tanggal hari ini jadi badge `bg-navy text-white`, akhir pekan diberi tint `bg-slate-50/50`. Murni tampilan — grid & query tidak berubah. `kalender/page.tsx` |
| P19 | Worksheet: sort kolom server-side | ✅ Selesai | 3 kolom sortable (Tanggal/Kegiatan/Status) via URL `?sort=&dir=` — klik header toggle asc↔desc, klik kolom lain reset asc, reset ke halaman1. Tie-break `{tanggal:'asc'}` agar urutan stabil. Export XLSX ikut urutan tabel. Default tanpa param = `[{tanggal:'asc'}]` (perilaku lama). `queries/kegiatan.ts`, `worksheet/page.tsx`, `actions/kegiatan.ts`, `worksheet-client.tsx` |
| P20 | Activity log: konsistensi UI + responsive | ✅ Selesai | Halaman diselaraskan dengan design language app: container/header, filter bar app-style (hapus label, self-describing), tabel card `min-w-[640px]` (scroll horizontal HP), badge aksi `rounded-full`, pagination "Menampilkan X–Y dari Z", modal detail jadi bottom-sheet di mobile (pola 24E). `activity-log-client.tsx` |

**Decisions:**
- P16: Link ke `/worksheet` (bukan `/worksheet/[id]`) karena tidak ada halaman detail terpisah yang sesuai; user bisa filter/navigasi dari situ.
- P17: Perubahan minimal — hanya padding mobile, tidak mengubah struktur hero.
- P18: K1-K3 tanpa mengubah logika grid/query — murni tampilan sel kalender.
- P19: Sort **harus server-side** via URL searchParams (konsisten keputusan Sprint21: filter client + pagination server = kontradiksi). `buildKegiatanOrderBy()` jadi single source untuk tabel + export ("hasil filter tabel == hasil export"). Whitelist sort key — param invalid fallback ke default.
- P20: Modal detail adopsi pola bottom-sheet 24E (`items-end sm:items-center`, `rounded-t-2xl sm:rounded-2xl`). Warna Before/After (red/green) dipertahankan karena semantik diff. `page.tsx` activity-log tidak berubah (struktur server sudah benar).

**Files (7):**
- `src/app/(protected)/dashboard/page.tsx` — P16-P17
- `src/app/(protected)/kalender/page.tsx` — P18
- `src/lib/queries/kegiatan.ts` — P19 (helper `buildKegiatanOrderBy` + tipe sort)
- `src/app/(protected)/worksheet/page.tsx` — P19 (parse sort/dir + orderBy)
- `src/app/actions/kegiatan.ts` — P19 (export ikut sort)
- `src/app/(protected)/worksheet/worksheet-client.tsx` — P19 (`SortableTh` + `setSort`)
- `src/app/(protected)/activity-log/activity-log-client.tsx` — P20

**Verifikasi:** diagnostics IDE bersih ✅ untuk semua file yang diubah (kecuali hint unused import `kMaxLength` & deprecation `baseUrl` tsconfig yang pra-ada/tidak terkait). Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 12 Agustus 2026 — QC Full-Review: Perbaikan Kecil (Batch1) ✅ SELESAI

> **Status: ✅ Selesai** — Putaran pertama feedback QC menyeluruh dari user (dibuka dengan "emang progress udah selesai semua?"). Beberapa item ternyata sudah ada di kode (Petugas #/sort/scroll, label "PIC (LS)" di modal kalender, label filter worksheet, loading skeleton) — sisanya dikerjakan di batch ini. Murni UI/layout + 1 query order — tanpa perubahan schema.

| # | Item | Status | Catatan |
|---|------|--------|---------|
| Q1 | Leading Sector: urutan mobile | ✅ Selesai | Form "Tambah" pindah ke bawah, data di atas di mobile (hapus `order-1`/`order-2` mobile, pertahankan `lg:order-1/2` desktop). `master-leading-sector-client.tsx` |
| Q2 | Kelola Pengguna: urutan mobile | ✅ Selesai | Sama — data dulu, form "Tambah" di bawah. `users-client.tsx` |
| Q3 | Worksheet: default urutan | ✅ Selesai | Tie-break `createdAt: 'desc'` setelah `tanggal` di semua branch `buildKegiatanOrderBy` → default "tanggal pelaksanaan, lalu tanggal pembuatan data". `lib/queries/kegiatan.ts` |
| Q4 | Detail kegiatan: typo + PIC (LS) | ✅ Selesai | "Leading Secto" → "Leading Sector"; tambah baris "PIC (LS)" (nilai `picNama`, sudah di-select di `page.tsx`). `worksheet/[id]/detail-client.tsx` |
| Q5 | Dashboard: hapus card Perlu Perhatian | ✅ Selesai | Card redundan (duplikat "Progress Dokumen SPJ") dihapus; daftar nama kegiatan belum lengkap dipindah ke dalam card progress. `dashboard/page.tsx` + `dashboard-stats.tsx` |
| Q6 | Dashboard: foto gedung KPT | ✅ Selesai | Foto disalin `references/foto kpt/gedung kpt.jpg` → `public/gedung-kpt.jpg`; hero banner (sudah ada di kode) kini menampilkan foto. `public/` |

**Decisions:**
- Q1/Q2: menghapus `order-1`/`order-2` (bukan membalik nilainya) — hapus saja kelas mobile-nya, `lg:order-*` tetap mengatur desktop (form kanan di desktop).
- Q3: `createdAt` adalah kolom yang sudah ada di schema `Kegiatan` — tanpa migration.
- Q5: `perluPerhatianList` tetap dihitung di server dan diteruskan ke `DashboardStats` (bukan dihapus total) supaya informasi kegiatan belum lengkap tidak hilang.

**Files (6):**
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — Q1
- `src/app/(protected)/users/users-client.tsx` — Q2
- `src/lib/queries/kegiatan.ts` — Q3
- `src/app/(protected)/worksheet/[id]/detail-client.tsx` — Q4
- `src/app/(protected)/dashboard/page.tsx` + `src/app/(protected)/dashboard/dashboard-stats.tsx` — Q5
- `public/gedung-kpt.jpg` — Q6 (NEW, salinan foto)

**Verifikasi:** diagnostics IDE bersih ✅ untuk semua file yang diubah. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

**Belum dikerjakan (menunggu batch berikut):** Worksheet form "Tidak Dipilih" (butuh schema nullable + migration), Worksheet filter mobile, Kalender grid mobile `+n`, Reset password semua staff, Activity Log filter, Navbar mobile polish.

### 12 Agustus 2026 — QC Full-Review Batch2: Laporan column picker ✅ SELESAI

> **Status: ✅ Selesai** — Fix bug column picker di halaman Laporan. Sebelumnya `activeColumns` hanya mengontrol export XLSX; tabel layar, kartu mobile, dan print/PDF tetap menampilkan 16 kolom penuh (keluhan user: "tanggal pelaksanaan ga kucentang tapi masih muncul"). Kini kolom yang dicentang mengontrol **semua** tampilan. Murni UI — tanpa perubahan data/query.

| # | Item | Status | Catatan |
|---|------|--------|---------|
| L1 | Column picker → tabel layar | ✅ Selesai | `COLUMNS` diubah jadi `ColumnDef[]` dengan `render()` (JSX, termasuk badge status) + `tdClass`; thead/tbody tabel render dari `activeColumns`. Status badge & truncate dipertahankan identik. `laporan-client.tsx` |
| L1 | Column picker → kartu mobile | ✅ Selesai | Kartu mobile kini render kolom aktif (urutan sesuai pilihan); `namaKegiatan` tetap judul kartu, badge `statusKegiatan` muncul hanya jika dicentang; `col-span-2` untuk field panjang (perihal/nomor surat, petugas). |
| L1 | Column picker → print/PDF | ✅ Selesai | Print memakai tabel yang sama → otomatis menghormati kolom aktif. |
| L2 | Rename label | ✅ Selesai | Tombol "Kolom Export" → "Atur Kolom"; judul panel "Kolom Export (n/16)" → "Kolom Tampilan (n/16)". |
| L3 | PDF landscape | ✅ Selesai | Tambah `@page { size: A4 landscape; margin: 12mm; }` di print styles. |
| L4 | Export XLSX | ✅ Tetap | `exportXlsx()` sudah pakai `activeColumns` (tidak berubah; `get()` string tetap ada untuk XLSX). |

**Decisions:**
- `COLUMNS` tetap satu sumber kebenaran: `get()` (string) untuk XLSX, `render()` (JSX) untuk layar/mobile/print, `tdClass` untuk styling sel — tidak ada duplikasi header/sel hardcoded.
- Kartu mobile: `namaKegiatan` sengaja tetap di-judul-kan meski tidak dicentang (kartu tanpa judul tidak terbaca); `statusKegiatan` badge hanya tampil jika aktif. Perilaku sama dengan tabel di layar lebar.
- **Urutan kolom tetap (follow-up user):** render tabel/kartu/XLSX memakai `COLUMNS.filter((c) => activeColumns.includes(c.key))` — urutan selalu mengikuti `COLUMNS` (urutan worksheet), bukan urutan saat dicentang. `activeColumns` berperilaku sebagai set (order tidak relevan), jadi centang-ulang kolom tidak memindah posisinya. `COLUMN_MAP` dihapus (tak terpakai lagi).

**Files (1):**
- `src/app/(protected)/laporan/laporan-client.tsx` — L1–L3 (COLUMNS refactor, tabel/kartu data-driven, @page landscape, rename label) + follow-up urutan kolom tetap

**Verifikasi:** diagnostics IDE bersih ✅. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 12 Agustus 2026 — QC Full-Review Batch3a: Worksheet filter mobile ✅ SELESAI

> **Status: ✅ Selesai** — Rapikan layout filter worksheet di mobile (grid 2 kolom yang rapi). Murni UI — tanpa perubahan schema/query/logika.

| Perubahan | Detail |
|-----------|--------|
| 6 select filter | Tambah `min-w-0` → tidak overflow di kolom grid sempit (mencegah teks panjang seperti "Semua Status Kegiatan" meluber). **Tanpa `w-full`** — di mobile grid `justify-items: stretch` sudah bikin select lebar penuh; `w-full` justru memaksa 100% lebar di desktop (`sm:flex`) dan merusak layout. `worksheet-client.tsx` |
| Searchable Leading Sector | `col-span-2` → lebar penuh di mobile (sebelumnya hanya setengah kolom), tetap `sm:w-48` di desktop |
| Tombol Excel & Tambah Kegiatan | `col-span-2 justify-center` → lebar penuh & konten di tengah di mobile; di desktop (`sm:flex`) tetap inline natural (col-span diabaikan) |

**Files (1):**
- `src/app/(protected)/worksheet/worksheet-client.tsx` — W3

**Verifikasi:** diagnostics IDE bersih ✅. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

**W2 (form "Tidak Dipilih") — DITUNDA:** butuh 4 field nullable (`pejabat`, `statusSambutan`, `statusPublikasi`, `jenisPenugasan`) + Prisma migration + dampak ke tabel/filter/laporan/export/detail. Menunggu keputusan user — user memilih kerjakan filter mobile dulu.

**A1 (Activity Log filter) — SKIP:** dicek ulang 12 Agustus — filter entity (dropdown) + user (dropdown) + aksi + search sudah ada di `page.tsx` (Sesi 9). Tidak ada gap yang perlu diperbaiki.

### 12 Agustus 2026 — QC Full-Review Batch3b: Kalender mobile + Navbar ✅ SELESAI

> **Status: ✅ Selesai** — Fix overflow indikator mobile di grid kalender + polish navbar. Murni UI — tanpa schema/migration/query.

| Perubahan | Detail |
|-----------|--------|
| **K1 — Kalender grid mobile** | Indikator per sel sebelumnya `flex items-center justify-between` memaksa nomor tanggal + dots + "+N" sejajar horizontal dalam kolom sempit (~51px) → overflow. Dipecah jadi 2 baris bertumpuk: baris tanggal (`flex justify-between` untuk luas penuh), lalu baris dots + "+N" di bawah (`mt-0.5`). Desktop tidak berubah (`sm:hidden`). `kalender/page.tsx` |
| **N1 — Navbar mobile** | Tambah `snap-x snap-mandatory` pada container nav + `snap-start` per link → scroll horizontal berhenti presisi per item (bukan di tengah-tengah), terasa lebih halus di mobile. Desktop tidak terpengaruh (nav muat, tidak scroll). `app-shell.tsx` |

**Files (2):**
- `src/app/(protected)/kalender/page.tsx` — K1
- `src/app/(protected)/app-shell.tsx` — N1

**Verifikasi:** diagnostics IDE bersih ✅. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 12 Agustus 2026 — QC Full-Review U2: Kelola Pengguna — Reset Password Semua Staf ✅ SELESAI

> **Status: ✅ Selesai** — Bulk reset password untuk semua staf (role `STAFF`). Hash bcrypt sekali, `updateMany` satu query, log per-staf di satu transaction. Murni action + UI — tanpa schema/migration.

| Perubahan | Detail |
|-----------|--------|
| **Server Action baru** | `resetAllStaffPassword(password)` di `actions/users.ts` — hash sekali → `updateMany` → `logActivity` per-staf (masker `********`, nilai asli tidak disimpan). Proteksi `ADMIN` (hanya admin). |
| **UI** | Tombol "Reset Password Semua Staf" di filter bar + modal konfirmasi (password baru minimal 6 karakter, peringatan semua staf pakai password sama). Reuse pola modal edit yang sudah ada. |

**Files (2):**
- `src/app/actions/users.ts` — action `resetAllStaffPassword`
- `src/app/(protected)/users/users-client.tsx` — import, state, handler, tombol, modal, success/error toast

**Verifikasi:** diagnostics IDE bersih ✅ (hanya hint `FormEvent` deprecated kode lama + pre-existing). Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 12 Agustus 2026 — Revisi Laporan: selaraskan UI ke design language app ✅ SELESAI

> **Status: ✅ Selesai** — roadmap:217 "Revisi tampilan hasil & data" (Laporan). Murni UI — tanpa perubahan data/query/logika export.

| Item | Perubahan |
|------|-----------|
| Header h1 | `text-2xl font-bold` → `font-display text-xl font-semibold text-navy` |
| Label tanggal filter | `text-gray-500` → `text-muted` |
| Input `type="date"` (2x) | `border rounded px-3 py-1.5` → `px-3 py-2 rounded-lg border border-app` |
| Tombol "Tampilkan" | `bg-blue-600` → `btn-primary` (bg-navy) |
| Tombol Export XLSX / PDF / Kolom | `border rounded hover:bg-gray-100` → `rounded-lg border border-app hover:bg-app`; toggle aktif `bg-app` |
| Panel Column Picker | `border rounded-lg` → `bg-white rounded-2xl border border-app p-4`; "Pilih Semua" `text-navy` |
| Summary cards | `bg-blue-50/gray-50 border-blue-200` → `bg-white rounded-2xl border border-app`, angka `text-navy`, label `text-muted` |
| Container tabel | `overflow-x-auto border rounded-lg` → outer `bg-white rounded-2xl border border-app overflow-hidden` + inner `overflow-x-auto` (pola sama Activity Log) |
| Thead | `bg-gray-50 border-b`, th `text-gray-600` → `bg-app text-muted uppercase tracking-wide`, th `px-4 p-3 font-medium` |
| Baris tabel | `border-b hover:bg-gray-50` → `border-t border-app hover:bg-slate-50`; td `p-2.5` → `px-4 py-3` |
| Empty state | `p-6 text-gray-400` → `px-4 py-10 text-muted` (tabel + mobile) |
| Fix class invalid | mobile dl `text-grey-600` (tidak ada di Tailwind, tidak ke-render) → `text-muted` |

**Tidak diubah:** print header/print styles, logika filter/export/column picker/localStorage, data & query server, badge `badge-sudah`/`badge-belum`. `text-gray-500` pada td sengaja dipertahankan (hex identik `text-muted`).

**Files (1):** `src/app/(protected)/laporan/laporan-client.tsx`

**Verifikasi:** diagnostics IDE bersih ✅. Command belum dijalankan — `npx tsc --noEmit` & `npm run build` menyusul.

### 12 Agustus 2026 — Data Entry: NIP 21 Pegawai Bagian Prokompim ✅ SELESAI

> **Status: ✅ Selesai** — 21/21 NIP terisi dari PDF referensi. Satu kali pakai, hanya data — tanpa perubahan schema/UI/query.

**Apa yang dilakukan:**
- Script `scripts/set-nip.ts` (baru) mengisi `nip` untuk 21 pegawai dari `references/database/Data Pegawai Bagian Prokompim.pdf` (halaman 1).
- Matching nama via `normalizeKey()` (kata pertama nama, case-insensitive) — unik untuk 21 pegawai.
- NIP dinormalisasi dari format PDF yang terpisah-pisah (`YYYYMMDD YYYYMM G NNN`) ke 18 digit tanpa spasi.

**Bug data quality yang ikut diperbaiki:**
- 5 pegawai (SUPENDI, INAYAH, FAJAR, NUR, SHARON) punya spasi di awal/akhir `nama` di DB (sisa input manual Sprint23 carryover) → `normalizeKey` menghasilkan string kosong sehingga tidak ter-match.
- Fix: `normalizeKey()` pakai `.trim()`, dan baris update sekaligus membersihkan `nama: p.nama.trim()` (akar masalah, bukan cuma gejala).

**Hasil run:**
```
⊘ SKIP 16× (NIP sudah sesuai)
✓ UPDATE 5× (Supendi, Inayah, Fajar, Nur, Sharon)
Selesai: 5 diperbarui, 16 dilewati, 0 tidak ditemukan
```

**Files:**
- `scripts/set-nip.ts` — NEW, satu kali pakai
- `scripts/debug-nip.ts` — file diagnosa sementara, **dihapus** setelah selesai

**Verifikasi:** output script ✅ 21/21 cocok tanpa "tidak ditemukan". NIP diverifikasi unik (21 nilai berbeda).

### 5 Agustus 2026 — Sprint24: Revisi UAT Klien — Penyempurnaan UX/UI & Workflow ✅ SELESAI

> **Status: ✅ Selesai** — Sprint24A (Foundation) selesai 5 Agustus 2026. **Sprint24B-1 (Dashboard) selesai; Sprint24B-2 (Leading Sector) selesai; Sprint24C (Worksheet) selesai 6 Agustus 2026** — Nomor Surat (unik per tahun) + Dresscode + filter Tahun/Bulan + SearchableSelect sektor + picNama disembunyikan. **Sprint24D-1 (Activity Log FIELD_LABEL) selesai; Sprint24D-2 (Laporan sync) selesai 6 Agustus 2026; Sprint24E (Kalender) selesai 6 Agustus 2026** — modal detail (bottom sheet/centered, scrollable) + Leading Sector/PIC/No. HP + dokumen gabungan + fix +N. **Sprint24F (Petugas) selesai 7 Agustus 2026** — NIP + search + filter kategori + disable backdrop close + soft warning duplikat + ALL CREW (2 boolean columns). **Sprint24G (Laporan/Export/Kelola Pengguna) selesai 10 Agustus 2026** — ALL CREW sync di Laporan + Export XLSX, Kelola Pengguna simplify form + search + filter peran. **Sprint24H (Laporan polish) selesai 10 Agustus 2026** — rename header → "Laporan Kegiatan", default date range 1 s.d. akhir bulan, fix bug timezone (`toISOString()` → `toDateInput()`). **Sprint24I (Activity Log value formatter) selesai 10 Agustus 2026** — Petugas kategori `PROTOKOL`/`LIPUTAN` tampil "Protokol"/"Liputan" di Activity Log. **Sprint24J (Laporan column picker) selesai 10 Agustus 2026** — toggle kolom export XLSX + persist `localStorage`, default semua aktif (perilaku lama tidak berubah), export hanya kolom aktif.
>
> **Revisi scope 5 Agustus 2026 (per list revisi UAT klien + konfirmasi user):**
> - **Semua rencana rename enum DIBATALKAN** — `ACARA_MASUK`, `KEGIATAN_SELESAI`, `SURAT_TUGAS`, `SURAT_UNDANGAN` tetap. `JenisDokumen` tidak disentuh. Status kegiatan tetap **4 enum**.
> - Hanya perubahan **label tampilan**: "Menunggu Penugasan" → **"On Progress"**, "Kegiatan Selesai" → **"Selesai"** (constants), dan jenis tugas "Kegiatan" → **"Biasa"** (constants). Tanpa migration enum.
> - **`nomorSurat` = opsional, unik jika diisi** (cek app-layer per tahun). Bukan wajib.
> - **`picNama`**: field DB tetap (data aman), **disembunyikan di UI Worksheet** — hanya No. PIC yang tampil.
> - **ALL CREW**: bukan lagi hanya di filter — jadi opsi di **PetugasPicker** (form kegiatan) untuk acara yang semua petugas ikut.

#### Dashboard

| Revisi | Status | Catatan |
|--------|--------|---------|
| Hero banner "Selamat datang, {nama}" | ✅ Selesai | `existsSync(public/gedung-kpt.jpg)` → fallback gradient navy bila foto belum ada |
| Status cards ringkas (4 kartu) | ✅ Selesai | Kegiatan Bulan Ini / Hari Ini / Total Sambutan (breakdown sudah+belum via `sub` ReactNode) / Dokumen Belum Upload |
| Hapus PieChart Distribusi Status | ✅ Selesai | Dihapus dari dashboard-stats.tsx |
| Hapus BarChart Petugas Aktif | ✅ Selesai | Dihapus; **Leading Sector Terbanyak DIPERTAHANKAN** (bermanfaat tracking sektor) |
| Modern redesign layout dashboard | ✅ Selesai | Hero + 4 status cards + DashboardCharts + Kegiatan Terdekat + DashboardStats (Progress Dokumen + Leading Sector) + Perlu Perhatian |

#### Kalender

| Revisi | Status | Catatan |
|--------|--------|---------|
| Popover agenda → bottom sheet / modal scrollable | ✅ Selesai | 24E: modal bottom sheet (mobile) / centered (desktop), `max-h-[85vh]` + `overflow-y-auto`, backdrop click/Escape/X untuk tutup |
| Detail tampil PIC (LS) + No. HP + Leading Sector | ✅ Selesai | 24E: accordion per kegiatan — Leading Sector, PIC (LS), No. HP PIC + Tempat/Pejabat/Surat/Dresscode/Jenis Penugasan/Status Publikasi + "Buka Detail Lengkap" → `/worksheet/[id]` |
| Semua link dokumen digabung jadi 1 label (7 jenis) | ✅ Selesai | 24E: bagian "Dokumen" satu daftar gabungan — tiap jenis label + badge status + link "Buka" (jika ada) |
| Status kegiatan di detail: Acara Masuk / On Progress / Selesai | ✅ Selesai | 24E: badge pakai `STATUS_KEGIATAN_LABEL` + `STATUS_KEGIATAN_BADGE_CLASS` (sama Worksheet/Laporan); enum tetap 4 |
| ~~Rename JenisDokumen SURAT_TUGAS → NASKAH_PERINTAH~~ | ❌ Batal | Revisi scope 5 Agt: JenisDokumen tidak disentuh |
| ~~Rename JenisDokumen SURAT_UNDANGAN → NASKAH_UNDANGAN~~ | ❌ Batal | Revisi scope 5 Agt: JenisDokumen tidak disentuh |
| ~~Rename StatusKegiatan ACARA_MASUK → AGENDA_DITERIMA~~ | ❌ Batal | Revisi scope 5 Agt: hanya label display |
| ~~Rename StatusKegiatan KEGIATAN_SELESAI → DILAKSANAKAN~~ | ❌ Batal | Revisi scope 5 Agt: hanya label display |
| Fix bug: hari dengan >3 kegiatan ketutupan +N | ✅ Selesai | 24E: mobile "+N" jadi tombol `data-open-tanggal` yang bisa ditap; desktop chip 3→2 agar "+N lagi" selalu muat |

#### Worksheet

| Revisi | Status | Catatan |
|--------|--------|---------|
| Filter tahun di tabel | ✅ Selesai | 24C-3/24C-4: `tahun` di `KegiatanFilter` + range query; dropdown "Semua Tahun" + tahun dinamis dari DB (urut turun) |
| Filter bulan dengan nama (Januari s.d. Desember) | ✅ Selesai | 24C-4: 12 bulan statis `BULAN_NAMA`, value `YYYY-MM`, reset `bulan` saat tahun berubah |
| Fix bug search input menyusut saat full layer | ✅ Selesai | 24C-4: `min-w-0` di flex child |
| Rename header: "Penugasan" → "Jenis Tugas", "Tanggal" → "Tanggal Pelaksanaan" | ✅ Selesai | 24C-4 |
| Status kegiatan: "On Progress" / "Selesai" (label) | ✅ Selesai | 24A: constants, enum tetap 4 |
| Jenis tugas: Lembur / SPPD / Biasa | ✅ Selesai | 24A: constants, enum tetap 3 |
| Leading Sector pakai SearchableSelect + opsi "Tidak Dipilih" | ✅ Selesai | Filter ✅ (24C-4); form modal ✅ (24C-5) |
| Tambah field **Nomor Surat** | ✅ Selesai | Schema ✅ (24A) + kolom DB (24C-2 migration); actions+query+validasi unik/tahun+tabel+export ✅ (24C-2/4); form modal + detail ✅ (24C-5) |
| Tambah field **Dresscode** | ✅ Selesai | Schema ✅ (24A) + kolom DB (24C-2 migration); actions+query+tabel+export ✅ (24C-2/4); form modal + detail ✅ (24C-5) |
| Opsi "Tidak Dipilih" di filter | ✅ Selesai | 24C-4: semua filter "Tidak Dipilih" (Tahun = "Semua Tahun"), sektor via SearchableSelect |
| `picNama`: field DB tetap, **disembunyikan di UI** | ✅ Selesai | Tabel + export ✅ (24C-4, hanya No. HP PIC tampil); form modal + detail ✅ (24C-5) |
| Search leading sector di worksheet; hapus filter PIC | ✅ Selesai | 24C-4: kolom search (bukan dropdown); filter PIC dihapus dari UI |

#### Laporan

| Revisi | Status | Catatan |
|--------|--------|---------|
| Sync dengan perubahan Worksheet (kolom, filter) | ✅ Selesai | 24D-2: hapus picNama, tambah Nomor Surat + Dresscode + Jenis Penugasan + Status Publikasi; header/table/export konsisten 16 kolom |
| ALL CREW sync (display + export) | ✅ Selesai | 24G: `crewLabel()` — ALL CREW tampil "Semua crew (PJ: ...)"; non-ALL CREW daftar lengkap |
| Ganti nama "Laporan SPJ" → "Laporan Kegiatan" | ✅ Selesai | 24H: header halaman `<h1>`; navbar sudah "Laporan", print header sudah "LAPORAN KEGIATAN PROTOKOL" |
| Column picker (pilih kolom yang diextract) | ✅ Selesai | 24J: toggle panel "Kolom Export" + persist `localStorage` (`laporan.exportColumns`) — export XLSX hanya kolom aktif, urutan mengikuti tabel. Default semua aktif → perilaku user lama tidak berubah |
| Default date range = 1 s.d. terakhir bulan berjalan | ✅ Selesai | 24H: `endDate` default = akhir bulan (`new Date(y, m+1, 0)`); fix bug timezone — `toISOString().split('T')[0]` (UTC, mundur 1 hari di WIB) → `toDateInput()` (komponen lokal) |
| Rename "Sector" → "Leading Sector" | ✅ Selesai | 24D-2 |
| Revisi tampilan hasil & data | ✅ Selesai | 12 Agt: Laporan diselaraskan ke design language app (navy/app/rounded-2xl/font-display) — header, filter, tombol, summary, tabel, column picker. Murni UI, tanpa ubah data/query/export |

#### Petugas

| Revisi | Status | Catatan |
|--------|--------|---------|
| Disable backdrop close (hanya Batal/X) | ✅ Selesai | 24F (7 Agt): modal hanya tutup via Batal/X/Escape — cegah kehilangan data form |
| Duplicate name → soft warning (bukan block) | ✅ Selesai | 24F (7 Agt): `cekDuplikatPetugas()` → `{ ok: true, warning }`, modal TETAP terbuka supaya warning terbaca (pola sama `cekDuplikat()` kegiatan) |
| Kolom nomor (NIP / Nomor Induk) | ✅ Selesai | 24F (7 Agt): field `nip String?` di `actions/petugas.ts` + kolom tabel + input form |
| Search | ✅ Selesai | 24F (7 Agt): client-side search nama/jabatan/NIP |
| Filter kategori | ✅ Selesai | 24F (7 Agt): client-side dropdown Semua/Protokol/Liputan |
| Opsi "ALL CREW" di PetugasPicker | ✅ Selesai | 24F (7 Agt): **2 boolean di Kegiatan** (`allCrewProtokol`, `allCrewLiputan`). ALL CREW = seluruh kategori ikut bertugas (bukan select-all IDs). Checkbox di form kegiatan; saat ON PetugasPicker jadi pilih PJ/Koordinator (opsional); display worksheet "Semua crew (PJ: ...)" |

#### Leading Sector

| Revisi | Status | Catatan |
|--------|--------|---------|
| Field **kategori** (9 kategori, nullable) | ✅ Selesai | Migration `ADD COLUMN` di Sprint24A ✅; constants `kategori-leading-sector.ts` ✅; create/update action + validasi server ✅. Existing data = NULL → tampil "Belum Dikategorikan" |
| Search | ✅ Selesai | Client-side — search input + `useEffect` reset page. `master-leading-sector-client.tsx` |
| Filter kategori | ✅ Selesai | Client-side — dropdown Semua/9 opsi/"Belum Dikategorikan" (`__BELUM__` sentinel). `master-leading-sector-client.tsx` |
| Pagination | ✅ Selesai | Reuse komponen `Pagination` — PAGE_SIZE 20, reset ke halaman1 saat search/filter berubah. `master-leading-sector-client.tsx` |
| Safe delete | ✅ Selesai | Action layer ✅ (pre-check `count()` → error spesifik); UI: error tampil di bawah grid (`lg:col-span-3`). Implementasi aktual = **blokir hapus + error**, bukan soft nonaktif |

#### Kelola Pengguna

| Revisi | Status | Catatan |
|--------|--------|---------|
| Simplify form (Nama Lengkap + Nama Pengguna + Kata Sandi) | ✅ Selesai | 24G: role pindah ke edit-only, default STAFF |
| Search | ✅ Selesai | 24G: client-side nama/username |
| Filter peran | ✅ Selesai | 24G: client-side dropdown |
| Pagination | ⏭️ Skip | Data <20 user — search + filter sudah cukup |

#### Activity Log

| Revisi | Status | Catatan |
|--------|--------|---------|
| ~~Dampak rename enum (JenisDokumen/StatusKegiatan)~~ | ❌ Batal | Revisi scope 5 Agt membatalkan SEMUA rename enum — label display diperbaiki di Sprint24A; value formatter kategori selesai Sprint24I |
| FIELD_LABEL untuk field baru (nomorSurat, dresscode) | ✅ Selesai | 6 Agustus 2026: `nomorSurat: 'Nomor Surat'`, `dresscode: 'Dresscode'` di `activity-log-client.tsx` |
| FIELD_LABEL kategori petugas / leading sector | ✅ Selesai | Key label `kategori: 'Kategori'` sudah ada (Sprint24B-2). Value formatter Petugas: `formatFieldValue()` branch `key === 'kategori'` → `KATEGORI_PETUGAS_LABEL` — tampilkan "Protokol"/"Liputan" alih-alih "PROTOKOL"/"LIPUTAN" (24I). Leading sector fallback ke nilai teks yang sudah readable. |

**Decisions (dikonfirmasi user, 5 Agustus 2026):**
- **Arah Sprint24 = UAT refinement**, bukan fitur baru besar.
- **Revisi scope 5 Agt: SEMUA rename enum DIBATALKAN** — `ACARA_MASUK`, `KEGIATAN_SELESAI`, `SURAT_TUGAS`, `SURAT_UNDANGAN`, `JenisDokumen` tetap. Hanya label display via shared constants.
- **`nomorSurat` = opsional, unik jika diisi** (cek app-layer per tahun). Bukan wajib, tanpa `@@unique` global.
- **`picNama`**: field DB **tetap**, **disembunyikan di UI** (Worksheet/Laporan/Detail hanya tampil No. PIC). Tidak dihapus, tidak di-rename.
- **"Kolom nomor" petugas = NIP / Nomor Induk** — field `nip String?` baru di model Petugas.
- **"ALL CREW" jadi opsi di PetugasPicker** (form kegiatan) — bukan hanya filter. Untuk acara yang semua petugas ikut. Bukan kategori petugas.
- **Field baru (`nomorSurat`, `dresscode`, `kategori` leading sector, `nip`) semua nullable** — data existing aman tanpa backfill.
- **9 kategori Leading Sector** (Forum Koordinasi Pimpinan Daerah, SKPD, Dinas, Instansi Vertikal, Badan, Rumah Sakit, Perumda, Camat, Lain-lain) — field `kategori String?` nullable, existing = "Belum Dikategorikan".
- **Chart yang dihapus dari Dashboard: Pie Distribusi Status + Bar Petugas Aktif.** **Leading Sector Terbanyak DIPERTAHANKAN** (bermanfaat tracking sektor). Progress Dokumen + DashboardCharts (grafik 6 bulan) tetap.
- **Carryover dari Sprint23** (data, bukan code): perbaiki kategori petugas yang sudah terlanjur `PROTOKOL` via Edit; input 21 pegawai asli Prokompim. **✅ Selesai 10 Agustus 2026** — audit data carryover: 21 pegawai asli Prokompim sudah ada di Master Petugas (18 PROTOKOL, 3 LIPUTAN), kategori sudah benar, dummy data sudah dibersihkan. NIP belum diisi (opsional, menunggu keputusan).

### 5 Agustus 2026 — Sprint24A ✅ Selesai: Foundation & Migration

| Fitur | Status | Catatan |
|-------|--------|---------|
| Migration `sprint24a_add_fields` | ✅ Selesai | 4 kolom nullable: `nip` (Petugas), `kategori` (LeadingSector), `nomorSurat` + `dresscode` (Kegiatan). Tanpa backfill. Kesalahan awal `nip String` (wajib, gagal di 22 baris existing) → diperbaiki jadi `String?` |
| Label "On Progress" / "Selesai" (status kegiatan) | ✅ Selesai | Hanya display constants (`status-kegiatan.ts`), enum tetap 4 |
| Label "Biasa" (jenis tugas) | ✅ Selesai | Hanya display constants (`status-penugasan.ts`), enum tetap 3 |

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run build` — ✓ 14/14 pages ✅
- `npm run dev` — berjalan, UI dicek manual ✅

**Files:**
- `prisma/schema.prisma` — MODIFIED: 4 kolom nullable (`nip String?`, `kategori String?`, `nomorSurat String?`, `dresscode String?`)
- `prisma/migrations/<sprint24a_add_fields>/` — NEW
- `src/lib/constants/status-kegiatan.ts` — MODIFIED: label `MENUNGGU_PENUGASAN` → "On Progress", `KEGIATAN_SELESAI` → "Selesai"
- `src/lib/constants/status-penugasan.ts` — MODIFIED: label `KEGIATAN` → "Biasa"

**Remaining:** Sprint24B-3 (proposal: Petugas & Kelola Pengguna) → 24C (Worksheet) → 24D (Kalender, Laporan, Activity Log polish).

### 5 Agustus 2026 — Sprint24B-1 ✅ Selesai: Dashboard (Revisi UAT)

| Revisi | Status | Catatan |
|--------|--------|---------|
| Hero banner "Selamat datang, {nama}" | ✅ Selesai | `existsSync(public/gedung-kpt.jpg)` → fallback gradient navy bila foto belum ada |
| 4 status cards | ✅ Selesai | Kegiatan Bulan Ini, Kegiatan Hari Ini, Total Sambutan (breakdown sudah/belum), Dokumen Belum Upload. `const stats: Stat[]` annotation wajib utk TS7053 `toneClass[s.tone]` |
| Hapus Pie Distribusi Status + Bar Petugas Aktif | ✅ Selesai | `dashboard-stats.tsx` kini hanya Progress Dokumen + Leading Sector Terbanyak (retained) |
| Bug fix | ✅ Selesai | `tone: 'succes'` → `'success'`; `text-xs` di luar className → masuk className; `'use client'` dipindah dari page.tsx (server) ke dashboard-stats.tsx |

**Files:** `dashboard/page.tsx` (MODIFIED), `dashboard-stats.tsx` (MODIFIED), `dashboard-charts.tsx` (UNCHANGED).
**Verifikasi:** tsc clean + user approve.

### 5 Agustus 2026 — Sprint24B-2 ✅ Selesai: Leading Sector

| Tahap | Status | Catatan |
|-------|--------|---------|
| 1. `kategori-leading-sector.ts` | ✅ Selesai | NEW: 9 opsi `as const` + `KategoriLeadingSectorValue` |
| 2. `actions/leading-sector.ts` | ✅ Selesai | `kategori: string \| null` create/update + normalisasi ""→null + validasi server vs options + no-op guard +kategori + log +kategori (di dalam `after`) + safe delete (pre-check `count()`) + fix spasi pesan error |
| 3. `master-leading-sector-client.tsx` | ✅ Selesai | type `LeadingSectorRow` + kategori; search + filter kategori + pagination (PAGE_SIZE 20) + kolom kategori (chip `bg-app text-navy`, NULL → "-") + select kategori di form Tambah & modal Edit + delete error di bawah grid (`lg:col-span-3`) + optimistic update include kategori |

**Code review (2 review pass) — semua fix diterapkan:**
- 🔴 Critical: `openEdit` salah set `setKategori` (state form Tambah) → harus `setEditKategori` — bug lama akan MENGHAPUS kategori item saat edit disimpan. ✅ fixed
- 🟠 Recommended: `di${usageCount}` kehilangan spasi (dan opening backtick hilang = syntax error). ✅ fixed
- 🟡 Optional: `kategori: 'Kategori'` di FIELD_LABEL activity-log; aria-label search & filter select; type koma→semicolon (skip, valid TS). ✅ fixed (kecuali type style)

**Verifikasi:** `npx tsc --noEmit` PASS + build/app normal. Zero migration (field `kategori` sudah ada sejak Sprint24A).
**Files:** `src/lib/constants/kategori-leading-sector.ts` (NEW), `src/app/actions/leading-sector.ts` (MODIFIED), `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` (MODIFIED), `src/app/(protected)/activity-log/activity-log-client.tsx` (MODIFIED — FIELD_LABEL kategori).

### 7 Agustus 2026 — Sprint24F ✅ Selesai: Petugas (NIP + Search + Filter + ALL CREW)

| Fitur | Status | Catatan |
|-------|--------|---------|
| NIP field di Master Petugas | ✅ Selesai | `nip String?` di `PetugasInput` + kolom tabel + input form |
| Client-side search | ✅ Selesai | Search nama/jabatan/NIP |
| Client-side filter kategori | ✅ Selesai | Dropdown Semua/Protokol/Liputan |
| Disable backdrop close | ✅ Selesai | Modal tutup hanya via Batal/X/Escape |
| Soft warning duplikat nama | ✅ Selesai | `cekDuplikatPetugas()` → modal tetap terbuka, warning visible |
| ALL CREW (2 boolean columns) | ✅ Selesai | `allCrewProtokol` + `allCrewLiputan` di Kegiatan. Checkbox "Semua crew" di form kegiatan. Saat ON → PetugasPicker pilih PJ/Koordinator. Display: "Semua crew (PJ: ...)" |
| Migration `add_all_crew_kegiatan` | ✅ Selesai | ALTER TABLE ADD COLUMN 2 boolean DEFAULT false |
| Activity Log FIELD_LABEL | ✅ Selesai | `allCrewProtokol` + `allCrewLiputan` ditambah ke display |

**Decisions:**
- **2 boolean columns** dipilih di atas alternatif (sentinel ID, text column, select-all IDs). Konsep ALL CREW = seluruh anggota kategori bertugas, terpisah dari daftar petugas.
- **PetugasPicker tidak diubah** — hanya label berubah (ON → "Pilih Penanggung Jawab (opsional)").
- **Backend zero-change** — destructuring + spread pattern otomatis mengalirkan boolean ke DB.
- **Data existing otomatis false** — semua kegiatan existing tidak terpengaruh.

**Verifikasi:** tsc clean ✅ + build pass ✅. Flow tested: tambah tanpa ALL CREW, tambah dengan ALL CREW (Protokol/Liputan/keduanya), edit ON↔OFF, Activity Log CREATE/UPDATE.

**Known limitations:** ✅ Diselesaikan di Sprint24G (Laporan + XLSX Export sync ALL CREW).

**Files (7 code + 1 migration):**
- `prisma/schema.prisma` — MODIFIED: +2 boolean allCrew
- `prisma/migrations/20260807070648_add_all_crew_kegiatan/` — NEW
- `src/app/actions/kegiatan.ts` — MODIFIED: +2 field di KegiatanInput
- `src/lib/worksheet.ts` — MODIFIED: +2 field di KegiatanRow
- `src/lib/queries/kegiatan.ts` — MODIFIED: +2 mapping
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: checkbox + label dinamis
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: allCrewSummary helper + cell
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: FIELD_LABEL x2

### 10 Agustus 2026 — Sprint24G ✅ Selesai: Laporan ALL CREW + Export XLSX + Kelola Pengguna

| Fitur | Status | Catatan |
|-------|--------|---------|
| Laporan: ALL CREW display + export sync | ✅ Selesai | `crewLabel()` lokal — ALL CREW tampil "Semua crew (PJ: ...)"; non-ALL CREW daftar lengkap (laporan = report, tidak dipotong "+N") |
| Worksheet Export XLSX: ALL CREW sync | ✅ Selesai | Kolom Petugas pakai `allCrewSummary()` — export = persis tampilan tabel; format non-ALL CREW: "Nama A, Nama B +N" (menggantikan array mentah) |
| Kelola Pengguna: simplify form | ✅ Selesai | Form Tambah: Nama + Username + Password saja. Role pindah ke edit-only, default STAFF |
| Kelola Pengguna: search | ✅ Selesai | Client-side search nama/username |
| Kelola Pengguna: filter peran | ✅ Selesai | Client-side dropdown Semua/Admin/Staf Protokom/Kepala Bagian |
| Kelola Pengguna: pagination | ⏭️ Skip | Data <20 user — search + filter sudah cukup |

**Decisions:**
- **New user default STAFF** — form create tidak punya opsi role; user baru otomatis STAFF (least privilege), admin ubah via Edit bila perlu.
- **Export worksheet: `allCrewSummary()` untuk semua baris** — konsisten dengan tampilan tabel (Sprint21: "hasil filter tabel == hasil export"). Format non-ALL CREW berubah dari array mentah ke "Nama A, Nama B +N".
- **Laporan pakai `crewLabel()` terpisah** — laporan = report, daftar nama harus lengkap (tidak dipotong "+N" seperti tabel worksheet). ALL CREW tetap "Semua crew (PJ: ...)".

**Verifikasi:** tsc clean ✅ + user confirm web works ✅.

**Files (4 code):**
- `src/app/(protected)/laporan/page.tsx` — MODIFIED: +allCrewProtokol/allCrewLiputan di map data
- `src/app/(protected)/laporan/laporan-client.tsx` — MODIFIED: +crewLabel helper, type KegiatanItem +2 fields, display + export pakai crewLabel
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: export pakai allCrewSummary
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: form simplify, +search +filter peran, -role dari form, filtered.map + empty state

### 10 Agustus 2026 — Sprint24H ✅ Selesai: Laporan Polish (Rename + Default Date Range + Fix Timezone)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Ganti nama header "Laporan SPJ" → "Laporan Kegiatan" | ✅ Selesai | `<h1>` di `laporan-client.tsx`. Navbar sudah "Laporan"; print header sudah "LAPORAN KEGIATAN PROTOKOL" — tidak disentuh |
| Default date range = 1 s.d. akhir bulan berjalan | ✅ Selesai | `laporan/page.tsx`: `endDate` default `now` → `new Date(y, m+1, 0)` (hari terakhir bulan). Awal bulan sudah benar sejak awal |
| Fix bug timezone tanggal input | ✅ Selesai | `toISOString().split('T')[0]` = UTC → di WIB (UTC+7) tanggal lokal mundur 1 hari (default tampil 31/07–30/08). Ganti ke `toDateInput()` (`lib/format.ts`, baca komponen lokal) — helper yang sama dipakai export filename worksheet |

**Decisions:**
- **Nama baru "Laporan Kegiatan"** — dikonfirmasi user. Konten laporan = semua kegiatan, bukan hanya SPJ; konsisten dengan print header.
- **Fix root-cause di `lib/format.ts` `toDateInput()`**, bukan menambah konversi manual — helper sudah ada & dipakai worksheet.
- **`actions/kegiatan.ts:216` (`toISOString()` di diff snapshot) TIDAK diubah** — itu hanya bandingkan string tanggal untuk Activity Log, bukan display; tanggal disimpan UTC tengah malam sehingga round-trip stabil.
- Zero schema, zero migration, display + default behavior saja.

**Verifikasi:** web `/laporan` default `1/08/2026 – 31/08/2026` ✅ + `npx tsc --noEmit` lolos ✅.

**Files (1 code):**
- `src/app/(protected)/laporan/laporan-client.tsx` — MODIFIED: header `Laporan Kegiatan`
- `src/app/(protected)/laporan/page.tsx` — MODIFIED: default endDate akhir bulan + `toDateInput()` import & props

### 10 Agustus 2026 — Sprint24I ✅ Selesai: Activity Log — Petugas Kategori Value Formatter

| Fitur | Status | Catatan |
|-------|--------|---------|
| Petugas kategori tampil "Protokol"/"Liputan" alih-alih "PROTOKOL"/"LIPUTAN" | ✅ Selesai | `formatFieldValue()` di `activity-log-client.tsx`: branch `key === 'kategori'` → lookup `KATEGORI_PETUGAS_LABEL`, fallback ke nilai mentah (leading sector tidak terpengaruh) |

**Decisions:**
- **Branch `key === 'kategori'` aman** — nilai leading sector (`SKPD`, `Dinas`, dll.) tidak ada yang collide dengan `PROTOKOL`/`LIPUTAN`, jadi fallback ke nilai mentah (sudah readable teks Indonesia).
- **Display-layer only** — snapshot tetap simpan enum mentah `PROTOKOL`/`LIPUTAN`. Mapping terjadi saat render → **log lama juga ikut terbaca benar**.
- Zero schema, zero migration, zero action change, zero UI layout change.

**Verifikasi:** `npx tsc --noEmit` lolos ✅.

**Files (1 code):**
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: import `KATEGORI_PETUGAS_LABEL` + branch `formatFieldValue` untuk key `kategori`

### 10 Agustus 2026 — Sprint24J ✅ Selesai: Laporan Column Picker (Export XLSX)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Toggle kolom export XLSX | ✅ Selesai | Tombol "Kolom Export" → panel checkbox. Export hanya kolom yang aktif |
| Persist pilihan di localStorage | ✅ Selesai | Key `laporan.exportColumns` — pilihan tetap saat halaman dibuka kembali |
| Default semua kolom aktif | ✅ Selesai | `useState(ALL_COLUMN_KEYS)` saat render awal → perilaku export user lama tidak berubah |
| Urutan kolom ikut tabel | ✅ Selesai | Registry `COLUMNS[]` (key + label + get) diindex sesuai urutan kolom tabel; filter tidak mengubah urutan |
| Guard minimal 1 kolom | ✅ Selesai | `toggleColumn` blokir uncheck kolom terakhir + `exportXlsx` alert jika 0 kolom aktif |

**Decisions:**
- **Registry tunggal `COLUMNS[]`** — `key` (persist localStorage) + `label` (header XLSX) + `get` (nilai cell). Header & row diturunkan dari registry yang sama → tidak ada drift array paralel.
- **Tanpa hydration mismatch** — state init = semua kolom, baca localStorage di `useEffect` post-mount (bukan lazy init yang beda SSR vs client).
- **Type-safe tanpa `any`** — `JSON.parse` → `unknown` → `Array.isArray` narrow → type guard `k is string` + `k is ColumnKey` (validasi terhadap `COLUMNS`).
- **Display tabel, query, ALL CREW (`crewLabel`), default date range (24H) tidak diubah** — murni lapisan export.
- **Panel inline, bukan floating popover** — tanpa positioning/z-index/Escape complexity.
- Zero schema, zero migration, zero backend change, 1 file diubah.

**Verifikasi:** `npx tsc --noEmit` lolos ✅.

**Files (1 code):**
- `src/app/(protected)/laporan/laporan-client.tsx` — MODIFIED: +`useEffect`/`Settings2` import, +`ColumnKey`/`COLUMNS`/`ALL_COLUMN_KEYS`/`STORAGE_KEY`, +state `activeColumns`/`showColumnPicker` + 2 effects + `toggleColumn`, exportXlsx pakai `active.map(...)`, +tombol & panel "Kolom Export"

### 6 Agustus 2026 — Sprint24C ✅ Selesai: Worksheet (Nomor Surat + Dresscode + Filter Tahun/Bulan + SearchableSelect + picNama disembunyikan)

| Tahap | Status | Catatan |
|-------|--------|---------|
| 24C-1: Shared constants | ✅ Selesai | `status-kegiatan.ts`, `status-penugasan.ts`, `status-publikasi.ts` — label/badge tunggal, sudah ada sejak 24A; dipakai ulang |
| 24C-2: Schema + actions + shared queries | ✅ Selesai | `dresscode String?` di schema (migration `20260806043149_sprint24c_add_dresscode`); `nomorSurat`/`dresscode` di `KegiatanInput` + normalisasi ""→null + validasi unik-per-tahun (`findFirst` tahun sama, `NOT: {id}` saat update); `tahun` di `KegiatanFilter` + `buildKegiatanWhere` (window 3 bulan di-skip bila `tahun`/`bulan` filter aktif) |
| 24C-3: Page/server component | ✅ Selesai | `tahun` dari searchParams; `tahunOptions` = tahun unik dari seluruh data (urut turun); query `select: { tanggal: true }` tanpa window |
| 24C-4: Client component + UX | ✅ Selesai | Filter bar: Tahun ("Semua Tahun" + dinamis), Bulan (12 nama statis, value `YYYY-MM`, reset saat tahun berubah), Status Sambutan, Status Kegiatan, Pejabat, Jenis Tugas, Sektor (SearchableSelect) — semua "Tidak Dipilih"; search `min-w-0`; header "Tanggal Pelaksanaan"/"Jenis Tugas"; kolom +Nomor Surat +Dresscode; kolom PIC → No. HP PIC; export 17 kolom (tanpa picNama, +nomorSurat +dresscode); colSpan 17/16 |
| 24C-5: Form modal + Detail | ✅ Selesai | Form init + input Nomor Surat & Dresscode; Nama PIC input dihilangkan (`picNama` tetap di state, data existing aman); Leading Sector → SearchableSelect; Detail: baris Nomor Surat + Dresscode, baris Nama PIC dihapus |

**Verifikasi:** `npx tsc --noEmit` clean ✅ (setelah migration dresscode), `npm run build` pass ✅.
**Files (6):** `prisma/schema.prisma` (+dresscode), `prisma/migrations/20260806043149_sprint24c_add_dresscode/`, `src/lib/worksheet.ts`, `src/lib/queries/kegiatan.ts`, `src/app/actions/kegiatan.ts`, `src/app/(protected)/worksheet/page.tsx`, `src/app/(protected)/worksheet/worksheet-client.tsx`, `src/app/(protected)/worksheet/kegiatan-modal.tsx`, `src/app/(protected)/worksheet/[id]/page.tsx`, `src/app/(protected)/worksheet/[id]/detail-client.tsx`.

**Worksheet section Sprint24 sekarang SELESAI.** Activity Log FIELD_LABEL nomorSurat/dresscode ✅ (6 Agustus 2026). Next per roadmap: Laporan sync (24D), Kalender detail, Petugas (NIP/search/filter/ALL CREW), Kelola Pengguna.

### 6 Agustus 2026 — Revisi UX: UI Dokumen di Detail Worksheet disederhanakan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Flat list dokumen (tanpa expand) | ✅ Selesai | `detail-client.tsx` diubah: pola view-mode/edit-mode (klik ✏️ → form per dokumen) diganti **semua baris selalu editable**. Tiap baris: dropdown Status + input Link Google Drive + tombol Simpan + tombol "Buka" (muncul jika link tersimpan). Admin isi 7 dokumen sekali halaman tanpa buka-tutup form |
| Catatan disembunyikan tapi dipertahankan | ✅ Selesai | Field catatan tidak dirender di UI, namun `updateDokumen` dikirim `catatan: doc.catatan` (nilai lama) supaya server action tidak menimpa jadi `null` |
| `dirty` guard | ✅ Selesai | Tombol Simpan disabled jika status/link tidak berubah (`status !== doc.status \|\| link !== doc.link`), hindari save kosong |
| Cleanup unused | ✅ Selesai | `Pencil`, `X`, `STATUS_DOKUMEN_BADGE_CLASS` dihapus dari import (tidak dipakai lagi) |
| Kalender modal scroll-lock | ✅ Selesai | `kalender-client.tsx`: lock `document.documentElement` + `document.body` (sebelumnya hanya body — di desktop viewport scroll ada di `<html>`) |

**Files (2):** `src/app/(protected)/worksheet/[id]/detail-client.tsx`, `src/app/(protected)/kalender/kalender-client.tsx`.

### 7 Agustus 2026 — Revisi UI Dokumen di Detail Worksheet (v2: 1 link folder untuk semua dokumen)

Menggantikan desain flat-list 6 Agustus (tiap baris punya input link + tombol Simpan sendiri).

| Fitur | Status | Catatan |
|-------|--------|---------|
| Satu card Dokumen ringkas | ✅ Selesai | 1 input **Link Google Drive (Folder)** + daftar 7 jenis dokumen (label + dropdown status, divider tipis `divide-y`) + **1 tombol Simpan** di kanan-bawah |
| 1 link folder → semua dokumen | ✅ Selesai | Link Google Drive yang sama dikirim ke seluruh 7 record dokumen (folder memang format upload SIMAKP). Hanya status yang berbeda per jenis — admin copy-paste cukup 1 kali |
| Server action bulk `saveDokumenKegiatan()` | ✅ Selesai | `actions/dokumen.ts`: payload array `{ jenis, status }[]`, validasi enum jenis+status, validasi URL, satu `$transaction`, Activity Log per dokumen (`Dokumen ${jenis} - ${namaKegiatan}`), `revalidatePath` sekali. `updateDokumen()` **TIDAK diubah** (dipakai flow lain) |
| State frontend | ✅ Selesai | `initialFolderLink` disimpan sekali (const) untuk init + dirty; `Map<jenis, status>` (cocok per jenis, bukan urutan array); submit konversi Map → array payload |
| `dirty` guard | ✅ Selesai | Tombol Simpan disabled jika link/status tidak berubah (bandingkan per jenis via Map) |
| Catatan tetap dipertahankan | ✅ Selesai | Tidak dirender & tidak dikirim — `saveDokumenKegiatan` tidak menyentuh kolom `catatan`, nilai DB aman |
| Zero schema change | ✅ Selesai | Tetap 7 record dokumen per kegiatan (`@@unique([kegiatanId, jenis])`), tidak ada migration |

**Files (2):** `src/app/actions/dokumen.ts` (+`saveDokumenKegiatan` payload array), `src/app/(protected)/worksheet/[id]/detail-client.tsx` (card baru, hapus `DokumenRow` + import tak terpakai).

**Verifikasi:** `npx tsc --noEmit` ✅ · `npm run build` ✓ 14/14 ✅ (DYNAMIC_SERVER_USAGE pre-existing)

### 4 Agustus 2026 — Sprint23 ✅ Selesai: Kategori Petugas jadi field wajib (fix bug default PROTOKOL)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Kategori wajib di Tambah/Edit Petugas | ✅ Selesai | Field `kategori` (enum `KategoriPetugas`: PROTOKOL/LIPUTAN) yang ADA di schema tapi tidak diekspos form/action → semua petugas baru diam-diam `@default(PROTOKOL)`. Kini jadi field wajib + validasi server. Kolom Kategori + chip di tabel. **Zero schema change, zero migration.** |
| Shared constants `kategori-petugas.ts` | ✅ Selesai | `KATEGORI_PETUGAS_OPTIONS` + `KATEGORI_PETUGAS_LABEL` — single source of truth, pola sama `status-kegiatan.ts`. Client tidak bikin label lokal |

**Decisions:**
- **Opsi B dipilih user** — expose field existing, bukan expand enum. `kategori` tetap 2 nilai (PROTOKOL/LIPUTAN), mapping 1:1 ke pool `petugasProtokolIds`/`petugasLiputanIds` di Worksheet. Expand ke TU/AJUDAN/KABAG ditolak — nilai tambahan jadi dead value tanpa consumer.
- **Semua pegawai masuk Master Petugas** — `jabatan` free text menyimpan jabatan resmi sesuai data kepegawaian (Kabag, Ajudan, Staff TU, dll); `kategori` menentukan muncul di dropdown Protokol atau Liputan.
- **Jabatan placeholder netral** — "Masukkan jabatan sesuai data kepegawaian" (bukan "cth. Staf Protokol").
- **Data dummy dibersihkan** — `scripts/clear-dummy-data.ts` (`npm run db:clear`): 6 tabel dikosongkan, **tabel `users` TIDAK disentuh** (5 akun tersisa).

**Files:**
- `src/lib/constants/kategori-petugas.ts` — NEW: shared constants
- `src/app/actions/petugas.ts` — MODIFIED: `kategori` di `PetugasInput` + validasi di create/update
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — MODIFIED: import type + kategori di PetugasRow/emptyForm/openEdit + kolom Kategori + chip + select kategori di form modal + placeholder jabatan
- `scripts/clear-dummy-data.ts` — NEW (sebelumnya): hapus dummy data, users tetap

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run build` — ✓ 14/14 pages ✅ (DYNAMIC_SERVER_USAGE pre-existing)

**Remaining:**
- ✅ Selesai 10 Agustus 2026 — kategori petugas sudah benar (audit: 21 pegawai asli, 18 PROTOKOL / 3 LIPUTAN)
- ✅ Selesai 10 Agustus 2026 — 21 pegawai asli Prokompim sudah ada di Master Petugas (NIP belum diisi — opsional)

### 4 Agustus 2026 — Sprint22: Pre-Rilis UX — Navbar Wrap + Popover Agenda Kalender

| Fitur | Status | Catatan |
|-------|--------|---------|
| Navbar tanpa scroll horizontal | ✅ Selesai | `overflow-x-auto` → `flex-wrap` + `gap-y` (nav membungkus ke baris 2 bila penuh, zero JS). Label dipendekkan: "Worksheet Kegiatan"→"Worksheet", "Master Petugas"→"Petugas", "Master Leading Sector"→"Leading Sector". Struktur/arsitektur navbar tidak berubah |
| Kalender: popover agenda per hari (gaya Google Calendar) | ✅ Selesai | Klik angka tanggal (hari ada kegiatan) atau "+N lagi" → popover floating dekat sel menampilkan SEMUA agenda hari itu (urut waktu lalu nama, badge status), tiap agenda `<Link>` ke `/worksheet/[id]`. Tutup: klik luar/Escape/klik tanggal lain (pindah hari). Mobile: tap tanggal membuka agenda. Posisi popover di-clamp agar tidak keluar viewport |

**Decisions:**
- **Revisi keputusan kalender** ("Server Component murni" → "server-fetch + client interaktivitas popover", tetap tanpa library). Popover butuh state + event + posisi layar → mustahil tanpa client component. `page.tsx` tetap server (query + parseBulan + render grid + error UI); `kalender-client.tsx` HANYA interaktivitas popover via event delegation pada trigger `data-open-tanggal`.
- **Chip 1–3 tidak diubah** — tetap shortcut langsung ke Detail Worksheet. Popover hanya untuk melihat agenda lengkap hari (+ jalur mobile).
- **`flex-wrap` dipilih atas hamburger/sidebar** — tidak mengubah arsitektur, semua item selalu terlihat, zero JS. Harga: +1 baris tinggi hanya saat overflow.
- **Branding** tetap **SIAP-PRO** (hyphen) + domain `siappro`; pembersihan nama lama (SIMAKP) di dokumentasi ditunda.

**Files (2 code + 1 new + 2 docs):**
- `src/app/(protected)/app-shell.tsx` — MODIFIED: label navbar pendek + `flex-wrap`
- `src/app/(protected)/kalender/page.tsx` — MODIFIED: angka tanggal & "+N lagi" jadi trigger `data-open-tanggal`, grid dibungkus `KalenderClient`
- `src/app/(protected)/kalender/kalender-client.tsx` — NEW: popover agenda per hari (delegasi klik, clamp posisi, tutup luar/Escape, sortir waktu)
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages ✅ (DYNAMIC_SERVER_USAGE pre-existing)

### 4 Agustus 2026 — Sprint21: Server-Side Pagination + Filter Worksheet

| Fitur | Status | Catatan |
|-------|--------|---------|
| Server-side pagination Worksheet | ✅ Selesai | Tabel kegiatan hanya memuat 20 baris/halaman (`PAGE_SIZE = 20`, konsisten Activity Log) via Prisma `skip`/`take` + `count`. Pindah halaman → query halaman berikutnya ke server. Reuse komponen `Pagination` + bar info "Menampilkan X–Y dari Z kegiatan" |
| Filter + search sinkron URL (searchParams) | ✅ Selesai | Semua 8 filter pindah dari client state → URL `searchParams`. Ubah filter → reset ke halaman 1; pindah halaman → filter tetap; refresh browser → state tetap. Search text input pakai pola `defaultValue` + Enter/Blur (sama dengan Activity Log) |
| Export mengikuti filter aktif | ✅ Selesai | Export XLSX memanggil server action `getKegiatanExport(filters)` — ambil SEMUA baris hasil filter (bukan hanya halaman aktif). Client hanya memegang 1 halaman |
| Sinkronisasi CRUD via `router.refresh()` | ✅ Selesai | Optimistic update `setItems()` dihapus (client tak lagi pegang seluruh dataset) → setelah create/update/delete, `router.refresh()` menarik ulang data + total dari server. Halaman out-of-range di-clamp ke `safePage` |

**Decisions:**
- **Filter harus ikut pindah ke server** — kontradiksi inheren jika filter tetap client: client hanya punya 20 baris/halaman, search akan "berjalan" hanya di halaman aktif (fungsional salah). Opsi 2 dipilih user: server-side pagination + server-side filter, agar pagination/search/filter selalu sinkron.
- **`buildKegiatanWhere()` + `mapKegiatanToRow()` + `kegiatanInclude` di `lib/queries/kegiatan.ts`** — dipakai 3 tempat nyata (page findMany, page count, export action), bukan abstraksi sekali pakai. Satu sumber kebenaran: hasil filter tabel == hasil export. `buildKegiatanWhere` menggabungkan window 3 bulan + filter bulan (`YYYY-MM`) jadi rentang tanggal tunggal.
- **Search pakai `contains` + `mode: 'insensitive'`** (Postgres ILIKE) menggantikan `.toLowerCase().includes()` client — perilaku case-insensitive substring identik.
- **`router.replace()` + `params.delete('page')`** — filter berubah → URL bersih tanpa `page`, browser history tidak penuh oleh debounce navigasi.
- **Bulan options dihitung server-side** dari seluruh data window (query `select: { tanggal: true }`), bukan dari halaman aktif — dropdown bulan tetap lengkap.
- **`safePage = Math.min(page, totalPages)`** — hapus/delete item terakhir di halaman terakhir → halaman di-clamp, tidak ada tampilan kosong.
- **Halaman out-of-range tidak redirect** — clamp saja (pola sama PetugasPicker). URL `page=3` tetap di URL sampai interaksi berikutnya mengoreksi; UI selalu menampilkan halaman valid.
- Zero schema change, zero KegiatanModal/PetugasPicker/Detail/Dashboard change.

**Files (4 code + 2 docs):**
- `src/lib/queries/kegiatan.ts` — MODIFIED: + `kegiatanInclude`, `buildKegiatanWhere()`, `mapKegiatanToRow()`, `type KegiatanFilter`
- `src/app/actions/kegiatan.ts` — MODIFIED: + `getKegiatanExport(filters)` server action
- `src/app/(protected)/worksheet/page.tsx` — MODIFIED: read searchParams, `findMany(skip,take) + count`, bulanOptions server-side, clamp safePage
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: filter via `useSearchParams` + `router.replace`, hapus `filtered` useMemo + `items` state + optimistic update, + `<Pagination>` + info bar, export via server action, table dim `opacity-50` saat isPending
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages ✅ (DYNAMIC_SERVER_USAGE pre-existing)

### 3 Agustus 2026 — Sprint20: PetugasPicker (Multi-Select Upgrade)

| Fitur | Status | Catatan |
|-------|--------|---------|
| PetugasPicker reusable | ✅ Selesai | Komponen field ringkas + picker modal untuk pemilihan petugas. Gantikan checkbox inline groups. Field: chip max 2 + "+N", seluruh area klik. Picker: search nama + jabatan (highlight Tailwind), list 10/halaman dengan pagination (sticky di bawah list), counter live, footer sticky tanpa tombol Batal (state langsung commit). Reusable tanpa dependency baru |
| Tabel petugas ringkas | ✅ Selesai | Format "Nama A, Nama B +N" di sel tabel worksheet (sebelumnya raw `string[]` tanpa separator) |

**Decisions:**
- **Direct commit, bukan working copy** — perubahan selection langsung update `form.petugasXxxIds` via `onChange`. Tombol "Selesai" hanya menutup picker (bukan commit). Esc/backdrop = tutup = sama saja. Lebih sederhana, menghilangkan mental model "belum tersimpan".
- **Single scroll, bukan nested** — field di form = satu baris (truncate + `+N`); list di modal = scroll `max-h-[40vh]` + pagination 10/halaman. Tidak ada field yang scroll.
- **Pagination di picker** — reuse komponen `Pagination` (konsisten halaman lain). `PAGE_SIZE = 10`. Urutan di bawah list: bar info "Menampilkan X–Y dari Z petugas" (tanpa "Halaman A dari B" — kontrol pagination sudah menunjukkan halaman aktif, info tak redundan), lalu kontrol halaman, baru footer counter + "Selesai" (hasil review UX user: baca daftar → langsung temukan navigasi → aksi penutup paling bawah). Bar otomatis disembunyikan jika hasil hanya 1 halaman. Ganti keyword search → reset ke halaman 1; centang/hapus petugas → halaman tetap. Label "hasil" saat sedang search, "petugas" saat tidak. Selection dipertahankan lintas halaman (`selected` state global, terpisah dari `page`). Pindah halaman → list `scrollTo(0,0)` + fokus kembali ke kolom search (keyword tetap bertahan).
- **Highlight Tailwind, bukan `<mark>`** — `<span className="bg-yellow-200 rounded-sm">` konsisten cross-browser.
- **Tanpa Batal, tanpa "Pilih Semua", tanpa "Tampilkan Terpilih"** — sesederhana mungkin. Alur: buka → cari → centang → selesai. Fitur yang tidak terpakai tidak dibuat.
- **Chip `max-w-[140px]` + truncate** — nama panjang tetap terbaca semaksimal mungkin, bukan dipotong 1 kata.
- **Escape capture-phase** — picker mencegah propagasi Escape ke parent modal (kegiatan-modal) supaya hanya picker yang tertutup.
- **+N di tabel worksheet** — fix bug display sebelumnya (React render `string[]` tanpa separator → "AndiBudi" menjadi "Andi, Budi +1").
- **`type="button"` di Pagination + header close** — Final review menemukan tombol-tanpa-type di Pagination dan header × picker berada di dalam DOM `<form>` kegiatan-modal → default `submit` akan submit form saat user hanya ingin navigasi halaman. Fix: `type="button"` di shared Pagination (root cause, berlaku untuk semua caller masa depan) + picker header close. Chip remove sudah punya `type="button"`, ditambahkan `disabled={disabled}` saat saving agar konsisten.
- Zero schema/action/business logic change. Data flow tetap `string[]`.

**Files (3 code + 2 docs):**
- `src/components/petugas-picker.tsx` — NEW: komponen reusable
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: fieldset checkbox → 2× PetugasPicker
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: `petugasSummary()` helper, format sel tabel
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages ✅

### 3 Agustus 2026 — Sprint19B: Accessibility + UX Hardening

| Fitur | Status | Catatan |
|-------|--------|---------|
| A: Modal Accessibility | ✅ Selesai | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + Escape key di 5 modal: kegiatan, master-petugas, master-leading-sector, users, activity-log DetailModal. Escape di-block saat `saving`/`isPending` agar form tidak tertutup di tengah submit |
| A: aria-label lengkap | ✅ Selesai | Close button DetailModal (`&times;`) + tombol edit dokumen di `detail-client.tsx` (`title` → `aria-label`) |
| B: Reusable Pagination | ✅ Selesai | Ekstrak dari `activity-log-client.tsx` ke `src/components/pagination.tsx` — API `{ page, totalPages, onPageChange }`, presentational murni, tambah `aria-label` + `aria-current` + wrapper `<nav>`. Behaviour Activity Log tidak berubah |
| C: Multi Select Petugas | ✅ Selesai | `<select multiple size={3}>` → checkbox groups (`<fieldset>`/`<legend>` + `<input type="checkbox">`) untuk Protokol & Liputan di kegiatan modal. Data flow tetap `string[]` — zero schema/action change |

**Decisions:**
- **Accessibility tanpa abstraction** — tambahkan atribut aksesibilitas inline di 5 modal (bukan reusable wrapper). Hanya 5 modal dengan konten berbeda; ConfirmDialog sudah jadi referensi pola sejak Sprint18.
- **Escape key di-block saat loading** — `!saving`/`!isPending` agar user tidak kehilangan data form saat server action sedang berjalan (konsisten dengan ConfirmDialog yang block saat `loading`).
- **Pagination presentational murni** — routing/searchParams handling tetap di parent. Komponen siap dipakai di worksheet jika data > 50 rows.
- **Checkbox groups bukan searchable-select** — dataset kecil (~5-10 per kategori), checkbox langsung terlihat semua tanpa perlu komponen baru. ~~Upgrade ke searchable multi-select jika > 15 petugas per kategori.~~ **Sudah di-upgrade di Sprint20** → `PetugasPicker` reusable (field ringkas + picker modal + search + highlight).
- Zero schema change, zero server action change, zero business logic change, zero visual redesign — murni UX/accessibility/reusability.

**Files (7 code + 2 docs):**
- `src/components/pagination.tsx` — NEW: reusable pagination (Item B)
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: Escape + dialog attrs + checkbox groups (Item A + C)
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: DetailModal attrs + Escape + hapus Pagination lokal + pakai shared (Item A + B)
- `src/app/(protected)/worksheet/[id]/detail-client.tsx` — MODIFIED: `title` → `aria-label` (Item A)
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages, semua `ƒ` Dynamic (sama seperti sprint sebelumnya; `DYNAMIC_SERVER_USAGE` adalah warning pre-existing untuk route cookies/searchParams, bukan error build)

### 3 Agustus 2026 — Sprint19A (Release Blocker): Hapus demo password + Fix Activity Log Leading Sector (display-layer)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Hapus demo password di Login | ✅ Selesai | Hapus 3 baris `Akun percobaan — Admin: admin/admin123 ...` dari `login/page.tsx` — password nyata tidak lagi terekspos |
| Fix Activity Log Leading Sector (display-layer only) | ✅ Selesai | `formatFieldValue()` generic di `activity-log-client.tsx`: resolve `leadingSectorId` (string polos log lama → lookup nama via `sectorMap`; objek `{id,nama}` → `.nama`), objek/array `{id,nama}` (petugas) → nama. Backward compatible log lama & baru |
| Filter metadata keys | ✅ Selesai | `id`/`createdAt`/`updatedAt` (raw prisma object di snapshot DELETE) tidak lagi tampil di modal |
| Regression test Activity Log | ✅ Selesai | Audit semua action: HANYA `leadingSectorId` yang simpan raw CUID; petugas sudah `[{id,nama}]`; DOKUMEN/PETUGAS/LEADING_SECTOR/USER bersih. Snapshot format TIDAK diubah |

**Decisions:**
- **Fix di display-layer saja, snapshot TIDAK diubah** — sesuai prinsip "jangan ubah format data jika display-layer cukup". Semua bug #8 (log CREATE lama) & #9 (log UPDATE/DELETE) teratasi: `leadingSectorId` string → lookup live table; `[{id,nama}]` → render nama. Risiko regression minimal menjelang rilis, zero schema/arsitektur change.
- **Formatter generic, bukan hardcode** — pola objek/array dengan `nama` ditangani generik, `leadingSectorId` satu-satunya key yang butuh map lookup (string polos tak bisa diidentifikasi tipe tanpa key).
- Trade-off: log lama yang mereferensikan leading sector yang SUDAH DIHAPUS fallback ke raw CUID (nama tak recoverable). Kasus jarang — schema pakai `Restrict` untuk delete sektor yang masih dipakai.

**Files:**
- `src/app/login/page.tsx` — MODIFIED: hapus div demo password
- `src/app/(protected)/activity-log/page.tsx` — MODIFIED: + query `leadingSector.findMany`, pass `leadingSectors` prop
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: `formatFieldValue()` + `sectorMap` (useMemo) + `META_KEYS` filter, hapus `displayValue`

**Verifikasi:**
- `npx tsc --noEmit` — clean
- `npm run lint` — "No ESLint warnings or errors"
- `npm run build` — ✓ 14/14 pages (route `/activity-log` & `/login` render `ƒ` Dynamic seperti sebelumnya)

### 3 Agustus 2026 — Sprint18 (R8): Polish & Hardening (tech debt cleanup)

| Fitur | Status | Catatan |
|-------|--------|---------|
| A: ConfirmDialog untuk semua delete | ✅ Selesai | Gantikan `window.confirm` native dengan `ConfirmDialog` reusable di 4 client: worksheet, master-petugas, master-leading-sector, users. Pola `confirmDelete`/`deleteError`/`confirmDeleteAction` konsisten |
| B: Konsolidasi warna/label status | ✅ Selesai | `STATUS_KEGIATAN_CHART_COLOR` + `STATUS_KEGIATAN_CELL_CLASS` masuk ke `constants/status-kegiatan.ts` — hapus duplikat lokal di dashboard-stats & laporan-client |
| C: Konsolidasi helper tanggal | ✅ Selesai | `lib/format.ts` baru (`padDate`, `toDateInput`, `formatTanggal`) — hapus duplikat `pad`/`formatTanggal`/`toDateInput` lokal di laporan-client, kegiatan-modal, worksheet-client. Key `YYYY-MM` pakai native `String().padStart(2,'0')` |

**Decisions:**
- **Gunakan ConfirmDialog yang sudah ada** daripada `window.confirm` — konsisten, aksesibel (Escape, focus mgmt), loading state. Zero UI baru.
- **Status color/class single-source** — chart hex & tailwind cell class dipindah ke constants, diindex oleh enum value (type-safe).
- **Date helper single-source** — `lib/format.ts`. `padDate` untuk angka, `toDateInput` untuk input date `YYYY-MM-DD`, `formatTanggal` untuk `DD/MM/YYYY`. Key bulan chart/URL (`YYYY-MM`) bukan tanggung jawab helper ini → native `padStart`.
- Tidak ada perubahan visual, tidak ada perubahan schema, tidak ada migration.

**Files:**
- `src/lib/format.ts` — NEW: helper tanggal shared
- `src/lib/constants/status-kegiatan.ts` — MODIFIED: + `STATUS_KEGIATAN_CHART_COLOR`, `STATUS_KEGIATAN_CELL_CLASS`
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: ConfirmDialog delete + hapus `pad` lokal
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: pakai `toDateInput` dari `lib/format`
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/dashboard/dashboard-stats.tsx` — MODIFIED: warna status dari constants
- `src/app/(protected)/dashboard/page.tsx` — MODIFIED: key bulan pakai `padStart`
- `src/app/(protected)/kalender/page.tsx` — MODIFIED: `fmtBulan` pakai `padStart`
- `src/app/(protected)/laporan/laporan-client.tsx` — MODIFIED: `formatTanggal` + cell class dari shared

**Verifikasi:**
- `npx tsc --noEmit` — hasil di bawah
- `npm run lint` — hasil di bawah
- `npm run build` — hasil di bawah

### 3 Agustus 2026 — Sprint17 (R7): Perihal Surat + PIC + Activity Log STAFF

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Perihal Surat | ✅ Selesai | Field `perihalSurat String?` di Kegiatan + soft duplicate warning (data tetap disimpan) |
| R2: PIC | ✅ Selesai | Field `picNama String?` + `picNoHp String?` langsung di Kegiatan (bukan master table) |
| R3: Activity Log untuk STAFF | ✅ Selesai | STAFF dapat membuka halaman Activity Log read-only (guard page + sidebar nav) |
| R4: Presence notification | ⏸️ Ditunda | Tidak diimplementasikan (edit-session/locking di luar scope Sprint17) |

**Decisions:**
- **Duplikat = soft warning, bukan block & bukan UNIQUE constraint.** Deteksi saat create/update: kombinasi `tanggal + tempat + pejabat + perihalSurat` sama persis → data TETAP disimpan, return `{ ok: true, warning: '...' }` ke UI. `ActionResult` di `lib/auth.ts` ditambah `warning?: string` (opsional, tidak merusak caller existing).
- **PIC sebagai field langsung di Kegiatan** (`picNama`, `picNoHp`) — bukan master table. Konsisten dengan keputusan user. Tidak ada FK.
- **`cekDuplikat()` helper** di `actions/kegiatan.ts` — `findFirst` dengan date range (start-of-day s/d end-of-day) + exclude self saat update. Lewati pengecekan jika `perihalSurat` kosong.
- **Semua field nullable** → data lama aman tanpa backfill. Validasi wajib/opsional ditangani di form/server action.
- **R3 minimal diff:** hanya guard `activity-log/page.tsx` + nav `app-shell.tsx`. Halaman Activity Log sudah read-only dari awal (tanpa tombol delete/edit) → STAFF tidak butuh perubahan UI.
- **Pencarian worksheet** ikut mencakup `perihalSurat` (search tambahan kecil, konsisten).

**Files (11 code):**
- `prisma/schema.prisma` — MODIFIED: `perihalSurat`, `picNama`, `picNoHp` di model Kegiatan
- `prisma/migrations/20260803120849_add_perihal_surat_and_pic/migration.sql` — NEW
- `src/lib/auth.ts` — MODIFIED: `ActionResult` + `warning?: string`
- `src/app/actions/kegiatan.ts` — MODIFIED: KegiatanInput + `cekDuplikat()` + warning di create/update
- `src/lib/worksheet.ts` — MODIFIED: KegiatanRow + 3 field baru
- `src/app/(protected)/worksheet/page.tsx` — MODIFIED: map data baru
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: input Perihal Surat + Nama PIC + No. HP PIC
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: 3 kolom tabel + 3 kolom export + search perihal + optimisic update + alert warning
- `src/app/(protected)/worksheet/[id]/page.tsx` + `detail-client.tsx` — MODIFIED: pass & tampilkan Perihal/PIC
- `src/app/(protected)/laporan/page.tsx` + `laporan-client.tsx` — MODIFIED: map data + kolom tabel + export
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: FIELD_LABEL perihalSurat/picNama/picNoHp
- `src/app/(protected)/activity-log/page.tsx` — MODIFIED: guard `ADMIN || STAFF`
- `src/app/(protected)/app-shell.tsx` — MODIFIED: nav Activity Log untuk ADMIN + STAFF
- `prisma/seed.ts` — MODIFIED: perihalSurat + PIC di 4 kegiatan

**Verifikasi:**
- `npx prisma migrate dev` — Already in sync (migration `20260803120849_add_perihal_surat_and_pic` sudah diterapkan) ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 14/14 pages ✅
- `npm run lint` — ⚠️ pre-existing error konfigurasi ESLint (circular structure JSON, `eslint.config.mjs` + `next lint` incompatible, `eslint ^10` + `eslint-config-next ^16`). Bukan akibat Sprint17 — terjadi sebelum perubahan. Build tetap sukses (lint bukan gate build di proyek ini).

### 3 Agustus 2026 — Sprint16 (R6): Rename Role ATASAN → KEPALA_BAGIAN

| Fitur | Status | Catatan |
|-------|--------|---------|
| Rename enum Role | ✅ Selesai | `ATASAN` → `KEPALA_BAGIAN` di schema + 7 code files + docs |

**Decisions:**
- Migration manual `ALTER TYPE "Role" RENAME VALUE 'ATASAN' TO 'KEPALA_BAGIAN'` (BEGIN/COMMIT). Prisma `--create-only` menghasilkan rebuild enum (`CREATE TYPE "Role_new"` + cast + `DROP TYPE "Role_old"`) yang GAGAL jika ada user dengan role ATASAN — enum value yang sedang dipakai tidak bisa di-drop. `RENAME VALUE` (PG10+) aman: mengubah label value in-place tanpa rebuild.
- `canEditRole()` (`ADMIN || STAFF`) TIDAK berubah — KEPALA_BAGIAN tetap view-only.
- Backward compat: username `atasan` / password `atasan123` tetap — hanya nilai enum diubah.
- JWT lama dengan `role: 'ATASAN'` tidak match setelah deploy → user harus re-login (max 7 hari). Dampak minimal karena ATASAN cuma view-only.
- Permission final: ADMIN (semua akses + kelola user + activity log); STAFF (worksheet/dashboard/master data); KEPALA_BAGIAN (sama seperti STAFF, tanpa kelola user). Tidak ada perubahan dari sisi canEditRole.

**Files:**
- `prisma/schema.prisma` — MODIFIED: `Role.KEPALA_BAGIAN`
- `prisma/migrations/20260803090212_rename_role_atasan_to_kepala_bagian/migration.sql` — NEW: `ALTER TYPE "Role" RENAME VALUE`
- `src/lib/auth.ts` — MODIFIED: `SessionPayload.role` union type
- `src/app/actions/users.ts` — MODIFIED: `CreateUserInput` / `UpdateUserInput` role union
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: ROLE_LABELS, state, select, option
- `src/app/(protected)/app-shell.tsx` — MODIFIED: ROLE_LABELS
- `prisma/seed.ts` — MODIFIED: `role: Role.KEPALA_BAGIAN`
- `src/app/login/page.tsx` — MODIFIED: label akun percobaan
- `docs/architecture.md`, `docs/decisions.md`, `docs/roadmap.md` — MODIFIED: referensi ATASAN → KEPALA_BAGIAN

**Verifikasi:**
- `npx prisma migrate dev` — migration applied ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 14/14 pages ✅
- Grep `ATASAN` di `src/` — tidak ada (hanya migration historis 20260717021729 yang mempertahankan nilai lama di CREATE TYPE)

### 2 Agustus 2026 — Sprint15: Rebranding SIAP-PRO + Enum KEGIATAN & TIDAK_DIRILIS

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Branding SIAP-PRO | ✅ Selesai | Nama aplikasi di UI → "SIAP-PRO" (Sistem Informasi Agenda Pimpinan Prokompim) |
| R2: JenisPenugasan KEGIATAN | ✅ Selesai | Enum `JenisPenugasan` tambah value `KEGIATAN` (3 value: LEMBUR / SPPD / KEGIATAN) |
| R3: StatusPublikasi TIDAK_DIRILIS | ✅ Selesai | Enum `StatusPublikasi` tambah value `TIDAK_DIRILIS` (3 value: BELUM_DIRILIS / TIDAK_DIRILIS / DIRILIS) |

**Verifikasi:**
- `npx prisma migrate dev` — berhasil ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — berhasil ✅

### 31 Juli 2026 — Sesi 14: Kelengkapan CRUD Admin 🚧 SEDANG BERJALAN

> Status: File 1-2 selesai & verified, File 3 bug fix disiapkan (belum diterapkan), File 4-5 belum, verifikasi tsc/build belum dijalankan. Lanjut di Sesi 15.

| Fitur | Status | Catatan |
|-------|--------|---------|
| Edit/Rename Leading Sector | 🚧 Sebagian | Server action `updateLeadingSector(id, nama)` di `actions/leading-sector.ts` ✅ selesai — validasi trim, no-op guard, cek duplikat `findFirst({ nama, NOT: { id } })`, log UPDATE, revalidate 2 path. UI tombol Edit + modal di `master-leading-sector-client.tsx` ada BUG JSX (blok form Tambah terhapus + closing tag stray di baris 96-99) — fix disiapkan, belum diterapkan |
| Edit User + Reset Password | 🚧 Sebagian | Server action `updateUser(id, data)` di `actions/users.ts` ✅ selesai — edit nama + role, reset password opsional (hash bcrypt sama dengan create), `PASSWORD_MASK = '********'` di Activity Log (nilai asli tidak pernah disimpan), proteksi admin terakhir (demote yang menyisakan 0 admin ditolak), no-op guard menyertakan passwordChanged. UI di `users-client.tsx` belum dimulai |
| Input password form user → `type="password"` | 📌 Belum | Di `users-client.tsx` — ubah dari `type="text"` (form tambah user) |
| FIELD_LABEL password di Activity Log | 📌 Belum | `activity-log-client.tsx` — tambah `password: 'Kata Sandi'` |

**Decisions:**
- Masker `********` (PASSWORD_MASK) di Activity Log saat password diubah — tetap ada jejak "password diubah" tanpa pernah menyimpan/ekspos nilai asli.
- Proteksi admin terakhir: `existing.role === 'ADMIN' && roleChanged` → hitung admin lain; jika 0, tolak demote. Self-demote tetap boleh selama masih ada admin lain.
- No-op guard `updateUser` menyertakan `passwordChanged` — reset password sendirian tetap dieksekusi (anti-bug skip diam-diam).
- Hash bcrypt dilakukan DI LUAR `$transaction` — jangan tahan koneksi DB selama ~100ms hashing.
- Username tidak diedit di `updateUser` (di luar scope).
- Ikuti pola `updatePetugas` (auth → trim → fetch existing → diff/no-op → transaction → revalidate).

**Files:**
- `src/app/actions/leading-sector.ts` — MODIFIED: tambah `updateLeadingSector()` antara create & delete
- `src/app/actions/users.ts` — MODIFIED: tambah `PASSWORD_MASK`, `UpdateUserInput`, `updateUser()` antara create & delete
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: tombol Edit + modal edit (SEBAGIAN, bug JSX)
- `src/app/(protected)/users/users-client.tsx` — 📌 belum (tombol Edit + modal + type=password)
- `src/app/(protected)/activity-log/activity-log-client.tsx` — 📌 belum (FIELD_LABEL password)

**Verifikasi:** belum dijalankan — `npx tsc --noEmit`, `npm run build`, skenario manual (rename, rename duplikat, no-op, reset password saja, log masker, demote admin terakhir, akses STAFF/KEPALA_BAGIAN). Lihat `memory/session-sesi14.md`.

### 31 Juli 2026 — Sesi 13: Kalender Kegiatan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Kalender Kegiatan | ✅ Selesai | Halaman `/kalender` — tampilan agenda bulanan: grid 7 kolom (Sen→Min), navigasi prev/next, chip kegiatan berwarna status, highlight hari ini, legend status. Klik chip → `/worksheet/[id]`. Desktop: chip nama + warna; mobile: dot berwarna + count. |

**Decisions:**
- Server Component murni — navigasi prev/next via `<Link>` ke `?bulan=YYYY-MM`, tanpa client component/`useState`. Konsisten pola `laporan/page.tsx`.
- `searchParams` async (`await`) karena Next.js 15.
- Helper grid terpisah `lib/kalender.ts` (`getMonthGrid`, start Senin) — pure function, mudah diverifikasi.
- Reuse `STATUS_KEGIATAN_*` constants untuk warna chip/legend — tidak duplikasi.
- `DOT_COLOR` lokal di page (hanya dipakai kalender) — tidak menambah shared constants.
- Grouping tanggal pakai komponen lokal (`getFullYear/getMonth/getDate`) — hindari bug UTC off-by-one.
- Query minimal (id, nama, tanggal, waktu, status) tanpa include petugas/sektor — detail di `/worksheet/[id]`.
- Tanpa library baru (native grid div, lucide-react icon).

**Files:**
- `src/lib/kalender.ts` — NEW: `getMonthGrid(tahun, bulan)` + type `MingguKalender`
- `src/app/(protected)/kalender/page.tsx` — NEW: Server Component kalender
- `src/app/(protected)/app-shell.tsx` — MODIFIED: nav item "Kalender" (icon Calendar)

**Verifikasi:**
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully ✅
- Manual: sidebar menu Kalender, `/kalender` normal, chip sesuai status, klik chip → detail, `?bulan=abc` fallback bulan berjalan ✅

### 31 Juli 2026 — Sesi 12: Seed Data Dokumen (Variasi Status)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Seed Data Dokumen | ✅ Selesai | `prisma/seed.ts` sekarang membuat 7 dokumen per kegiatan (20×7 = 140 baris) dengan status bervariasi sesuai `statusKegiatan`. Sebelumnya seed tidak membuat dokumen sama sekali → progress dokumen dashboard selalu 0% dan card Perlu Perhatian tidak pernah muncul. |

**Decisions:**
- Pola `polaDokumen: Record<StatusKegiatan, StatusDokumen[]>` memetakan status kegiatan ke 7 status dokumen: SPJ_SELESAI = semua upload, KEGIATAN_SELESAI = 5 upload + 1 revisi + 1 belum, MENUNGGU_PENUGASAN = 1 upload, ACARA_MASUK = semua belum.
- Enum Prisma eksplisit (`StatusDokumen.SUDAH_UPLOAD` dst) — type-safe penuh, otomatis mengikuti perubahan enum.
- `Object.values(JenisDokumen)` sebagai single source of truth 7 jenis dokumen.
- Idempoten — kegiatan di-reseed bersih (delete + recreate), dokumen ikut cascade.

**Files:**
- `prisma/seed.ts` — MODIFIED: import `JenisDokumen`/`StatusDokumen` + blok `polaDokumen` + `dokumenData` + `createMany` dokumen setelah `kegiatanPetugas.createMany()`

**Verifikasi:**
- `npx prisma db seed` — berhasil ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 13/13 pages ✅ (hanya pre-existing warnings: Dynamic Server Usage, ESLint circular JSON)
- Visual: progress dokumen dashboard bervariasi, card Perlu Perhatian muncul, 7 baris dokumen per kegiatan ✅

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
