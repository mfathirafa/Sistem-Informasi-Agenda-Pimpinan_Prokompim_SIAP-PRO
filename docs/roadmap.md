# Roadmap

## Sprint 1

| Fitur | Status | Catatan |
|-------|--------|---------|
| Login | ✅ Selesai | Login form dengan JWT + bcrypt + middleware redirect |
| Dashboard | ✅ Selesai | Halaman dashboard dengan stat cards dan chart (recharts) |
| Worksheet | ✅ Selesai | CRUD worksheet dengan filter, search, CSV export |

## Sprint 2

| Fitur | Status | Catatan |
|-------|--------|---------|
| Workflow Status Manajemen | ✅ Selesai | State machine di `lib/workflow.ts` + validasi transisi di `updateKegiatan()` |
| Manajemen Dokumen | ✅ Selesai | Edit inline status/link/catatan per dokumen via server action `updateDokumen()` |
| Detail Worksheet | ✅ Selesai | Route `worksheet/[id]` + inline edit dokumen + progress bar |

## Sprint 3

| Fitur | Status | Catatan |
|-------|--------|---------|
| Activity Log | ✅ Selesai | Model + migration + helper + integrasi semua Server Actions + halaman Activity Log (filter/pagination/detail modal). Normalisasi snapshot via `toJsonValue()` — Date/NaN/undefined handling. `meta.entityName` untuk identitas entity. No-op UPDATE guard. Diff petugas di UPDATE kegiatan. |
| Dashboard Baru | ✅ Selesai | Dashboard lanjutan dengan distribusi status (donut), progress dokumen (bar), top petugas & leading sector (horizontal bar chart), card Perlu Perhatian. Tidak mengubah layout existing. |
| Laporan SPJ (XLSX + Print) | ✅ Selesai | Halaman `/laporan` — date range filter, summary cards, tabel responsif, export XLSX (SheetJS), Cetak via `window.print()` + `@media print`. Akses semua role. |
| Export | ✅ Selesai | Upgrade ke XLSX (SheetJS) dengan auto-width, format tanggal DD/MM/YYYY, freeze header |
| Kolom Lembur | ✅ Selesai | `isLembur Boolean @default(false)` di schema + migration + form checkbox + kolom tabel + filter (Semua/Ya/Tidak) + detail + export |
| Dashboard Flex Range | ✅ Selesai | Grafik 6 bulan (-3, now, +2) dengan `rangeConfig` object, siap custom date range |
| Filter Petugas per Divisi | ✅ Selesai | Enum `KategoriPetugas` + field `kategori` di Petugas, query terpisah Protokol/Liputan |
| Multi Petugas | ✅ Selesai | Junction table `KegiatanPetugas` + multi-select modal + validasi kategori (Sesi 8) |
| Seed Data | ✅ Selesai | 20 data kegiatan realistis dengan variasi tanggal, pejabat, status, lembur, petugas. Sesi 12: tambah 7 dokumen per kegiatan dengan variasi status |
| Kalender Kegiatan | ✅ Selesai | Halaman `/kalender` — grid bulanan (Sen→Min), prev/next via `?bulan=YYYY-MM`, chip nama + warna status di desktop, dot + count di mobile, klik chip ke `/worksheet/[id]`. Server Component murni tanpa library baru. Akses semua role. |

## Fitur yang Ada di Project tapi Belum di Roadmap

| Fitur | Status | Catatan |
|-------|--------|---------|
| Master Petugas | ✅ Selesai | CRUD master petugas dengan status aktif/nonaktif |
| Master Leading Sector | ✅ Selesai | CRUD master leading sector |
| Kelola Pengguna (Users) | ✅ Selesai | CRUD pengguna khusus role ADMIN, dengan proteksi agar tidak bisa hapus akun sendiri |
| Manajemen Session | ✅ Selesai | JWT session dengan expiry 7 hari, cookie httpOnly, middleware redirect |

## Changelog

### 31 Juli 2026 — Sesi 14: Kelengkapan CRUD Admin 🚧 SEDANG BERJALAN

> Status: File 1-2 selesai & verified, File 3 bug fix disiapkan (belum diterapkan), File 4-5 belum, verifikasi tsc/build belum dijalankan. Lanjut di Sesi 15.

