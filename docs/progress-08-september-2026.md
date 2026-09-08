# Progress 8 September 2026 — Perbaikan Event Form Petugas, Penanganan Karyawan Lama & Arsitektur Status Petugas

> **Status: ✅ Selesai (Semua Bug Form Petugas & Logika Karyawan Aktif/Nonaktif Berhasil Diselesaikan)**

---

## 📋 Ringkasan Progres Hari Ini

| # | Modul / Fitur | Deskripsi Perubahan | Status |
|---|---------------|---------------------|--------|
| 1 | **Audit Type & Kompilasi** | Evaluasi kompilasi TypeScript (`tsc --noEmit`) untuk memastikan stabilitas dan ketiadaan error tipe data. | ✅ Selesai |
| 2 | **Bugfix Form Submit Petugas** (`src/components/petugas-picker.tsx`) | Memisahkan form pop-up quick-add petugas dari form kegiatan utama menggunakan `ReactDOM.createPortal(..., document.body)` serta menambahkan `stopPropagation()` dan `stopImmediatePropagation()` guna mencegah bubbling yang memicu simpan kegiatan saat menambah petugas baru. | ✅ Selesai |
| 3 | **Sinkronisasi Opsi Petugas Lokal** (`src/app/(protected)/worksheet/kegiatan-modal.tsx`) | Menghubungkan prop `<PetugasPicker>` ke state lokal `localProtokolOptions` dan `localLiputanOptions` agar penambahan petugas baru langsung tampil dan tercentang otomatis tanpa perlu me-refresh halaman. | ✅ Selesai |
| 4 | **Filter Default Master Petugas** (`src/app/(protected)/master-petugas/master-petugas-client.tsx`) | Menerapkan filter default **"Petugas Aktif"** pada menu Master Petugas agar karyawan lama tidak muncul di daftar utama. Menambahkan dropdown filter status (*Petugas Aktif*, *Nonaktif / Arsip*, *Semua Status*) serta menyesuaikan placeholder nama menjadi "Nama Pendek / Panggilan". | ✅ Selesai |
| 5 | **Input Status Aktif pada Quick-Add Petugas** (`src/components/petugas-picker.tsx`) | Menambahkan checkbox `[x] Status aktif (karyawan saat ini)` di modal Tambah Petugas Baru agar admin dapat langsung menandai karyawan lama sebagai nonaktif saat menginput kegiatan masa lalu. | ✅ Selesai |
| 6 | **Dukungan Karyawan Nonaktif di Worksheet** (`src/app/(protected)/worksheet/page.tsx`) | Menghapus pembatasan `where: { statusAktif: true }` pada query worksheet dan menambahkan label penanda `(Nonaktif)` pada sublabel agar karyawan lama tetap dapat dicari dan dipilih untuk arsip kegiatan masa lalu tanpa merusak riwayat SPJ. | ✅ Selesai |

---

## 🔍 Rincian Teknis Perubahan

### 1. `src/components/petugas-picker.tsx`
* **Isolasi Form dengan React Portal:**
  * Memindahkan modal quick-add petugas ke `document.body` menggunakan `ReactDOM.createPortal` agar tidak bersarang di dalam tag `<form>` modal kegiatan.
  * Mencegah event bubbling form submit dengan `e.stopPropagation()` dan `e.nativeEvent.stopImmediatePropagation()`.
* **Dukungan Status Aktif & Auto-Select:**
  * Menambahkan properti `statusAktif: boolean` pada state form quick-add `qaForm`.
  * Menambahkan elemen checkbox status aktif di dalam pop-up penambahan petugas.
  * Menjalankan `onChange([...selected, res.id!])` pasca pembuatan petugas agar langsung tercentang otomatis.
  * Memberikan label sublabel `(Nonaktif)` secara otomatis jika petugas baru dibuat dalam status nonaktif.

### 2. `src/app/(protected)/worksheet/kegiatan-modal.tsx`
* **Penyambungan State Lokal Opsi Petugas:**
  * Mengarahkan prop `<PetugasPicker>` dari `petugasProtokolOptions` / `petugasLiputanOptions` ke state lokal `localProtokolOptions` / `localLiputanOptions`.
  * Memastikan penambahan petugas melalui quick-add langsung merender opsi baru seketika.

### 3. `src/app/(protected)/master-petugas/master-petugas-client.tsx`
* **Arsitektur Tampilan Karyawan Terkini:**
  * Menambahkan state `filterStatus` dengan nilai awal `'AKTIF'`.
  * Memperbarui logika penyaringan `filtered` untuk mencakup filter status aktif/nonaktif.
  * Menambahkan kontrol `<select>` filter status berdampingan dengan filter kategori.
  * Memperbarui placeholder input nama menjadi format panggilan/nama pendek (*cth. Rian / Dewi / Fajar*).

### 4. `src/app/(protected)/worksheet/page.tsx`
* **Aksesibilitas Data Karyawan Lama:**
  * Menghapus klausa `where: { statusAktif: true }` pada query `prisma.petugas.findMany`.
  * Memetakan nama jabatan karyawan nonaktif dengan akhiran `(Nonaktif)` agar admin mudah membedakan staf aktif dan mantan staf saat memilih petugas di kegiatan lampau.

---

## 💡 Keputusan Desain & Bisnis (Decisions)

1. **Format Nama Pendek**: Standar nama petugas di sistem protokom disepakati menggunakan nama pendek/panggilan untuk kemudahan rekap penugasan harian, sementara data formal (NIP & Jabatan) tetap tersimpan di profil petugas.
2. **Arsitektur Data Historis**: Karyawan yang telah mutasi/berhenti tidak dihapus dari basis data (*hard delete* dilarang karena relasi `onDelete: Cascade` akan menghapus nama mereka dari seluruh kegiatan masa lalu). Sebagai gantinya, digunakan mekanisme `statusAktif = false` (arsip nonaktif).

---

## 📌 Catatan untuk Task Selanjutnya

* Menunggu data agenda kegiatan pimpinan (mulai bulan April 2026) dari pengguna untuk proses input/seeding batch.
