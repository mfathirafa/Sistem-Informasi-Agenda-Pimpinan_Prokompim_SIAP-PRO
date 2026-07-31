# Architecture Decisions

| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-07-22 | Supabase PostgreSQL | Lebih scalable daripada Google Spreadsheet. Supabase juga menyediakan connection pooling, backup otomatis, dan fitur Supabase Storage untuk kebutuhan file di masa depan |
| 2026-07-22 | Server Actions (bukan API Routes) | Semua backend berada di dalam Next.js. Server Actions lebih sederhana untuk CRUD — tidak perlu buat endpoint terpisah, tidak perlu fetch handler. Sangat cocok untuk aplikasi internal |
| 2026-07-22 | JWT via jose (bukan session server-side) | Karena deploy ke Vercel (serverless), tidak ada persistent storage untuk server session. JWT memungkinkan stateless auth dengan cookie httpOnly |
| 2026-07-22 | Prisma sebagai ORM | Single source of truth untuk schema. Semua perubahan database wajib melalui Prisma Migration, tidak pernah dari Supabase langsung |
| 2026-07-22 | Tailwind CSS (bukan CSS-in-JS atau CSS Modules) | Konsisten dengan ekosistem Next.js, utility-first approach, dan mudah di-maintain untuk UI internal |
| 2026-07-22 | bcryptjs (bukan bcrypt native) | `bcryptjs` tidak perlu native compilation, cocok untuk environment Vercel tanpa perlu postinstall hooks yang kompleks |
| 2026-07-22 | Role-based access control (RBAC) dengan 3 role | ADMIN (manage users + semua akses), STAFF (manage kegiatan + master data), ATASAN (view only). Disesuaikan dengan hierarki organisasi protokol |
| 2026-07-22 | Server Components sebagai default | Halaman-halaman utama adalah Server Components. Client Components hanya untuk bagian yang memerlukan interaktivitas (usePathname, useState, form events) |
| 2026-07-22 | Optimistic UI update setelah Server Action | Client components langsung update state lokal setelah Server Action berhasil, tanpa menunggu revalidate/re-fetch dari server. Lebih responsif untuk aplikasi internal |
| 2026-07-22 | Prisma singleton pattern di Vercel | `src/lib/prisma.ts` menyimpan instance di `globalThis` untuk menghindari pembukaan koneksi baru di setiap request selama development (hot reload) |
| 2026-07-22 | Nested create untuk kegiatan + dokumen | Saat membuat kegiatan baru, 7 dokumen wajib dibuat secara atomik menggunakan `prisma.kegiatan.create({ data: { dokumen: { create: [...] } } })` |
| 2026-07-23 | Centralisasi shared utilities auth | `canEditRole()` dan `ActionResult` type sebelumnya didefinisikan ulang di setiap file action. Dipindahkan ke `src/lib/auth.ts` sebagai single source of truth — mengurangi duplikasi dan potensi inkonsistensi |
| 2026-07-23 | AUTH_SECRET fail-fast (tidak ada fallback default) | Sebelumnya menggunakan fallback string hardcoded saat env tidak ter-set. Diubah menjadi throw error agar kegagalan konfigurasi terdeteksi sejak awal, bukan diam-diam menggunakan secret lemah |
| 2026-07-31 | Seed dokumen dengan variasi status | Seed harus mencerminkan kondisi nyata agar dashboard bermakna. Pola `Record<StatusKegiatan, StatusDokumen[]>` memetakan status kegiatan ke 7 status dokumen; enum Prisma eksplisit untuk type-safety; `Object.values(JenisDokumen)` sebagai single source of truth 7 jenis dokumen. Sebelumnya seed tidak membuat dokumen → progress dokumen selalu 0% dan card Perlu Perhatian tidak pernah muncul |
| 2026-07-31 | Kalender sebagai Server Component murni (tanpa library) | Kalender bulanan dibuat dengan native grid div + navigasi `<Link>` ke `?bulan=YYYY-MM`, bukan react-big-calendar/fullcalendar (berat, butuh wrapper + CSS custom). Grid helper `getMonthGrid()` dipisah ke `lib/kalender.ts` agar pure & testable. Reuse `STATUS_KEGIATAN_*` constants. Chip status mengikuti badge class existing. Akses semua role (view-only) — klik ke `/worksheet/[id]` |

## Decisions yang Ditunda

| Item | Status | Catatan |
|------|--------|---------|
| Supabase Storage untuk file upload | Belum | Saat ini hanya menyimpan link dokumen (Google Drive/external). Akan dipertimbangkan ketika kebutuhan upload file nyata |
| Query layer terpisah (lib/queries/) | 🟡 Sebagian | `lib/queries/kegiatan.ts` sudah dibuat untuk menyimpan query detail kegiatan yang dipakai di route `worksheet/[id]`. Namun mayoritas query masih inline di masing-masing page |
| Activity Log | ✅ Selesai | Normalisasi snapshot via `toJsonValue()` — Date→ISO string, undefined handling, prototype guard. `meta.entityName` untuk identitas entity. Filter/pagination/detail modal di halaman Activity Log. |
| Laporan SPJ | ✅ Selesai | Halaman `/laporan` view-only — date range filter, summary cards, export XLSX via SheetJS (reuse existing lib), print via `window.print()` + `@media print`. Akses semua role. |
| Dashboard Lanjutan | ✅ Selesai | Metrik baru tanpa mengubah layout existing. Distribusi status (PieChart donut), progress dokumen (div progress bar + `hitungProgressDokumen()`), top petugas/sektor (horizontal BarChart). Scope tahun berjalan. Semua chart dalam satu file `DashboardStats`. |
