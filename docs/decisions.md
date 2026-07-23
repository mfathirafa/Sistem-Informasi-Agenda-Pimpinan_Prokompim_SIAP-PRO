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

## Decisions yang Ditunda

| Item | Status | Catatan |
|------|--------|---------|
| Supabase Storage untuk file upload | Belum | Saat ini hanya menyimpan link dokumen (Google Drive/external). Akan dipertimbangkan ketika kebutuhan upload file nyata |
| Query layer terpisah (lib/queries/) | Belum | Saat ini query masih inline di Server Components. Akan dipertimbangkan ketika query mulai dipakai di banyak tempat |
| Activity Log | Belum | Belum ada di codebase |