| Fitur | Status | Catatan |
|-------|--------|---------|
| Edit/Rename Leading Sector | 🚧 Sebagian | Server action `updateLeadingSector(id, nama)` di `actions/leading-sector.ts` ✅ selesai — validasi trim, no-op guard, cek duplikat `findFirst({ nama, NOT: { id } })`, log UPDATE, revalidate 2 path. UI tombol Edit + modal di `master-leading-sector-client.tsx` ada BUG JSX (blok form Tambah terhapus + closing tag stray di baris 96-99) — fix disiapkan, belum diterapkan |
| Edit User + Reset Password | 🚧 Sebagian | Server action `updateUser(id, data)` di `actions/users.ts` ✅ selesai — edit nama + role, reset password opsional (hash bcrypt sama dengan create), `PASSWORD_MASK = '********'` di Activity Log (nilai asli tidak pernah disimpan), proteksi admin terakhir (demote yang menyisakan 0 admin ditolak), no-op guard menyertakan passwordChanged. UI di `users-client.tsx` belum dimulai |
| Input password form user → `type="password"` | 📌 Belum | Di `users-client.tsx` — ubah dari `type="text"` (form tambah user) |
| FIELD_LABEL password di Activity Log | 📌 Belum | `activity-log-client.tsx` — tambah `password: 'Kata Sandi'` |

**Decisions:**
- Masker `********` (PASSWORD_MASK) di Activity Log saat password diubah — tetap ada jejak "password diubah" tanpa pernah menyimpan/ekspos nilai asli.
- Proteksi admin terakhir: `existing.role === 'ADMIN' && roleChanged` → hitung admin lain; jika 0, tolak demote. Self-demote tetap boleh selama masih ada admin lain.
- No-op guard `updateUser` menyertakan `passwordChanged` — reset password sendirian tetap dieksekusi (anti-bug skip diam-diam).
- Hash bcrypt dilakukan DI LUAR `$transaction` — jangan tahan koneksi DB selama ~100ms hashing.
- Username tidak diedit di `updateUser` (di luar scope).
- Ikuti pola `updatePetugas` (auth → trim → fetch existing → diff/no-op → transaction → revalidate).

**Files:**
- `src/app/actions/leading-sector.ts` — MODIFIED: tambah `updateLeadingSector()` antara create & delete
- `src/app/actions/users.ts` — MODIFIED: tambah `PASSWORD_MASK`, `UpdateUserInput`, `updateUser()` antara create & delete
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: tombol Edit + modal edit (SEBAGIAN, bug JSX)
- `src/app/(protected)/users/users-client.tsx` — 📌 belum (tombol Edit + modal + type=password)
- `src/app/(protected)/activity-log/activity-log-client.tsx` — 📌 belum (FIELD_LABEL password)

**Verifikasi:** belum dijalankan — `npx tsc --noEmit`, `npm run build`, skenario manual (rename, rename duplikat, no-op, reset password saja, log masker, demote admin terakhir, akses STAFF/ATASAN). Lihat `memory/session-sesi14.md`.

### 31 Juli 2026 — Sesi 13: Kalender Kegiatan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Kalender Kegiatan | ✅ Selesai | Halaman `/kalender` — tampilan agenda bulanan: grid 7 kolom (Sen→Min), navigasi prev/next, chip kegiatan berwarna status, highlight hari ini, legend status. Klik chip → `/worksheet/[id]`. Desktop: chip nama + warna; mobile: dot berwarna + count. |

**Decisions:**
- Server Component murni — navigasi prev/next via `<Link>` ke `?bulan=YYYY-MM`, tanpa client component/`useState`. Konsisten pola `laporan/page.tsx`.
- `searchParams` async (`await`) karena Next.js 15.
- Helper grid terpisah `lib/kalender.ts` (`getMonthGrid`, start Senin) — pure function, mudah diverifikasi.
- Reuse `STATUS_KEGIATAN_*` constants untuk warna chip/legend — tidak duplikasi.
- `DOT_COLOR` lokal di page (hanya dipakai kalender) — tidak menambah shared constants.
- Grouping tanggal pakai komponen lokal (`getFullYear/getMonth/getDate`) — hindari bug UTC off-by-one.
- Query minimal (id, nama, tanggal, waktu, status) tanpa include petugas/sektor — detail di `/worksheet/[id]`.
- Tanpa library baru (native grid div, lucide-react icon).

**Files:**
- `src/lib/kalender.ts` — NEW: `getMonthGrid(tahun, bulan)` + type `MingguKalender`
- `src/app/(protected)/kalender/page.tsx` — NEW: Server Component kalender
- `src/app/(protected)/app-shell.tsx` — MODIFIED: nav item "Kalender" (icon Calendar)

**Verifikasi:**
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully ✅
- Manual: sidebar menu Kalender, `/kalender` normal, chip sesuai status, klik chip → detail, `?bulan=abc` fallback bulan berjalan ✅

