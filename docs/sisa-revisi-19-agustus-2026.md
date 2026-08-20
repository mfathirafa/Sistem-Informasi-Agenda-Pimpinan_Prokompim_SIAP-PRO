# Sisa Revisi — 19 Agustus 2026

> **Status:** 📋 Rencana — Belum dikerjakan  
> **Sumber:** Feedback user sesi 19 Agustus 2026  
> **Referensi:** Sprint25 selesai (progress-19-agustus-2026.md), Task 8 Redesign PDF masih pending

---

## Daftar Revisi

| # | Area | Masalah | Solusi Diinginkan | Prioritas |
|---|------|---------|-------------------|-----------|
| **R1** | **Loading Screen** | Navigasi detail jadwal → worksheet tidak ada loading screen; loading screen tidak berbentuk lingkaran (spinner) | Buat global loading spinner (lingkaran muter) yang muncul saat: (a) navigasi antar halaman, (b) klik export Excel, (c) fetch data lambat (Vercel + Supabase) | 🔴 Tinggi |
| **R2** | **Loading Screen — Export Excel** | Klik tombol Excel di worksheet tidak ada loading feedback | Tampilkan spinner saat generate/unduh XLSX | 🔴 Tinggi |
| **R3** | **Kalender** | Kolom PIC, No HP, Leading Sector tidak ada label "(LS)" | Tambahkan suffix ` (LS)` pada kolom-kolom tersebut | 🟡 Sedang |
| **R4** | **Worksheet — Mobile Validasi Tempat** | Aktivitas tanpa tempat: peringatan muncul di bawah (jelek UX, user tidak tahu) | Ganti dengan **popup/modal** yang menimpa layar; disable scroll background | 🔴 Tinggi |
| **R5** | **Worksheet — Mobile Kolom** | Mobile hanya tampil 4 kolom (tanggal, kegiatan, status, aksi) — terlalu sedikit | Evaluasi: apakah by design? Jika tidak, tambah kolom prioritas (tempat, pejabat, leading sector) | 🟡 Sedang |
| **R6** | **Worksheet — Urutan Data Baru** | Data baru tanggal 17 muncul di **atas** data lama tanggal 17; harapannya di **bawah** (append) | Urutan: `tanggal_pelaksanaan ASC, createdAt ASC` → data baru selalu di bawah untuk tanggal yang sama | 🔴 Tinggi |
| **R7** | **Worksheet — Leading Sector "-"** | Data lama leading sector `-` mau direname ke "tidak dipilih" tapi gagal | Fix: allow update leading sector dari `-` ke nilai kosong/null atau label "Tidak Dipilih" | 🟡 Sedang |
| **R8** | **Laporan — PDF Portrait vs Landscape** | Export PDF preview: tidak ada perbedaan layout portrait vs landscape; PDF kurang layak | Redesign PDF (Task 8): A4 Landscape, kop resmi, header repeat, no ellipsis, footer halaman — **ini adalah Task 8 yang pending** | 🔴 Tinggi |
| **R9** | **Laporan — Atur Kolom Label Warna** | Tombol "Atur Kolom" tidak ada indikasi visual saat dibuka/ditutup | Tambahkan warna label (misal: biru saat buka, abu-abu saat tutup) | 🟢 Rendah |
| **R10** | **Petugas — Modal Scroll Background** | Buka "Tambah Petugas": masih bisa scroll halaman belakang | **Disable scroll background** saat modal terbuka (pakai `overflow-hidden` pada `body` atau portal) | 🔴 Tinggi |
| **R11** | **Petugas — Filter NIP** | Tidak ada filter by NIP | Tambahkan input filter NIP di master petugas | 🟡 Sedang |
| **R12** | **Leading Sector — Hapus Alert di Luar Popup** | Hapus LS yang terpakai: alert muncul di luar popup hapus | Alert/konfirmasi harus **di dalam popup yang sama** (replace konten popup hapus) | 🔴 Tinggi |
| **R13** | **Leading Sector — Modal Scroll Background** | Semua popup: masih bisa scroll halaman belakang | **Disable scroll background** untuk **semua modal/popup** | 🔴 Tinggi |
| **R14** | **Kelola Pengguna — Posisi Tambah** | Tombol "Tambah Pengguna" di paling bawah data | Pindahkan ke **atas** (sebelum tabel) | 🟢 Rendah |
| **R15** | **Activity Log — Mobile Layout** | Tidak rapih; mobile: "1-20 dari n log" sebaiknya di bawah, prev/next di tengah | Rapikan layout mobile: pagination info di bawah, prev/next di tengah | 🟡 Sedang |

---

## Kelompokkan per File Target

