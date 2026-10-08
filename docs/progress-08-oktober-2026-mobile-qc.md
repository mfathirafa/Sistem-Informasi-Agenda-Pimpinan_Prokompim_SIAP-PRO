# Progress 08 Oktober 2026 — Perbaikan Hasil QC Mobile

> **Status: ✅ Selesai (Semua masukan hasil QC perangkat mobile berhasil diimplementasikan dan diverifikasi)**

---

## 📋 Ringkasan Tindak Lanjut Hasil QC Mobile

Berdasarkan hasil pengujian langsung (QC) pada perangkat mobile, dilakukan optimalisasi dan perbaikan menyeluruh pada modul-modul berikut:

| # | Modul | Catatan QC Mobile | Solusi & Implementasi | Status |
|---|-------|-------------------|------------------------|--------|
| 1 | **Dashboard** | Pertanyaan relevansi widget "Progress Dokumen SPJ", serta teks bulan di bawah grafik 6 bulan yang posisinya tidak tepat / bergeser | <ul><li>Widget lama "Progress Dokumen" telah digantikan dengan **Status Pelaksanaan Kegiatan** (*Acara Masuk, Menunggu Penugasan, Selesai, SPJ Selesai*) yang jauh lebih relevan untuk pemantauan rekap kegiatan.</li><li>Teks label bulan pada grafik bulanan diperbaiki dengan format singkatan rapi (`Jul`, `Agu`, `Sep`, `Okt`, `Nov`, `Des`), penghapusan margin negatif ekstrem, dan penambahan explicit width pada `YAxis`, sehingga setiap label bulan tepat berada di tengah bawah batang grafik tanpa terpotong atau tumpang tindih di layar HP.</li></ul> | ✅ Selesai |
| 2 | **Kalender** | Tombol panah ganti bulan lambat merespons, serta tata letak panah kiri, bulan, tahun, dan panah kanan ingin dibuat rata memenuhi lebar layar | <ul><li>Menambahkan `router.prefetch()` pada tautan bulan sebelumnya dan berikutnya di `useEffect`, serta indikator pemuatan `useTransition` / `isPending` dengan spinner sehingga perpindahan bulan berlangsung instan tanpa lag.</li><li>Tata letak kontrol navigasi dirombak menjadi `grid-cols-[auto_1fr_1fr_auto] w-full` dengan tinggi sentuh tombol `h-10` yang nyaman untuk jari jemari pada layar smartphone, membentang penuh 100% selebar layar secara proporsional.</li></ul> | ✅ Selesai |
| 3 | **Laporan** | Unduhan PDF Ringkas / Detail kadang tidak muncul di browser HP meski aplikasi memberi notifikasi | <ul><li>Penundaan pencabutan URL Blob (`URL.revokeObjectURL`) diperpanjang menjadi 2 menit agar download manager browser mobile memiliki cukup waktu memproses stream file.</li><li>Menambahkan atribut `target="_blank"` dan `rel="noopener noreferrer"`.</li><li>Menambahkan tombol aksi interaktif **"Buka PDF"** pada toast notifikasi sukses, memberikan fallback 1-klik yang dijamin lolos dari popup-blocker mobile jika unduhan otomatis terhambat oleh kebijakan privasi browser ponsel.</li></ul> | ✅ Selesai |
| 4 | **Master Petugas** | Tambahkan fitur pagination | <ul><li>Menerapkan pagination 10 data per halaman menggunakan komponen `<Pagination />`.</li><li>Otomatis mereset ke halaman 1 saat filter atau pencarian berubah.</li><li>Nomor urut baris dihitung dinamis sesuai halaman aktif: `(page - 1) * pageSize + index + 1`.</li></ul> | ✅ Selesai |
| 5 | **Kelola Pengguna** | Tambahkan fitur pagination | <ul><li>Menerapkan pagination 10 data per halaman pada tabel pengguna.</li><li>Menambahkan kolom nomor urut `#` agar konsisten dengan Master Petugas.</li><li>Reset ke halaman 1 otomatis saat filter peran atau pencarian berubah.</li></ul> | ✅ Selesai |
| 6 | **Riwayat Aktivitas** | Tambahkan filter per tanggal, bulan, dan tahun | <ul><li>Menambahkan filter spesifik: pemilih tanggal (`input type="date"`), dropdown Bulan (Januari s.d. Desember), dan dropdown Tahun dinamis.</li><li>Mendukung filter tunggal hari tertentu maupun filter gabungan bulan + tahun secara presisi berdasarkan zona waktu WIB (UTC+7).</li><li>Penataan kontrol filter responsif `w-full sm:w-auto` agar ergonomis di layar ponsel.</li></ul> | ✅ Selesai |

---

## 🛠️ Detail Perubahan Berkas

1. **`src/app/(protected)/dashboard/page.tsx` & `dashboard-charts.tsx`**:
   - Memperbaiki konflik identifier `nextDynamic`.
   - Mengubah mapping label bulan grafik menjadi format ringkas 3 huruf yang anti-overflow di mobile.
   - Mengatur lebar `YAxis` (28px), `tickMargin={8}`, dan tooltip label deskriptif (*e.g. Oktober 2026: X kegiatan*).
   - Memperbarui subtitle banner menyelaraskan fokus pada agenda dan penugasan protokoler.

2. **`src/app/(protected)/kalender/page.tsx` & `kalender-client.tsx`**:
   - Optimalisasi query agregasi min/max tanggal kegiatan.
   - Pemanfaatan `useTransition`, `isPending`, dan `router.prefetch` untuk transisi navigasi instan.
   - Tata letak `w-full grid-cols-[auto_1fr_1fr_auto]` yang memenuhi lebar layar mobile.

3. **`src/app/(protected)/laporan/laporan-client.tsx`**:
   - Siklus hidup blob diperpanjang hingga 120 detik.
   - Toast aksi langsung `Buka PDF` via `window.open(url, '_blank')`.

4. **`src/app/(protected)/master-petugas/master-petugas-client.tsx` & `users-client.tsx`**:
   - Paginasi 10 item per halaman dengan navigasi Prev/Next dan nomor halaman.
   - Indikator teks jumlah rekaman yang ditampilkan.

5. **`src/app/(protected)/activity-log/page.tsx` & `activity-log-client.tsx`**:
   - Parameter dan query Prisma untuk filter `date`, `bulan`, dan `tahun`.
   - Antarmuka pemilih tanggal, bulan, dan tahun yang adaptif di layar sentuh mobile.