### 31 Juli 2026 — Sesi 12: Seed Data Dokumen (Variasi Status)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Seed Data Dokumen | ✅ Selesai | `prisma/seed.ts` sekarang membuat 7 dokumen per kegiatan (20×7 = 140 baris) dengan status bervariasi sesuai `statusKegiatan`. Sebelumnya seed tidak membuat dokumen sama sekali → progress dokumen dashboard selalu 0% dan card Perlu Perhatian tidak pernah muncul. |

**Decisions:**
- Pola `polaDokumen: Record<StatusKegiatan, StatusDokumen[]>` memetakan status kegiatan ke 7 status dokumen: SPJ_SELESAI = semua upload, KEGIATAN_SELESAI = 5 upload + 1 revisi + 1 belum, MENUNGGU_PENUGASAN = 1 upload, ACARA_MASUK = semua belum.
- Enum Prisma eksplisit (`StatusDokumen.SUDAH_UPLOAD` dst) — type-safe penuh, otomatis mengikuti perubahan enum.
- `Object.values(JenisDokumen)` sebagai single source of truth 7 jenis dokumen.
- Idempoten — kegiatan di-reseed bersih (delete + recreate), dokumen ikut cascade.

**Files:**
- `prisma/seed.ts` — MODIFIED: import `JenisDokumen`/`StatusDokumen` + blok `polaDokumen` + `dokumenData` + `createMany` dokumen setelah `kegiatanPetugas.createMany()`

**Verifikasi:**
- `npx prisma db seed` — berhasil ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 13/13 pages ✅ (hanya pre-existing warnings: Dynamic Server Usage, ESLint circular JSON)
- Visual: progress dokumen dashboard bervariasi, card Perlu Perhatian muncul, 7 baris dokumen per kegiatan ✅

### 24 Juli 2026 — Sesi 5: UI Improvements & Lembur Field

| Temuan | Status | Catatan |
|--------|--------|---------|
| R1: Konfirmasi Logout | ✅ Selesai | `confirm-dialog.tsx` reusable component + animasi + aksesibilitas (role=dialog, aria-modal, Escape, focus mgmt) + loading state |
| R2: Kolom Lembur | ✅ Selesai | `isLembur Boolean @default(false)` di schema + form checkbox + kolom tabel + detail + CSV + seed. Belum migration |

### 27 Juli 2026 — Sesi 6: Fitur Lengkap + Seed Data

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Konfirmasi Logout | ✅ Selesai | `confirm-dialog.tsx` reusable + native Server Action pattern (`<form action={logoutAction}>`) |
| R2: Kolom Lembur + Filter | ✅ Selesai | `isLembur` migration + filter dropdown (Semua/Ya/Tidak) |
| R3: Export Excel | ✅ Selesai | XLSX (SheetJS) gantikan CSV — auto-width, format tanggal, tanpa bold/freeze (CE limitation) |
| R4: Dashboard Grafik | ✅ Selesai | rangeConfig `{startOffset:-3, monthCount:6}`, label tahun 2-digit |
| R5: Filter Petugas Protokol | ✅ Selesai | Enum `KategoriPetugas` + field `kategori` di model Petugas |
| R6: Filter Petugas Liputan | ✅ Selesai | Query terpisah Protokol/Liputan dari database |
| R7: Persiapan Multi Petugas | ✅ Selesai | Type + lookup utility di `lib/worksheet.ts`, siap array migration |
| R8: Seed Data | ✅ Selesai | 20 data realistis, -90 s/d +60 hari, 7 status kegiatan, variasi lembur & pejabat |

### 27 Juli 2026 — Sesi 7: Workflow + Manajemen Dokumen

| Fitur | Status | Catatan |
|-------|--------|---------|
| Validasi Workflow Status | ✅ Selesai | `lib/workflow.ts` state machine + validasi di `updateKegiatan()` — transisi hanya maju 1 langkah |
| Manajemen Dokumen | ✅ Selesai | `actions/dokumen.ts` + inline edit di `detail-client.tsx` — edit status/link/catatan per dokumen |

**Decisions:**
- Tidak perlu Prisma migration — schema Dokumen sudah lengkap (status, link, catatan)
- Tidak ada file upload / Supabase Storage — hanya metadata + link Google Drive
- Inline edit per dokumen (bukan modal) — konsisten dengan UX aplikasi
- Progress dihitung dari helper `hitungProgressDokumen()` yang sudah ada

