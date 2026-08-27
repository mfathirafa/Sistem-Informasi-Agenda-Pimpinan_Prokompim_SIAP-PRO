# Progress 27 Agustus 2026 — Bug Baru V2

> **Status: 🚧 Sedang Berjalan (Langkah 1 s.d. 3 Selesai, Langkah 4 s.d. 8 Pending)**

---

## 📋 Ringkasan Task Bug Baru V2

| # | Item / File | Deskripsi Perubahan | Status |
|---|-------------|---------------------|--------|
| 0 | `package.json` | Install `@react-pdf/renderer` | ✅ Done (Command dijalankan) |
| 1 | `src/lib/workflow.ts` | Transisi status kegiatan bebas maju/mundur (termasuk SPJ Selesai → Acara Masuk) | ✅ Done |
| 2 | `src/app/actions/kegiatan.ts` | `leadingSectorId` opsional (normalisasi `""`/`"-"` → `null`) pada create & update | ✅ Done |
| 3 | `src/app/(protected)/worksheet/worksheet-client.tsx` | Loading screen (`setGlobalLoading`) saat inline status change | ✅ Done |
| 4 | `src/app/(protected)/master-petugas/master-petugas-client.tsx` | Hapus duplikat header NIP & aktifkan sorting NIP (Arrow Up/Down) | ⏳ Next |
| 5 | `src/app/(protected)/app-shell.tsx` | Ganti label navbar "Activity Log" → "Riwayat Aktivitas" | ⏳ Pending |
| 6 | `src/app/(protected)/activity-log/activity-log-client.tsx` | Ganti judul "Activity Log" → "Riwayat Aktivitas" & filter kategori | ⏳ Pending |
| 7 | `src/app/(protected)/laporan/laporan-pdf.tsx` | File baru: template dokumen PDF Legal Landscape dengan Kop Resmi fixed & footer dinamis | ⏳ Pending |
| 8 | `src/app/(protected)/laporan/laporan-client.tsx` | Hubungkan tombol download PDF Ringkas & Detail ke `@react-pdf/renderer` | ⏳ Pending |

---

## 📝 Detail Panduan Sisa Langkah (Langkah 4 – 8)

### Langkah 4: `src/app/(protected)/master-petugas/master-petugas-client.tsx`
1. Sorting NIP (Line 68–84):
   Ganti logika sort agar menggunakan `av.localeCompare(bv, 'id', { numeric: true })` dan letakkan string kosong di bawah.
2. Header thead (Line 160–184):
   Hapus static `<th>NIP</th>` yang duplikat, pindahkan sortable NIP button ke setelah Nama dan sebelum Jabatan.

### Langkah 5: `src/app/(protected)/app-shell.tsx`
- Ubah label navItems: `{ href: '/activity-log', label: 'Riwayat Aktivitas', icon: <History size={16} /> }` (Line 41–43).

### Langkah 6: `src/app/(protected)/activity-log/activity-log-client.tsx`
- Ubah `<h1>Riwayat Aktivitas</h1>` dan `<option value="">Semua Kategori</option>` (Line 267–278).

### Langkah 7: `src/app/(protected)/laporan/laporan-pdf.tsx` (File Baru)
- Template PDF `@react-pdf/renderer` ukuran LEGAL landscape, kop surat resmi Brebes (fixed), judul periode, tabel proporsional, footer nomor halaman dinamis.

### Langkah 8: `src/app/(protected)/laporan/laporan-client.tsx`
- Import `pdf` dari `@react-pdf/renderer` dan `LaporanPdfDocument`.
- Tambahkan fungsi `handleDownloadPdf('ringkas' | 'detail')`.
- Ganti `onClick` tombol "PDF Ringkas" dan "PDF Detail" agar memanggil `handleDownloadPdf` dengan status loading.

---

## 🔄 Cara Melanjutkan Setelah Laptop Restart
Cukup buka kembali obrolan / workspace dan ketik:
```
Lanjutkan langkah 4 dari docs/progress-27-agustus-2026.md
```
Semua progres sudah tersimpan rapi dan siap dilanjutkan kapan saja.
