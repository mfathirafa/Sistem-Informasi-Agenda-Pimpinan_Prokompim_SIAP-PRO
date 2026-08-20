# Sisa Revisi — 19 Agustus 2026

> **Status:** 🚧 **Progress 20 Agustus 2026** — Loading screen integration & Kalender detail (LS) pending  
> **Sumber:** Feedback user sesi 19 Agustus 2026  
> **Referensi:** Sprint25 selesai (progress-19-agustus-2026.md), Task 8 Redesign PDF masih pending

---

## Daftar Revisi

| # | Area | Masalah | Solusi Diinginkan | Status |
|---|------|---------|-------------------|--------|
| **R1** | **Loading Screen** | Navigasi detail jadwal → worksheet tidak ada loading screen; loading screen tidak berbentuk lingkaran (spinner) | Buat global loading spinner (lingkaran muter) yang muncul saat: (a) navigasi antar halaman, (b) klik export Excel, (c) fetch data lambat (Vercel + Supabase) | 🚧 **Component ready, integration pending** |
| **R2** | **Loading Screen — Export Excel** | Klik tombol Excel di worksheet tidak ada loading feedback | Tampilkan spinner saat generate/unduh XLSX | 🚧 **Component ready, integration pending** |
| **R3** | **Kalender** | Kolom PIC, No HP, Leading Sector tidak ada label "(LS)" | Tambahkan suffix ` (LS)` pada kolom-kolom tersebut | ✅ **List selesai** — Detail view pending |
| **R4** | **Worksheet — Mobile Validasi Tempat** | Aktivitas tanpa tempat: peringatan muncul di bawah (jelek UX, user tidak tahu) | Ganti dengan **popup/modal** yang menimpa layar; disable scroll background | ✅ Selesai |
| **R5** | **Worksheet — Mobile Kolom** | Mobile hanya tampil 4 kolom (tanggal, kegiatan, status, aksi) — terlalu sedikit | Evaluasi: apakah by design? Jika tidak, tambah kolom prioritas (tempat, pejabat, leading sector) | ✅ Selesai |
| **R6** | **Worksheet — Urutan Data Baru** | Data baru tanggal 17 muncul di **atas** data lama tanggal 17; harapannya di **bawah** (append) | Urutan: `tanggal_pelaksanaan ASC, createdAt ASC` → data baru selalu di bawah untuk tanggal yang sama | ✅ Selesai |
| **R7** | **Worksheet — Leading Sector "-"** | Data lama leading sector `-` mau direname ke "tidak dipilih" tapi gagal | Fix: allow update leading sector dari `-` ke nilai kosong/null atau label "Tidak Dipilih" | 🚧 **Pending** |
| **R8** | **Laporan — PDF Portrait vs Landscape** | Export PDF preview: tidak ada perbedaan layout portrait vs landscape; PDF kurang layak | Redesign PDF (Task 8): A4 Landscape, kop resmi, header repeat, no ellipsis, footer halaman — **ini adalah Task 8 yang pending** | 📋 **Pending (Task 8)** |
| **R9** | **Laporan — Atur Kolom Label Warna** | Tombol "Atur Kolom" tidak ada indikasi visual saat dibuka/ditutup | Tambahkan warna label (misal: biru saat buka, abu-abu saat tutup) | ✅ Selesai |
| **R10** | **Petugas — Modal Scroll Background** | Buka "Tambah Petugas": masih bisa scroll halaman belakang | **Disable scroll background** saat modal terbuka (pakai `overflow-hidden` pada `body` atau portal) | ✅ Selesai |
| **R11** | **Petugas — Filter NIP** | Tidak ada filter by NIP | Tambahkan input filter NIP di master petugas | ✅ Selesai |
| **R12** | **Leading Sector — Hapus Alert di Luar Popup** | Hapus LS yang terpakai: alert muncul di luar popup hapus | Alert/konfirmasi harus **di dalam popup yang sama** (replace konten popup hapus) | ✅ Selesai |
| **R13** | **Leading Sector — Modal Scroll Background** | Semua popup: masih bisa scroll halaman belakang | **Disable scroll background** untuk **semua modal/popup** | ✅ Selesai |
| **R14** | **Kelola Pengguna — Posisi Tambah** | Tombol "Tambah Pengguna" di paling bawah data | Pindahkan ke **atas** (sebelum tabel) | ✅ Selesai |
| **R15** | **Activity Log — Mobile Layout** | Tidak rapih; mobile: "1-20 dari n log" sebaiknya di bawah, prev/next di tengah | Rapikan layout mobile: pagination info di bawah, prev/next di tengah | ✅ Selesai |