**Files:**
- `src/app/actions/dokumen.ts` — NEW: server action `updateDokumen()` dengan validasi URL + enum
- `src/app/(protected)/worksheet/[id]/detail-client.tsx` — MODIFIED: view mode + edit mode per dokumen
- `src/lib/workflow.ts` — NEW (Sesi 7 sebelumnya): state machine `canTransition()` + `validateTransition()`

### 23 Juli 2026 — Sesi 4: Architecture Cleanup

| Temuan | Status | Catatan |
|--------|--------|---------|
| H1: AUTH_SECRET fallback | ✅ Fixed | `lib/auth.ts` + `middleware.ts` sekarang throw error jika AUTH_SECRET tidak ada |
| H2: `canEditRole()` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua action mengimport dari satu sumber |
| H3: Action import konsisten | ✅ Fixed | `kegiatan.ts`, `petugas.ts`, `leading-sector.ts` semua pakai `canEditRole()` dari `@/lib/auth` |
| H4: `ActionResult` duplikasi | ✅ Fixed | Dipindahkan ke `lib/auth.ts`, semua 4 action files mengimport dari satu sumber |
| M1: Error handling page | ✅ Fixed | Semua 4 page sudah ditambah try/catch: `dashboard`, `master-petugas`, `master-leading-sector`, `users` |
| L1: setTimeout cleanup | ✅ Fixed | `searchable-select.tsx` — tambah `useEffect` cleanup untuk `blurTimeout` saat unmount |
| L2: "Lainnya" custom input | ✅ Fixed | `kegiatan-modal.tsx` — pejabat select sekarang support custom input "Lainnya" dengan validasi + edit mode sync |

### 28 Juli 2026 — Sesi 8: Refactor Domain Model

| Fitur | Status | Catatan |
|-------|--------|---------|
| Multi Petugas via Junction Table | ✅ Selesai | `KegiatanPetugas` + migration dengan data migration + seed |
| Workflow 4 Status | ✅ Selesai | 7 → 4: `ACARA_MASUK → MENUNGGU_PENUGASAN → KEGIATAN_SELESAI → SPJ_SELESAI` |
| StatusPublikasi | ✅ Selesai | Enum `BELUM_DIRILIS / DIRILIS` |
| JenisPenugasan | ✅ Selesai | Enum `LEMBUR / SPPD` gantikan `isLembur` Boolean |
| Fix Edit Multi Petugas | ✅ Selesai | Modal init dari data existing junction table |
| Validasi Server-Side | ✅ Selesai | Field wajib + leading sector exists check |

### 30 Juli 2026 — Sesi 11: Dashboard Lanjutan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Distribusi Status Workflow | ✅ Selesai | Donut chart (PieChart) — 4 status: ACARA_MASUK, MENUNGGU_PENUGASAN, KEGIATAN_SELESAI, SPJ_SELESAI. Warna berbeda per status. Legend + Tooltip. |
| Progress Dokumen SPJ | ✅ Selesai | Progress bar per kegiatan via `hitungProgressDokumen()`. Scope: tahun berjalan. Kategori: lengkap (100%) vs belum lengkap (< 100%). Label persentase + count. |
| Petugas Paling Aktif | ✅ Selesai | Horizontal BarChart — top 5 petugas berdasarkan jumlah penugasan. Warna dibedakan Protokol (navy) / Liputan (gold). |
| Leading Sector Terbanyak | ✅ Selesai | Horizontal BarChart — top 5 leading sector berdasarkan jumlah kegiatan. Warna solid navy. |
| Perlu Perhatian | ✅ Selesai | Card kondisional — muncul jika ada kegiatan tanpa petugas atau dokumen belum lengkap. List nama kegiatan (max 3). |

**Decisions:**
- Semua chart baru dimasukkan dalam satu file `DashboardStats` (`dashboard-stats.tsx`) untuk maintainability.
- Progress dokumen menggunakan `hitungProgressDokumen()` yang sudah ada — tidak duplikasi logika.
- Scope progress dokumen: semua kegiatan tahun berjalan (`currentYearStart`), bukan range chart existing.
- Donut chart (PieChart innerRadius) untuk distribusi status — lebih ringkas dari stacked bar.
- Horizontal BarChart untuk ranking — lebih mudah dibaca dari vertical untuk data ranking.
- Card "Perlu Perhatian" kondisional — tidak muncul jika semuanya sudah rapi.
- Tidak ada perubahan pada query/layout existing dashboard — hanya tambahan di Row 3 dan Row 4.

