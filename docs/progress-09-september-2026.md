# Progress 9 September 2026 — Peningkatan UX Pemilihan Petugas, Kolom No Worksheet & Proteksi Modal

> **Status: ✅ Selesai (Seluruh Fitur UX Petugas, Penomoran Worksheet, dan Proteksi Modal Berhasil Diterapkan)**

---

## 📋 Ringkasan Progres Hari Ini

| # | Modul / Fitur | Deskripsi Perubahan | Status |
|---|---------------|---------------------|--------|
| 1 | **Fast-Input & Enter Petugas** (`src/components/petugas-picker.tsx`) | Tombol `Enter` pada kolom pencarian petugas dikonfigurasi untuk mencentang petugas dan mencegah submit form kegiatan. Keyword otomatis di-reset seketika dan kursor tetap fokus di input agar pengguna dapat langsung mengetik nama berikutnya (*rapid entry*). Menambahkan tombol clear `(X)` dan navigasi panah (`↑` / `↓`). | ✅ Selesai |
| 2 | **Spesifikasi Pencarian Petugas: Nama Saja** (`src/components/petugas-picker.tsx`) | Menghilangkan pencocokan ke teks jabatan (`sublabel`) pada filter pencarian agar pencarian kata seperti *"pen"* tidak mencocokkan jabatan (*Pengadministrasi*, *Penata*, dll.), melainkan hanya mencari petugas berdasarkan nama. Menghapus highlight kuning pada jabatan dan menyesuaikan placeholder menjadi *"Cari nama petugas…"*. | ✅ Selesai |
| 3 | **Penambahan Kolom Nomor Urut di Worksheet** (`src/app/(protected)/worksheet/worksheet-client.tsx`) | Menambahkan kolom `No` pada tabel worksheet di posisi paling kiri (sebelum `Tanggal Pelaksanaan`). Penomoran terintegrasi pagination dinamis dengan rumus `(page - 1) * pageSize + index + 1`, serta penyesuaian `colSpan` tabel kosong (`canEdit ? 21 : 20`). | ✅ Selesai |
| 4 | **Proteksi Penutupan Modal Form** (`src/app/(protected)/worksheet/kegiatan-modal.tsx` & `src/components/petugas-picker.tsx`) | Menghilangkan fungsi penutupan saat area latar belakang gelap (backdrop) diklik pada modal Tambah/Edit Kegiatan dan modal Petugas Picker. Form hanya bisa ditutup secara sengaja melalui tombol **X**, **Batal**, atau **Selesai** untuk mencegah kehilangan data akibat salah klik di luar area modal. | ✅ Selesai |
| 5 | **Audit Kode & Kompilasi TypeScript** | Pengecekan kompilasi dengan `npx tsc --noEmit` menghasilkan 0 error. Evaluasi linting dan pembersihan variabel/komentar. | ✅ Selesai |

---

## 🔍 Rincian Teknis Perubahan

### 1. `src/components/petugas-picker.tsx`
* **Navigasi Keyboard & Prevent Auto-Save:**
  * Menambahkan state `highlightedIndex` untuk menyorot kandidat petugas dengan visual ring/background aktif.
  * Mengimplementasikan `handleSearchKeyDown` untuk menangani tombol `Enter`, `ArrowDown`, dan `ArrowUp`.
  * Saat `Enter` ditekan di kolom pencarian, sistem memanggil `handleSelect(target.id, true)` dan memanggil `e.preventDefault()` serta `e.stopPropagation()` agar form modal kegiatan di luar tidak ikut tersimpan.
* **Auto-Reset Keyword & Continuous Focus:**
  * Pada fungsi `handleSelect`, jika terdapat keyword pencarian (`query.trim()`), state `query` di-reset ke `''`, `page` di-reset ke `1`, dan `highlightedIndex` di-reset ke `-1`.
  * Menggunakan `requestAnimationFrame(() => searchInputRef.current?.focus())` untuk mengembalikan fokus kursor ke input pencarian seketika setelah item tercentang.
  * Menambahkan tombol `(X)` di sebelah kanan kolom search untuk menghapus query secara manual.
* **Pencarian Khusus Nama Petugas:**
  * Mengubah filter `filtered` dari semula `o.label... || o.sublabel...` menjadi hanya mencocokkan nama petugas: `o.label.toLowerCase().includes(q)`.
  * Menghilangkan pembungkusan `<Highlighted>` pada teks sublabel jabatan agar tidak muncul sorotan kuning yang membingungkan saat mencari nama.
* **Proteksi Modal:**
  * Menghapus `onClick={closePicker}` pada backdrop pembungkus luar agar modal hanya ditutup lewat tombol selesai atau silang (X).
  * Menambahkan `e.stopPropagation()` pada container dialog untuk mencegah tombol Enter merembes ke form induk.

### 2. `src/app/(protected)/worksheet/worksheet-client.tsx`
* **Kolom Nomor Urut Paling Kiri:**
  * Menambahkan elemen `<th>No</th>` di baris pertama header `<thead>`.
  * Menambahkan sel `<td>{(page - 1) * pageSize + index + 1}</td>` dengan styling `text-center`, `font-mono`, dan `border-r border-app` di baris pertama `<tbody>`.
  * Memperbarui atribut `colSpan` pada baris "Tidak ada kegiatan yang cocok" dari `canEdit ? 20 : 19` menjadi `canEdit ? 21 : 20`.

### 3. `src/app/(protected)/worksheet/kegiatan-modal.tsx`
* **Pencegahan Modal Tertutup Tidak Sengaja:**
  * Menghapus `onClick={onClose}` pada tag pembungkus luar backdrop (`fixed inset-0 bg-slate-900/50`).
  * Memastikan seluruh data input kegiatan terlindungi dari ketidaksengajaan klik di area luar dialog, mengharuskan penutupan eksplisit melalui tombol `X` atau `Batal`.

---

## 💡 Manfaat Perubahan UX

1. **Efisiensi Input Petugas**: Pengguna dapat menginput banyak nama petugas sekaligus hanya dengan mengetik nama dan menekan `Enter` tanpa perlu menghapus teks manual atau menyentuh mouse.
2. **Akurasi Pencarian**: Pencarian nama tidak lagi terdistraksi oleh jabatan fungsional ASN yang umumnya memiliki awalan kata yang sama (*Peng...* / *Pen...*).
3. **Keterbacaan Data**: Kolom nomor urut di tabel worksheet mempermudah identifikasi dan verifikasi jumlah agenda kegiatan yang sedang ditampilkan per halaman.
4. **Keamanan Data Formulir**: Mengeliminasi risiko kehilangan draf isian formulir kegiatan akibat klik yang meleset ke luar modal.