| File | Revisi Terkait |
|------|----------------|
| `src/app/layout.tsx` / `src/components/global-loading.tsx` (baru) | R1, R2 — Global loading spinner |
| `src/app/(protected)/kalender/kalender-client.tsx` | R3 — Label "(LS)" |
| `src/app/(protected)/worksheet/worksheet-client.tsx` | R4, R5, R6, R7 — Mobile validasi, kolom, urutan, leading sector |
| `src/app/(protected)/laporan/laporan-client.tsx` | R8, R9 — PDF redesign, atur kolom label warna |
| `src/app/(protected)/petugas/master-petugas-client.tsx` | R10, R11 — Modal scroll, filter NIP |
| `src/app/(protected)/leading-sector/master-leading-sector-client.tsx` | R12, R13 — Alert di popup, modal scroll |
| `src/app/(protected)/users/users-client.tsx` | R14 — Posisi tombol tambah |
| `src/app/(protected)/activity-log/activity-log-client.tsx` | R15 — Mobile pagination layout |

---

## Rencana Implementasi (Saran Urutan)

### Fase 1: Critical UX (Loading + Modal Scroll + Urutan Data)
1. **R1, R2** — Global Loading Spinner (component baru + integrasi)
2. **R10, R13** — Disable Scroll Background untuk Semua Modal (utility hook/component)
3. **R6** — Fix Urutan Data Worksheet (query `orderBy: [{tanggalPelaksanaan: 'asc'}, {createdAt: 'asc'}]`)

### Fase 2: Worksheet Mobile & Validasi
4. **R4** — Popup Validasi Tempat (replace alert di bawah)
5. **R5** — Evaluasi & Tambah Kolom Mobile Worksheet
6. **R7** — Fix Leading Sector "-" Rename

### Fase 3: Kalender & Petugas
7. **R3** — Label "(LS)" di Kalender
8. **R11** — Filter NIP Master Petugas

### Fase 4: Leading Sector
9. **R12** — Alert Hapus LS di Dalam Popup

### Fase 5: Laporan (Termasuk Task 8)
10. **R8** — **Redesign PDF Lengkap** (Task 8 pending)
11. **R9** — Warna Label Atur Kolom

### Fase 6: Kecil
12. **R14** — Pindah Tombol Tambah Pengguna ke Atas
13. **R15** — Rapikan Activity Log Mobile

---

## Catatan Teknis

### Global Loading Spinner (R1, R2)
- Buat `src/components/global-loading.tsx` dengan spinner lingkaran (Tailwind `animate-spin`)
- Gunakan `next/navigation` `useRouter` events atau wrapper `Suspense` boundary
- Untuk Server Actions: gunakan `useTransition` / `startTransition` + state loading lokal
- Untuk navigasi halaman: `next/navigation` `usePathname` + `useEffect` deteksi perubahan

### Disable Scroll Background (R10, R13)
- Hook `useModalScrollLock()` → set `document.body.style.overflow = 'hidden'` saat modal buka, restore saat tutup
- Atau CSS: `.modal-open { overflow: hidden; }` pada `body` via `useEffect`
- Pastikan cleanup pada unmount

### Urutan Data Worksheet (R6)
- Cek `src/lib/queries/kegiatan.ts` → `getKegiatan()` / `getKegiatanExport()`
- Tambah `orderBy: [{ tanggalPelaksanaan: 'asc' }, { createdAt: 'asc' }]`
- Verifikasi tidak mempengaruhi filter tanggal desc/asc

### PDF Redesign (R8 = Task 8)
- Sudah terdokumentasi di `ROADMAP.md` section Task 8
- Target: A4 Landscape, kop Pemkab Brebes, header repeat, 9 kolom ringkas, footer halaman
- File: `src/app/(protected)/laporan/laporan-client.tsx` (print styles + tabel cetak terpisah)

---

## Verifikasi Per Fase

| Fase | Verifikasi |
|------|------------|
| 1 | Loading spinner muncul saat: (a) klik link worksheet, (b) klik export Excel, (c) submit form; modal buka → background tidak scroll |
| 2 | Validasi tempat → popup modal; mobile kolom cukup; leading sector "-" bisa diubah |
| 3 | Kalender kolom PIC/HP/LS ada "(LS)"; filter NIP works |
| 4 | Hapus LS terpakai → konfirmasi di dalam popup yang sama |
| 5 | PDF export: landscape, kop resmi, header repeat, no ellipsis, footer nomor halaman; tombol atur kolom berwarna saat aktif |
| 6 | Tombol tambah user di atas; activity log mobile rapih |

---

## Dependensi

- **R1, R2** independen, bisa dikerjakan pertama
- **R10, R13** share utility `useModalScrollLock` — kerjakan bersamaan
- **R8** butuh waktu paling lama (Task 8 full redesign)
- **R6** butuh cek query existing — minimal risk
- **R4, R5, R7** semua di `worksheet-client.tsx` — kerjakan berurutan

---

## Next Action

> **Menunggu persetujuan user** untuk mulai Fase 1.  
> Setelah approve, saya akan:
> 1. Tunjukkan file yang akan diubah per revisi
> 2. Jelaskan alasan perubahan
> 3. Tampilkan OLD/NEW code untuk perubahan kecil, FULL FILE untuk perubahan besar
> 4. Tunggu user edit manual sebelum lanjut