# SIMAKP - Sistem Manajemen SPJ

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Tailwind CSS
- Vercel
- Server Actions

---

## Konteks Project

- Master Petugas menggunakan **kategori wajib** (`PROTOKOL` / `LIPUTAN`) — penentu petugas muncul di pool Worksheet (Protokol/Liputan).
- Data petugas menggunakan **jabatan resmi kepegawaian** (free text sesuai data kepegawaian), bukan jabatan struktural aplikasi.
- Petugas yang tampil di Worksheet **hanya berdasarkan kategori** (Protokol/Liputan), bukan semua petugas.
- **Sprint24** merupakan hasil review UAT klien — fokus pada **penyempurnaan UX/UI dan workflow**, bukan penambahan fitur baru besar-besaran.

---

## Coding Rules

- Jangan gunakan `any`.
- Gunakan TypeScript strict.
- Gunakan Server Components jika memungkinkan.
- Gunakan Server Actions untuk CRUD.
- Jangan membuat API Route kecuali diperlukan.
- Semua query database melalui Prisma.
- Gunakan import alias `@/`.
- Jangan melakukan refactor besar tanpa diminta.
- Jangan mengubah arsitektur tanpa persetujuan.

---

## Folder Structure

src/
app/
components/
lib/
actions/
prisma/

---

## Naming

- Page -> `page.tsx`
- Client Component -> `*-client.tsx`
- Server Action -> `actions/*.ts`

---

## UI

- Responsive
- Gunakan Tailwind CSS
- Jangan mengubah desain tanpa diminta.
- Jangan mengubah UX tanpa persetujuan.

---

## Database

PostgreSQL (Supabase)

Semua perubahan schema wajib menggunakan Prisma Migration.

---

## Deployment

Frontend + Backend:
Vercel

Database:
Supabase

---

# Working Rules

## Planning

Sebelum mengubah kode:

1. Baca struktur project.
2. Review progress terakhir.
3. Cari task yang belum selesai.
4. Buat implementation plan singkat.
5. Jangan langsung coding.

---

## Manual Editing

Jangan pernah mengedit file secara otomatis.

Jangan gunakan:

- Write
- Update
- Edit
- MultiEdit

Sebagai gantinya:

1. Tunjukkan file yang akan diubah.
2. Jelaskan alasan perubahan.
3. Jika perubahan kecil:
   - tampilkan OLD CODE
   - tampilkan NEW CODE
4. Jika perubahan besar:
   - tampilkan FULL FILE
5. Tunggu saya mengedit manual sebelum lanjut.

**Pengecualian: Dokumentasi `.md`** — File `.md` di `docs/`, `CLAUDE.md`, dan `README.md` boleh diedit secara otomatis (langsung pakai Edit) tanpa perlu menampilkan OLD/NEW, karena dokumen ini hanya berisi catatan dan bukan kode aplikasi.

---

## Manual Commands

Jangan menjalankan command apa pun.

Untuk command seperti:

- npm install
- npm uninstall
- npm run build
- npm run lint
- npx prisma migrate dev
- npx prisma db push
- npx prisma db seed
- npx tsc --noEmit
- git add
- git commit
- git push

Hanya tampilkan command.

Tunggu saya menjalankan command dan mengirim output.

---

## Progress Tracking

Selalu simpan status project.

Gunakan format berikut.

### ✅ Completed

...

### 🚧 Current Task

...

### 📌 Remaining Tasks

...

### 💡 Next Recommended Feature

...

Di awal sesi:

- Review progress sebelumnya.
- Tentukan task berikutnya.

Di akhir sesi:

- Update progress.
- Update roadmap.
- Jelaskan apa yang berubah.

---

## Code Quality

Selalu:

- hindari duplikasi
- gunakan reusable component
- minimal changes
- clean architecture
- readable code

Jangan mengubah file yang tidak berhubungan.

---

## Verification

Setelah implementasi selesai:

Verifikasi:

- TypeScript
- Prisma
- Import
- Build
- Regression

Jika membutuhkan command,
jangan jalankan sendiri.

---

## Communication

Jangan hanya mengatakan:

"Done."

Selalu jelaskan:

- apa yang diubah
- mengapa diubah
- file yang terpengaruh
- kemungkinan efek samping
- langkah berikutnya

---

## Goal

Membangun Sistem Manajemen SPJ yang stabil, maintainable, scalable, dan production-ready.

Always read ROADMAP.md before starting a task.
Always update ROADMAP.md after completing a task.