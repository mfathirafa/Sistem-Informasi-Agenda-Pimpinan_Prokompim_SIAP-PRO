# Progress 7 September 2026 — Fitur Kontak & Profil Pimpinan Leading Sector serta Link Publikasi Medsos/Berita

> **Status: ✅ Selesai (Fitur Profil Leading Sector & Link Medsos/Berita Selesai, Menunggu Data Bulan April)**

---

## 📋 Ringkasan Progres Hari Ini

| # | Modul / Fitur | Deskripsi Perubahan | Status |
|---|---------------|---------------------|--------|
| 1 | **Database Schema** (`prisma/schema.prisma`) | Menambahkan field opsional `noHp`, `pejabatNama`, dan `pejabatJabatan` pada model `LeadingSector`, serta 4 field baru pada model `Kegiatan`: `linkTiktok`, `linkInstagram`, `linkBeritaInternal`, dan `linkBeritaEksternal`. | ✅ Selesai |
| 2 | **Master Leading Sector** (`src/app/actions/leading-sector.ts` & `master-leading-sector-client.tsx`) | Menambahkan input Nama Pimpinan, Jabatan, dan Kontak Narahubung (`textarea` multi-baris agar mendukung banyak ADC/kontak). Menambahkan kolom **Pimpinan / Kepala** dan **No. HP / Kontak** pada tabel dengan deteksi otomatis link WhatsApp (`wa.me`) per baris kontak. | ✅ Selesai |
| 3 | **Worksheet Helper & Query** (`src/lib/worksheet.ts` & `src/lib/queries/kegiatan.ts`) | Memperbarui type `KegiatanRow` dan mapper query database agar memuat keempat atribut link baru (`linkTiktok`, `linkInstagram`, `linkBeritaInternal`, `linkBeritaEksternal`). | ✅ Selesai |
| 4 | **Server Action Kegiatan** (`src/app/actions/kegiatan.ts`) | Interface `KegiatanInput` telah mendukung keempat field link tersebut dan otomatis tersimpan saat create/update kegiatan. | ✅ Selesai |
| 5 | **Modal Tambah/Edit Kegiatan** (`src/app/(protected)/worksheet/kegiatan-modal.tsx`) | Menambahkan input form untuk Link TikTok, Instagram, Berita Internal, dan Berita Eksternal ke dalam form modal. | ✅ Selesai |
| 6 | **Tabel Worksheet & Export** (`src/app/(protected)/worksheet/worksheet-client.tsx`) | Menambahkan 2 kolom baru pada tabel worksheet (**Medsos** dan **Berita**) beserta badge tautannya, menyesuaikan colSpan tabel, serta memasukkan kolom tersebut ke fitur Export CSV. | ✅ Selesai |
| 7 | **Referensi Database OPD Brebes** (`references/database/...`) | Menelaah PDF Database Perangkat Daerah Brebes per 22 Mei 2026 sebagai acuan struktur profil instansi, pimpinan, dan kontak narahubung. | ✅ Selesai |
| 8 | **Import Data Bulan April** | Rencana input data agenda kegiatan pimpinan mulai dari bulan April 2026. | ⏳ **Menunggu Data Diberikan** |

---

## 🔍 Rincian File yang Dimodifikasi

1. **`prisma/schema.prisma`**
   - Model `LeadingSector`: 
     - `noHp String?` (Kontak / Narahubung)
     - `pejabatNama String?` (Nama Lengkap Pimpinan + Gelar)
     - `pejabatJabatan String?` (Jabatan Pimpinan: Kepala Dinas, Camat, Direktur, dll.)
   - Model `Kegiatan`:
     - `linkTiktok String?`
     - `linkInstagram String?`
     - `linkBeritaInternal String?`
     - `linkBeritaEksternal String?`

2. **`src/app/actions/leading-sector.ts`**
   - Parameter `createLeadingSector` & `updateLeadingSector` menerima `noHp`, `pejabatNama`, dan `pejabatJabatan`.
   - Logging activity mencatat riwayat perubahan data pimpinan dan kontak.

3. **`src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx`**
   - Type `LeadingSectorRow` ditambahkan `noHp`, `pejabatNama`, `pejabatJabatan`.
   - Form Tambah & Modal Edit memiliki input Nama Pimpinan, Jabatan, dan `<textarea>` multi-baris untuk Kontak Narahubung.
   - Tabel menampilkan kolom **Pimpinan / Kepala** (nama + subtext jabatan) dan **No. Hp / Kontak** dengan parsing multi-baris nomor WA interaktif.

4. **`src/lib/worksheet.ts` & `src/lib/queries/kegiatan.ts`**
   - Penambahan interface type link medsos & berita.
   - Query Prisma memetakan field-field tersebut ke client.

5. **`src/app/actions/kegiatan.ts`**
   - `KegiatanInput` tipe data diperbarui untuk keempat link.

6. **`src/app/(protected)/worksheet/kegiatan-modal.tsx`**
   - State form inisialisasi awal dan edit memuat data link medsos dan berita.
   - Form modal menampilkan grid input: Link TikTok, Link Instagram, Link Berita Internal, dan Link Berita Eksternal.

7. **`src/app/(protected)/worksheet/worksheet-client.tsx`**
   - Kolom tabel bertambah 2: **Medsos** (Badge TikTok & IG) dan **Berita** (Badge Internal & Eksternal).
   - Penyesuaian `colSpan` baris kosong.
   - Fitur download/export CSV menyertakan kolom link medsos & berita.

---

## 📌 Catatan untuk Task Selanjutnya

- **Input Data Bulan April**: Begitu file data (Excel / format lainnya) sudah diberikan, buatkan script seeder/import batch untuk memasukkan seluruh agenda kegiatan bulan April ke database.