---

## Kelompokkan per File Target

| File | Revisi Terkait |
|------|----------------|
| `src/app/layout.tsx` / `src/components/global-loading.tsx` | R1, R2 — Global loading spinner (component ✅, integration 🚧) |
| `src/app/(protected)/kalender/kalender-client.tsx` | R3 — Label "(LS)" list ✅ |
| `src/app/(protected)/worksheet/[id]/detail-client.tsx` | R3 — Label "(LS)" detail **🚧 Pending** |
| `src/app/(protected)/worksheet/worksheet-client.tsx` | R1, R2, R4, R5, R6, R7 — Loading integration, mobile validasi, kolom, urutan, leading sector |
| `src/app/(protected)/worksheet/kegiatan-modal.tsx` | R4, R7 — Modal validasi, leading sector "-" fix |
| `src/app/(protected)/laporan/laporan-client.tsx` | R8, R9 — PDF redesign, atur kolom label warna |
| `src/app/(protected)/petugas/master-petugas-client.tsx` | R10, R11 — Modal scroll, filter NIP |
| `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` | R12, R13 — Alert di popup, modal scroll |
| `src/app/(protected)/users/users-client.tsx` | R14 — Posisi tombol tambah |
| `src/app/(protected)/activity-log/activity-log-client.tsx` | R15 — Mobile pagination layout |

---

## Rencana Implementasi (Saran Urutan)

### Fase 1: Critical UX (Loading + Modal Scroll + Urutan Data) ✅ **SELESAI (kecuali loading integration)**
1. **R1, R2** — Global Loading Spinner (component baru ✅, **integrasi 🚧**) 
2. **R10, R13** — Disable Scroll Background untuk Semua Modal ✅ Selesai
3. **R6** — Fix Urutan Data Worksheet ✅ Selesai

### Fase 2: Worksheet Mobile & Validasi ✅ **SELESAI (kecuali R7)**
4. **R4** — Popup Validasi Tempat ✅ Selesai
5. **R5** — Evaluasi & Tambah Kolom Mobile Worksheet ✅ Selesai
6. **R7** — Fix Leading Sector "-" Rename **🚧 Pending**

### Fase 3: Kalender & Petugas ✅ **SELESAI (kecuali R3 detail)**
7. **R3** — Label "(LS)" di Kalender List ✅, Detail **🚧 Pending**
8. **R11** — Filter NIP Master Petugas ✅ Selesai

### Fase 4: Leading Sector ✅ **SELESAI**
9. **R12** — Alert Hapus LS di Dalam Popup ✅ Selesai

### Fase 5: Laporan (Termasuk Task 8) 📋 **PENDING**
10. **R8** — **Redesign PDF Lengkap** (Task 8 pending) 📋 Pending
11. **R9** — Warna Label Atur Kolom ✅ Selesai

### Fase 6: Kecil ✅ **SELESAI**
12. **R14** — Pindah Tombol Tambah Pengguna ke Atas ✅ Selesai
13. **R15** — Rapikan Activity Log Mobile ✅ Selesai

---

## Catatan Teknis