**Files:**
- `src/app/(protected)/dashboard/page.tsx` — MODIFIED: tambah 4 query baru, compute server-side, render DashboardStats + Perlu Perhatian
- `src/app/(protected)/dashboard/dashboard-stats.tsx` — NEW: Client component dengan PieChart + ProgressBar + 2× Horizontal BarChart

### 30 Juli 2026 — Sesi 10: Halaman Laporan SPJ (XLSX + Print)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Sidebar Activity Log | ✅ Selesai | Tambah nav item Activity Log khusus ADMIN — icon History, hanya muncul jika role ADMIN |
| Halaman Laporan SPJ | ✅ Selesai | Route `/laporan` — Server Component query dengan date range, client component dengan filter tanggal + summary cards + tabel responsif + export XLSX + Cetak |
| Export XLSX Laporan | ✅ Selesai | Reuse SheetJS (xlsx) yang sudah terinstall — 12 kolom (tanggal s/d status publikasi), auto-width, filename `laporan-spj-{start}-{end}.xlsx` |
| Print Laporan | ✅ Selesai | `window.print()` + `@media print` — sembunyikan nav/header/button saat cetak, font-size 10pt, page-break-inside |

**Decisions:**
- Halaman Laporan adalah view-only (tidak ada CRUD) — fokus pada report, berbeda dari Worksheet.
- Semua role bisa akses Laporan (tidak dibatasi ADMIN).
- Tidak ada dependency baru — SheetJS sudah terinstall.
- Helper `mapPetugasByKategori()` lokal di page.tsx untuk mengurangi duplikasi `.filter().map()`.

**Files:**
- `src/app/(protected)/app-shell.tsx` — MODIFIED: tambah import FileText + nav item `/laporan` untuk semua role, tambah nav item `/activity-log` untuk ADMIN
- `src/app/(protected)/laporan/page.tsx` — NEW: Server Component dengan query Prisma + date range filter + endOfDay
- `src/app/(protected)/laporan/laporan-client.tsx` — NEW: Client Component dengan filter/export/print

### 29 Juli 2026 — Sesi 9: Activity Log — Normalisasi Snapshot & Type Safety

| Fitur | Status | Catatan |
|-------|--------|---------|
| Schema Activity Log | ✅ Selesai | `Entity`/`ActionLog` enum + `ActivityLog` model + migration |
| Helper `logActivity()` + `getEntityName()` | ✅ Selesai | Integrasi via `prisma.$transaction`. `getEntityName()` prioritaskan `meta.entityName`, fallback pola lama. |
| Integrasi ke Actions | ✅ Selesai | CREATE/UPDATE/DELETE kegiatan, dokumen, petugas, leading-sector, users |
| UI Activity Log | ✅ Selesai | Halaman `/activity-log` — filter entity/action/user/search, pagination sliding window, detail modal CREATE/UPDATE/DELETE |
| Normalisasi snapshot (`toJsonValue`) | ✅ Selesai | Recursive converter — Date→ISO string, Number.isFinite guard, undefined→null/omit, prototype guard. Type-safe tanpa cast `as unknown as Prisma.InputJsonValue`. |
| `meta.entityName` | ✅ Selesai | Semua log menyertakan `meta.entityName` untuk identitas entity. Kompatibel dengan log lama. |
| No-op UPDATE guard | ✅ Selesai | UPDATE tanpa perubahan field skip transaction — `updatedAt` tidak berubah tanpa audit log. |
| Diff petugas di UPDATE kegiatan | ✅ Selesai | Existing vs baru via sort+dedup. Log `{id, nama}` per kategori Protokol/Liputan. |

**Decisions:**
- `toJsonValue()` (recursive internal, return `InputJsonValue \| null`) dipisah dari `normalizeSnapshot()` (root, return `InputJsonObject`) untuk type safety tanpa casts di pipeline normalisasi.
- Proto guard via `Object.getPrototypeOf(value)` cegah Map/Set/class instances masuk diam-diam.
- `meta.entityName` ditambahkan di semua log — fallback ke pola lama untuk kompatibilitas.

**Files:**
- `src/lib/activity-log.ts` — MODIFIED: `toJsonValue()` + `normalizeSnapshot()` + `getEntityName(changes)`
- `src/app/actions/kegiatan.ts` — MODIFIED: petugas diff, no-op guard, meta
- `src/app/actions/petugas.ts` — MODIFIED: no-op guard, meta
- `src/app/actions/leading-sector.ts` — MODIFIED: meta
- `src/app/actions/users.ts` — MODIFIED: meta
- `src/app/actions/dokumen.ts` — MODIFIED: hasDiff guard, meta via nama kegiatan
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: `getEntityName(log.changes)`
