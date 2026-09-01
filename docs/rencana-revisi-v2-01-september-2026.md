# Rencana Kerja Revisi & Perbaikan Bug v2 — SIAP-PRO (1 September 2026)

Dokumen ini memuat daftar rencana perbaikan dan penyempurnaan fitur sistem SIAP-PRO berdasarkan feedback evaluasi data seeder dan antarmuka.

---

## 📋 Daftar Rencana Eksekusi

### 1. Dashboard
- [ ] **Sinkronisasi Tanggal Seed & Perhitungan Bulan:**
  - Perbaiki parsing tanggal pada `scripts/seed-september.ts` agar disimpan pada awal hari (`00:00:00 UTC/lokal`) sehingga kegiatan tanggal 30 September malam tidak melompat ke 1 Oktober (WIB UTC+7).
  - Pastikan card "Kegiatan Bulan Ini" dan grafik bulanan tepat menghitung 50 kegiatan di bulan September.
- [ ] **Optimasi Grafik "Leading Sector Terbanyak":**
  - Berikan ruang margin/lebar Y-Axis yang cukup (`width={160}`) dan atur tinggi container grafik (`height: 240px`).
  - Tambahkan pemotongan teks rapi (truncate) / penyesuaian label sumbu Y agar instansi dengan nama panjang tidak saling bertumpuk (overlapping).
  - Tambahkan tooltip lengkap saat bar disorot pengguna.

### 2. Worksheet
- [ ] **Perbaikan Bug Pagination:**
  - Perbaiki query `src/app/(protected)/worksheet/page.tsx` dari `take: PAGE_SIZE + 50` menjadi `take: PAGE_SIZE` (20 data per halaman).
  - Sinkronkan `orderBy` dengan fungsi helper `buildKegiatanOrderBy(sort, dir)`.
- [ ] **Inline / Quick Status Update:**
  - Terapkan selector instan (seperti Status Kegiatan) pada kolom:
    - **Sambutan:** dropdown badge (*Sudah* / *Belum*)
    - **Jenis Tugas:** dropdown badge (*Kegiatan* / *SPPD* / *Lembur*)
    - **Publikasi:** dropdown badge (*Belum Dirilis* / *Dirilis* / *Tidak Dirilis*)
- [ ] **Perbaikan Field Perihal Surat pada Seed:**
  - Tambahkan `perihalSurat: item.perihalSurat` ke payload `prisma.kegiatan.create` pada `scripts/seed-september.ts`.

### 3. Laporan
- [ ] **Perbaikan Border Tabel PDF saat Page Break:**
  - Perbaiki styling `@react-pdf/renderer` pada `src/app/(protected)/laporan/laporan-pdf.tsx`.
  - Hapus border kontainer luar yang bablas memanjang saat multi-halaman.
  - Terapkan border sel mandiri (border-bottom, border-left, border-right) dengan `wrap={false}` pada setiap baris agar tabel tertutup rapi di akhir setiap halaman tanpa garis menggantung.
- [ ] **Tampilan Mobile Laporan:**
  - Hapus tampilan kartu vertikal detail per kegiatan yang memanjang.
  - Tampilkan tabel langsung dengan scroll horizontal responsif (`overflow-x-auto`), konsisten dengan halaman Worksheet.

### 4. Master Petugas
- [ ] **Siklus Sort 3 Arah (Tri-state Sorting):**
  - Urutan tombol sort header: `ArrowUpDown` (default/unsorted) ➔ `ArrowUp` (Ascending) ➔ `ArrowDown` (Descending) ➔ `ArrowUpDown` (Kembali ke urutan awal).
- [ ] **Pembersihan Data Seeder:**
  - Pastikan script `scripts/clear-dummy-data.ts` membersihkan data dummy petugas dan relasinya dengan aman.

### 5. Master Leading Sector
- [ ] **Tata Letak Mobile Form Tambah:**
  - Pindahkan form "Tambah Leading Sector" agar tampil di bagian atas pada layar mobile (`order-1 lg:order-2`), dan tabel di bawahnya (`order-2 lg:order-1`).
- [ ] **Saran Standarisasi Nama Leading Sector:**
  - Berikan rekomendasi format penamaan `Nama Lengkap (Singkatan)` untuk kebutuhan formal SPJ dan kemudahan pencarian.

---