### Global Loading Spinner (R1, R2) — **Integration Required**
- Component: `src/components/global-loading.tsx` ✅ ready (spinner lingkaran `animate-spin`)
- Helper: `setGlobalLoading(boolean)` di `global-loading.tsx` ✅ ready
- **Perlu ditambahkan panggilan `setGlobalLoading(true/false)` di:**
  - `worksheet-client.tsx`: `setFilter`, `handlePageChange`, `setSort`, `exportExcel`
  - `GlobalLoading` auto-hide via `usePathname` effect saat route change

### Disable Scroll Background (R10, R13)
- Hook `useModalScrollLock()` → set `document.body.style.overflow = 'hidden'` saat modal buka, restore saat tutup
- Sudah diterapkan di: `kegiatan-modal.tsx`, `master-leading-sector-client.tsx`, `users-client.tsx`, `activity-log-client.tsx`, `kalender-client.tsx`

### Urutan Data Worksheet (R6)
- `src/lib/queries/kegiatan.ts` → `buildKegiatanOrderBy()`
- Default: `[{ tanggal: dir }, { createdAt: 'asc' }]` → data baru di bawah untuk tanggal sama ✅

### PDF Redesign (R8 = Task 8)
- Sudah terdokumentasi di `ROADMAP.md` section Task 8
- Target: A4 Landscape, kop Pemkab Brebes, header repeat, 9 kolom ringkas, footer halaman
- File: `src/app/(protected)/laporan/laporan-client.tsx` (print styles + tabel cetak terpisah)

### Leading Sector "-" Fix (R7)
- `kegiatan-modal.tsx`: `SearchableSelect` perlu allow empty/clear selection
- Option: tambah placeholder "Tidak Dipilih" dengan value kosong, atau allow clear

---

## Verifikasi Per Fase

| Fase | Verifikasi |
|------|------------|
| 1 | Loading spinner muncul saat: (a) klik link worksheet, (b) klik export Excel, (c) submit form; modal buka → background tidak scroll |
| 2 | Validasi tempat → popup modal; mobile kolom cukup; leading sector "-" bisa diubah |
| 3 | Kalender kolom PIC/HP/LS ada "(LS)" **di list ✅, detail 🚧**; filter NIP works |
| 4 | Hapus LS terpakai → konfirmasi di dalam popup yang sama |
| 5 | PDF export: landscape, kop resmi, header repeat, no ellipsis, footer nomor halaman; tombol atur kolom berwarna saat aktif |
| 6 | Tombol tambah user di atas; activity log mobile rapih |

---

## Dependensi

- **R1, R2** independen, integration only — **do first**
- **R10, R13** share utility `useModalScrollLock` — ✅ done
- **R8** butuh waktu paling lama (Task 8 full redesign)
- **R6** ✅ done — minimal risk
- **R4, R5, R7** semua di `worksheet-client.tsx` / `kegiatan-modal.tsx` — kerjakan berurutan
- **R3 detail** — small fix di `detail-client.tsx`

---

## Next Action (Priority Order)

1. **R1, R2** — Integrate `setGlobalLoading()` calls di `worksheet-client.tsx` (4 locations)
2. **R3 detail** — Add `(LS)` suffix di `detail-client.tsx` (2 labels)
3. **R7** — Fix leading sector "-" clear selection di `kegiatan-modal.tsx`
4. **R8** — PDF Redesign (Task 8) — **major work**

---

## Session Progress (20 Agustus 2026)

### ✅ Completed This Session
- Audit semua file terkait revisi
- Identifikasi loading screen component sudah ada tapi belum terintegrasikan
- Identifikasi Kalender list sudah ada (LS), detail belum
- Identifikasi Leading Sector "-" fix perlu di `kegiatan-modal.tsx`
- Update dokumentasi progress

### 🚧 Current Task
- Waiting for manual edits: loading integration (R1,R2), Kalender detail (R3), Leading Sector "-" (R7)

### 📌 Remaining Tasks
- R1, R2: Loading screen integration
- R3: Kalender detail (LS) labels
- R7: Leading Sector "-" clear selection
- R8: PDF Redesign (Task 8)