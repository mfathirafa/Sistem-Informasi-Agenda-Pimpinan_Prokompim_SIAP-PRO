# Sistem Manajemen SPJ — Protokom Sekda Brebes

Worksheet digital untuk mencatat kegiatan Bupati/Wakil Bupati: tempat, tanggal, status sambutan, petugas protokol & liputan, leading sector, dan link dokumentasi — menggantikan pencatatan tersebar di grup WhatsApp.

## Teknologi yang dipakai

- **Next.js 15** (React, App Router) — frontend & backend jadi satu proyek
- **PostgreSQL** + **Prisma ORM** — database
- **Server Actions** — pengganti REST API untuk simpan/ubah/hapus data
- **JWT (jose) + bcrypt** — login & sesi
- **Tailwind CSS** — tampilan
- Deploy ke **Vercel** (gratis), database di **Neon** (gratis)

Versi paket sengaja dikunci ke versi yang stabil (bukan versi paling baru) supaya proyek ini bisa langsung jalan tanpa masalah kompatibilitas.

## 1. Persiapan akun & alat (sekali saja)

1. Install **Node.js versi 20 LTS** dari https://nodejs.org (pilih tombol "LTS").
2. Buat akun **GitHub** di https://github.com (kalau belum punya).
3. Buat akun **Neon** (database gratis) di https://neon.tech — daftar pakai akun GitHub juga bisa.
4. Buat akun **Vercel** di https://vercel.com — daftar pakai akun GitHub (biar nanti tinggal connect).

## 2. Menjalankan di komputer sendiri

Buka folder proyek ini di terminal / Command Prompt, lalu jalankan satu-satu:

```bash
npm install
```

Buat file `.env` (salin dari `.env.example`):

```bash
cp .env.example .env
```

Buka `.env`, isi dua hal:
- `DATABASE_URL` — buat database baru di dashboard Neon, klik "Connection string", tempel ke sini.
- `AUTH_SECRET` — buka https://generate-secret.vercel.app/32 , salin teks yang muncul, tempel di sini.

Buat tabel di database & isi data contoh:

```bash
npm run db:push
npm run db:seed
```

Jalankan aplikasinya:

```bash
npm run dev
```

Buka browser ke `http://localhost:3000`. Login pakai salah satu akun percobaan di bawah.

## 3. Akun percobaan (bisa dihapus/diganti nanti lewat menu Kelola Pengguna)

| Peran | Username | Password |
|---|---|---|
| Admin (kelola pengguna + input data) | `admin` | `admin123` |
| Staf Protokom (input data) | `staff` | `staff123` |
| Pimpinan (lihat saja) | `atasan` | `atasan123` |

**Penting:** setelah dipakai sungguhan, segera ganti password akun-akun ini lewat menu Kelola Pengguna (buat akun baru dengan password sendiri, lalu hapus akun percobaan).

## 4. Upload ke GitHub

```bash
git init
git add .
git commit -m "Inisialisasi proyek Sistem Manajemen SPJ"
```

Buat repository baru (kosong, jangan centang "Add README") di https://github.com/new, lalu:

```bash
git remote add origin <link-repo-github-kamu>
git branch -M main
git push -u origin main
```

## 5. Deploy ke Vercel (gratis)

1. Buka https://vercel.com/new, pilih repo GitHub yang tadi dibuat.
2. Di bagian **Environment Variables**, tambahkan `DATABASE_URL` dan `AUTH_SECRET` — isi dengan nilai yang sama seperti di `.env` lokal kamu (untuk produksi, sebaiknya buat database Neon terpisah dari yang dipakai untuk coba-coba di laptop).
3. Klik **Deploy**. Tunggu beberapa menit.
4. Setelah selesai, Vercel kasih link publik (misalnya `https://sistem-spj-protokom.vercel.app`) — ini yang dibagikan ke tim protokom dan atasan.
5. Jalankan migrasi & seed ke database produksi sekali saja (dari laptop, dengan `DATABASE_URL` produksi aktif di `.env`): `npm run db:push` lalu `npm run db:seed`.

Setelah ini, **setiap kali kamu push ke branch `main`, Vercel otomatis deploy ulang** — tidak perlu upload manual lagi.

## Struktur folder singkat

```
prisma/schema.prisma        Struktur tabel database
src/lib/                    Helper (koneksi database, autentikasi)
src/middleware.ts           Penjaga akses halaman (harus login)
src/app/login/              Halaman login
src/app/actions/            Server Actions (simpan/ubah/hapus data)
src/app/(protected)/        Halaman setelah login: dasbor, worksheet, kelola pengguna
```

## Batasan & rencana lanjutan

- Kata sandi sudah dienkripsi (bcrypt) dan sesi login pakai token terenkripsi (JWT) — sudah jauh lebih aman dibanding versi prototipe awal.
- Belum ada fitur lupa password (reset lewat email) — kalau dibutuhkan, bisa ditambahkan di iterasi berikutnya.
- Belum ada log riwayat perubahan data (siapa mengubah apa, kapan) — bisa ditambahkan kalau atasan minta jejak audit.
