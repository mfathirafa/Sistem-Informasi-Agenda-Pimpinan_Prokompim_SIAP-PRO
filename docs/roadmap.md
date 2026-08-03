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

### 4 Agustus 2026 — Sprint21: Server-Side Pagination + Filter Worksheet

| Fitur | Status | Catatan |
|-------|--------|---------|
| Server-side pagination Worksheet | ✅ Selesai | Tabel kegiatan hanya memuat 20 baris/halaman (`PAGE_SIZE = 20`, konsisten Activity Log) via Prisma `skip`/`take` + `count`. Pindah halaman → query halaman berikutnya ke server. Reuse komponen `Pagination` + bar info "Menampilkan X–Y dari Z kegiatan" |
| Filter + search sinkron URL (searchParams) | ✅ Selesai | Semua 8 filter pindah dari client state → URL `searchParams`. Ubah filter → reset ke halaman 1; pindah halaman → filter tetap; refresh browser → state tetap. Search text input pakai pola `defaultValue` + Enter/Blur (sama dengan Activity Log) |
| Export mengikuti filter aktif | ✅ Selesai | Export XLSX memanggil server action `getKegiatanExport(filters)` — ambil SEMUA baris hasil filter (bukan hanya halaman aktif). Client hanya memegang 1 halaman |
| Sinkronisasi CRUD via `router.refresh()` | ✅ Selesai | Optimistic update `setItems()` dihapus (client tak lagi pegang seluruh dataset) → setelah create/update/delete, `router.refresh()` menarik ulang data + total dari server. Halaman out-of-range di-clamp ke `safePage` |

**Decisions:**
- **Filter harus ikut pindah ke server** — kontradiksi inheren jika filter tetap client: client hanya punya 20 baris/halaman, search akan "berjalan" hanya di halaman aktif (fungsional salah). Opsi 2 dipilih user: server-side pagination + server-side filter, agar pagination/search/filter selalu sinkron.
- **`buildKegiatanWhere()` + `mapKegiatanToRow()` + `kegiatanInclude` di `lib/queries/kegiatan.ts`** — dipakai 3 tempat nyata (page findMany, page count, export action), bukan abstraksi sekali pakai. Satu sumber kebenaran: hasil filter tabel == hasil export. `buildKegiatanWhere` menggabungkan window 3 bulan + filter bulan (`YYYY-MM`) jadi rentang tanggal tunggal.
- **Search pakai `contains` + `mode: 'insensitive'`** (Postgres ILIKE) menggantikan `.toLowerCase().includes()` client — perilaku case-insensitive substring identik.
- **`router.replace()` + `params.delete('page')`** — filter berubah → URL bersih tanpa `page`, browser history tidak penuh oleh debounce navigasi.
- **Bulan options dihitung server-side** dari seluruh data window (query `select: { tanggal: true }`), bukan dari halaman aktif — dropdown bulan tetap lengkap.
- **`safePage = Math.min(page, totalPages)`** — hapus/delete item terakhir di halaman terakhir → halaman di-clamp, tidak ada tampilan kosong.
- **Halaman out-of-range tidak redirect** — clamp saja (pola sama PetugasPicker). URL `page=3` tetap di URL sampai interaksi berikutnya mengoreksi; UI selalu menampilkan halaman valid.
- Zero schema change, zero KegiatanModal/PetugasPicker/Detail/Dashboard change.

**Files (4 code + 2 docs):**
- `src/lib/queries/kegiatan.ts` — MODIFIED: + `kegiatanInclude`, `buildKegiatanWhere()`, `mapKegiatanToRow()`, `type KegiatanFilter`
- `src/app/actions/kegiatan.ts` — MODIFIED: + `getKegiatanExport(filters)` server action
- `src/app/(protected)/worksheet/page.tsx` — MODIFIED: read searchParams, `findMany(skip,take) + count`, bulanOptions server-side, clamp safePage
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: filter via `useSearchParams` + `router.replace`, hapus `filtered` useMemo + `items` state + optimistic update, + `<Pagination>` + info bar, export via server action, table dim `opacity-50` saat isPending
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages ✅ (DYNAMIC_SERVER_USAGE pre-existing)

### 3 Agustus 2026 — Sprint20: PetugasPicker (Multi-Select Upgrade)

| Fitur | Status | Catatan |
|-------|--------|---------|
| PetugasPicker reusable | ✅ Selesai | Komponen field ringkas + picker modal untuk pemilihan petugas. Gantikan checkbox inline groups. Field: chip max 2 + "+N", seluruh area klik. Picker: search nama + jabatan (highlight Tailwind), list 10/halaman dengan pagination (sticky di bawah list), counter live, footer sticky tanpa tombol Batal (state langsung commit). Reusable tanpa dependency baru |
| Tabel petugas ringkas | ✅ Selesai | Format "Nama A, Nama B +N" di sel tabel worksheet (sebelumnya raw `string[]` tanpa separator) |

**Decisions:**
- **Direct commit, bukan working copy** — perubahan selection langsung update `form.petugasXxxIds` via `onChange`. Tombol "Selesai" hanya menutup picker (bukan commit). Esc/backdrop = tutup = sama saja. Lebih sederhana, menghilangkan mental model "belum tersimpan".
- **Single scroll, bukan nested** — field di form = satu baris (truncate + `+N`); list di modal = scroll `max-h-[40vh]` + pagination 10/halaman. Tidak ada field yang scroll.
- **Pagination di picker** — reuse komponen `Pagination` (konsisten halaman lain). `PAGE_SIZE = 10`. Urutan di bawah list: bar info "Menampilkan X–Y dari Z petugas" (tanpa "Halaman A dari B" — kontrol pagination sudah menunjukkan halaman aktif, info tak redundan), lalu kontrol halaman, baru footer counter + "Selesai" (hasil review UX user: baca daftar → langsung temukan navigasi → aksi penutup paling bawah). Bar otomatis disembunyikan jika hasil hanya 1 halaman. Ganti keyword search → reset ke halaman 1; centang/hapus petugas → halaman tetap. Label "hasil" saat sedang search, "petugas" saat tidak. Selection dipertahankan lintas halaman (`selected` state global, terpisah dari `page`). Pindah halaman → list `scrollTo(0,0)` + fokus kembali ke kolom search (keyword tetap bertahan).
- **Highlight Tailwind, bukan `<mark>`** — `<span className="bg-yellow-200 rounded-sm">` konsisten cross-browser.
- **Tanpa Batal, tanpa "Pilih Semua", tanpa "Tampilkan Terpilih"** — sesederhana mungkin. Alur: buka → cari → centang → selesai. Fitur yang tidak terpakai tidak dibuat.
- **Chip `max-w-[140px]` + truncate** — nama panjang tetap terbaca semaksimal mungkin, bukan dipotong 1 kata.
- **Escape capture-phase** — picker mencegah propagasi Escape ke parent modal (kegiatan-modal) supaya hanya picker yang tertutup.
- **+N di tabel worksheet** — fix bug display sebelumnya (React render `string[]` tanpa separator → "AndiBudi" menjadi "Andi, Budi +1").
- **`type="button"` di Pagination + header close** — Final review menemukan tombol-tanpa-type di Pagination dan header × picker berada di dalam DOM `<form>` kegiatan-modal → default `submit` akan submit form saat user hanya ingin navigasi halaman. Fix: `type="button"` di shared Pagination (root cause, berlaku untuk semua caller masa depan) + picker header close. Chip remove sudah punya `type="button"`, ditambahkan `disabled={disabled}` saat saving agar konsisten.
- Zero schema/action/business logic change. Data flow tetap `string[]`.

**Files (3 code + 2 docs):**
- `src/components/petugas-picker.tsx` — NEW: komponen reusable
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: fieldset checkbox → 2× PetugasPicker
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: `petugasSummary()` helper, format sel tabel
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages ✅

### 3 Agustus 2026 — Sprint19B: Accessibility + UX Hardening

| Fitur | Status | Catatan |
|-------|--------|---------|
| A: Modal Accessibility | ✅ Selesai | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + Escape key di 5 modal: kegiatan, master-petugas, master-leading-sector, users, activity-log DetailModal. Escape di-block saat `saving`/`isPending` agar form tidak tertutup di tengah submit |
| A: aria-label lengkap | ✅ Selesai | Close button DetailModal (`&times;`) + tombol edit dokumen di `detail-client.tsx` (`title` → `aria-label`) |
| B: Reusable Pagination | ✅ Selesai | Ekstrak dari `activity-log-client.tsx` ke `src/components/pagination.tsx` — API `{ page, totalPages, onPageChange }`, presentational murni, tambah `aria-label` + `aria-current` + wrapper `<nav>`. Behaviour Activity Log tidak berubah |
| C: Multi Select Petugas | ✅ Selesai | `<select multiple size={3}>` → checkbox groups (`<fieldset>`/`<legend>` + `<input type="checkbox">`) untuk Protokol & Liputan di kegiatan modal. Data flow tetap `string[]` — zero schema/action change |

**Decisions:**
- **Accessibility tanpa abstraction** — tambahkan atribut aksesibilitas inline di 5 modal (bukan reusable wrapper). Hanya 5 modal dengan konten berbeda; ConfirmDialog sudah jadi referensi pola sejak Sprint18.
- **Escape key di-block saat loading** — `!saving`/`!isPending` agar user tidak kehilangan data form saat server action sedang berjalan (konsisten dengan ConfirmDialog yang block saat `loading`).
- **Pagination presentational murni** — routing/searchParams handling tetap di parent. Komponen siap dipakai di worksheet jika data > 50 rows.
- **Checkbox groups bukan searchable-select** — dataset kecil (~5-10 per kategori), checkbox langsung terlihat semua tanpa perlu komponen baru. ~~Upgrade ke searchable multi-select jika > 15 petugas per kategori.~~ **Sudah di-upgrade di Sprint20** → `PetugasPicker` reusable (field ringkas + picker modal + search + highlight).
- Zero schema change, zero server action change, zero business logic change, zero visual redesign — murni UX/accessibility/reusability.

**Files (7 code + 2 docs):**
- `src/components/pagination.tsx` — NEW: reusable pagination (Item B)
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: Escape + dialog attrs + checkbox groups (Item A + C)
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: Escape + dialog attrs (Item A)
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: DetailModal attrs + Escape + hapus Pagination lokal + pakai shared (Item A + B)
- `src/app/(protected)/worksheet/[id]/detail-client.tsx` — MODIFIED: `title` → `aria-label` (Item A)
- `docs/roadmap.md`, `docs/decisions.md` — MODIFIED

**Verifikasi:**
- `npx tsc --noEmit` — clean ✅
- `npm run lint` — "No ESLint warnings or errors" ✅
- `npm run build` — ✓ 14/14 pages, semua `ƒ` Dynamic (sama seperti sprint sebelumnya; `DYNAMIC_SERVER_USAGE` adalah warning pre-existing untuk route cookies/searchParams, bukan error build)

### 3 Agustus 2026 — Sprint19A (Release Blocker): Hapus demo password + Fix Activity Log Leading Sector (display-layer)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Hapus demo password di Login | ✅ Selesai | Hapus 3 baris `Akun percobaan — Admin: admin/admin123 ...` dari `login/page.tsx` — password nyata tidak lagi terekspos |
| Fix Activity Log Leading Sector (display-layer only) | ✅ Selesai | `formatFieldValue()` generic di `activity-log-client.tsx`: resolve `leadingSectorId` (string polos log lama → lookup nama via `sectorMap`; objek `{id,nama}` → `.nama`), objek/array `{id,nama}` (petugas) → nama. Backward compatible log lama & baru |
| Filter metadata keys | ✅ Selesai | `id`/`createdAt`/`updatedAt` (raw prisma object di snapshot DELETE) tidak lagi tampil di modal |
| Regression test Activity Log | ✅ Selesai | Audit semua action: HANYA `leadingSectorId` yang simpan raw CUID; petugas sudah `[{id,nama}]`; DOKUMEN/PETUGAS/LEADING_SECTOR/USER bersih. Snapshot format TIDAK diubah |

**Decisions:**
- **Fix di display-layer saja, snapshot TIDAK diubah** — sesuai prinsip "jangan ubah format data jika display-layer cukup". Semua bug #8 (log CREATE lama) & #9 (log UPDATE/DELETE) teratasi: `leadingSectorId` string → lookup live table; `[{id,nama}]` → render nama. Risiko regression minimal menjelang rilis, zero schema/arsitektur change.
- **Formatter generic, bukan hardcode** — pola objek/array dengan `nama` ditangani generik, `leadingSectorId` satu-satunya key yang butuh map lookup (string polos tak bisa diidentifikasi tipe tanpa key).
- Trade-off: log lama yang mereferensikan leading sector yang SUDAH DIHAPUS fallback ke raw CUID (nama tak recoverable). Kasus jarang — schema pakai `Restrict` untuk delete sektor yang masih dipakai.

**Files:**
- `src/app/login/page.tsx` — MODIFIED: hapus div demo password
- `src/app/(protected)/activity-log/page.tsx` — MODIFIED: + query `leadingSector.findMany`, pass `leadingSectors` prop
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: `formatFieldValue()` + `sectorMap` (useMemo) + `META_KEYS` filter, hapus `displayValue`

**Verifikasi:**
- `npx tsc --noEmit` — clean
- `npm run lint` — "No ESLint warnings or errors"
- `npm run build` — ✓ 14/14 pages (route `/activity-log` & `/login` render `ƒ` Dynamic seperti sebelumnya)

### 3 Agustus 2026 — Sprint18 (R8): Polish & Hardening (tech debt cleanup)

| Fitur | Status | Catatan |
|-------|--------|---------|
| A: ConfirmDialog untuk semua delete | ✅ Selesai | Gantikan `window.confirm` native dengan `ConfirmDialog` reusable di 4 client: worksheet, master-petugas, master-leading-sector, users. Pola `confirmDelete`/`deleteError`/`confirmDeleteAction` konsisten |
| B: Konsolidasi warna/label status | ✅ Selesai | `STATUS_KEGIATAN_CHART_COLOR` + `STATUS_KEGIATAN_CELL_CLASS` masuk ke `constants/status-kegiatan.ts` — hapus duplikat lokal di dashboard-stats & laporan-client |
| C: Konsolidasi helper tanggal | ✅ Selesai | `lib/format.ts` baru (`padDate`, `toDateInput`, `formatTanggal`) — hapus duplikat `pad`/`formatTanggal`/`toDateInput` lokal di laporan-client, kegiatan-modal, worksheet-client. Key `YYYY-MM` pakai native `String().padStart(2,'0')` |

**Decisions:**
- **Gunakan ConfirmDialog yang sudah ada** daripada `window.confirm` — konsisten, aksesibel (Escape, focus mgmt), loading state. Zero UI baru.
- **Status color/class single-source** — chart hex & tailwind cell class dipindah ke constants, diindex oleh enum value (type-safe).
- **Date helper single-source** — `lib/format.ts`. `padDate` untuk angka, `toDateInput` untuk input date `YYYY-MM-DD`, `formatTanggal` untuk `DD/MM/YYYY`. Key bulan chart/URL (`YYYY-MM`) bukan tanggung jawab helper ini → native `padStart`.
- Tidak ada perubahan visual, tidak ada perubahan schema, tidak ada migration.

**Files:**
- `src/lib/format.ts` — NEW: helper tanggal shared
- `src/lib/constants/status-kegiatan.ts` — MODIFIED: + `STATUS_KEGIATAN_CHART_COLOR`, `STATUS_KEGIATAN_CELL_CLASS`
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: ConfirmDialog delete + hapus `pad` lokal
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: pakai `toDateInput` dari `lib/format`
- `src/app/(protected)/master-petugas/master-petugas-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: ConfirmDialog delete
- `src/app/(protected)/dashboard/dashboard-stats.tsx` — MODIFIED: warna status dari constants
- `src/app/(protected)/dashboard/page.tsx` — MODIFIED: key bulan pakai `padStart`
- `src/app/(protected)/kalender/page.tsx` — MODIFIED: `fmtBulan` pakai `padStart`
- `src/app/(protected)/laporan/laporan-client.tsx` — MODIFIED: `formatTanggal` + cell class dari shared

**Verifikasi:**
- `npx tsc --noEmit` — hasil di bawah
- `npm run lint` — hasil di bawah
- `npm run build` — hasil di bawah

### 3 Agustus 2026 — Sprint17 (R7): Perihal Surat + PIC + Activity Log STAFF

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Perihal Surat | ✅ Selesai | Field `perihalSurat String?` di Kegiatan + soft duplicate warning (data tetap disimpan) |
| R2: PIC | ✅ Selesai | Field `picNama String?` + `picNoHp String?` langsung di Kegiatan (bukan master table) |
| R3: Activity Log untuk STAFF | ✅ Selesai | STAFF dapat membuka halaman Activity Log read-only (guard page + sidebar nav) |
| R4: Presence notification | ⏸️ Ditunda | Tidak diimplementasikan (edit-session/locking di luar scope Sprint17) |

**Decisions:**
- **Duplikat = soft warning, bukan block & bukan UNIQUE constraint.** Deteksi saat create/update: kombinasi `tanggal + tempat + pejabat + perihalSurat` sama persis → data TETAP disimpan, return `{ ok: true, warning: '...' }` ke UI. `ActionResult` di `lib/auth.ts` ditambah `warning?: string` (opsional, tidak merusak caller existing).
- **PIC sebagai field langsung di Kegiatan** (`picNama`, `picNoHp`) — bukan master table. Konsisten dengan keputusan user. Tidak ada FK.
- **`cekDuplikat()` helper** di `actions/kegiatan.ts` — `findFirst` dengan date range (start-of-day s/d end-of-day) + exclude self saat update. Lewati pengecekan jika `perihalSurat` kosong.
- **Semua field nullable** → data lama aman tanpa backfill. Validasi wajib/opsional ditangani di form/server action.
- **R3 minimal diff:** hanya guard `activity-log/page.tsx` + nav `app-shell.tsx`. Halaman Activity Log sudah read-only dari awal (tanpa tombol delete/edit) → STAFF tidak butuh perubahan UI.
- **Pencarian worksheet** ikut mencakup `perihalSurat` (search tambahan kecil, konsisten).

**Files (11 code):**
- `prisma/schema.prisma` — MODIFIED: `perihalSurat`, `picNama`, `picNoHp` di model Kegiatan
- `prisma/migrations/20260803120849_add_perihal_surat_and_pic/migration.sql` — NEW
- `src/lib/auth.ts` — MODIFIED: `ActionResult` + `warning?: string`
- `src/app/actions/kegiatan.ts` — MODIFIED: KegiatanInput + `cekDuplikat()` + warning di create/update
- `src/lib/worksheet.ts` — MODIFIED: KegiatanRow + 3 field baru
- `src/app/(protected)/worksheet/page.tsx` — MODIFIED: map data baru
- `src/app/(protected)/worksheet/kegiatan-modal.tsx` — MODIFIED: input Perihal Surat + Nama PIC + No. HP PIC
- `src/app/(protected)/worksheet/worksheet-client.tsx` — MODIFIED: 3 kolom tabel + 3 kolom export + search perihal + optimisic update + alert warning
- `src/app/(protected)/worksheet/[id]/page.tsx` + `detail-client.tsx` — MODIFIED: pass & tampilkan Perihal/PIC
- `src/app/(protected)/laporan/page.tsx` + `laporan-client.tsx` — MODIFIED: map data + kolom tabel + export
- `src/app/(protected)/activity-log/activity-log-client.tsx` — MODIFIED: FIELD_LABEL perihalSurat/picNama/picNoHp
- `src/app/(protected)/activity-log/page.tsx` — MODIFIED: guard `ADMIN || STAFF`
- `src/app/(protected)/app-shell.tsx` — MODIFIED: nav Activity Log untuk ADMIN + STAFF
- `prisma/seed.ts` — MODIFIED: perihalSurat + PIC di 4 kegiatan

**Verifikasi:**
- `npx prisma migrate dev` — Already in sync (migration `20260803120849_add_perihal_surat_and_pic` sudah diterapkan) ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 14/14 pages ✅
- `npm run lint` — ⚠️ pre-existing error konfigurasi ESLint (circular structure JSON, `eslint.config.mjs` + `next lint` incompatible, `eslint ^10` + `eslint-config-next ^16`). Bukan akibat Sprint17 — terjadi sebelum perubahan. Build tetap sukses (lint bukan gate build di proyek ini).

### 3 Agustus 2026 — Sprint16 (R6): Rename Role ATASAN → KEPALA_BAGIAN

| Fitur | Status | Catatan |
|-------|--------|---------|
| Rename enum Role | ✅ Selesai | `ATASAN` → `KEPALA_BAGIAN` di schema + 7 code files + docs |

**Decisions:**
- Migration manual `ALTER TYPE "Role" RENAME VALUE 'ATASAN' TO 'KEPALA_BAGIAN'` (BEGIN/COMMIT). Prisma `--create-only` menghasilkan rebuild enum (`CREATE TYPE "Role_new"` + cast + `DROP TYPE "Role_old"`) yang GAGAL jika ada user dengan role ATASAN — enum value yang sedang dipakai tidak bisa di-drop. `RENAME VALUE` (PG10+) aman: mengubah label value in-place tanpa rebuild.
- `canEditRole()` (`ADMIN || STAFF`) TIDAK berubah — KEPALA_BAGIAN tetap view-only.
- Backward compat: username `atasan` / password `atasan123` tetap — hanya nilai enum diubah.
- JWT lama dengan `role: 'ATASAN'` tidak match setelah deploy → user harus re-login (max 7 hari). Dampak minimal karena ATASAN cuma view-only.
- Permission final: ADMIN (semua akses + kelola user + activity log); STAFF (worksheet/dashboard/master data); KEPALA_BAGIAN (sama seperti STAFF, tanpa kelola user). Tidak ada perubahan dari sisi canEditRole.

**Files:**
- `prisma/schema.prisma` — MODIFIED: `Role.KEPALA_BAGIAN`
- `prisma/migrations/20260803090212_rename_role_atasan_to_kepala_bagian/migration.sql` — NEW: `ALTER TYPE "Role" RENAME VALUE`
- `src/lib/auth.ts` — MODIFIED: `SessionPayload.role` union type
- `src/app/actions/users.ts` — MODIFIED: `CreateUserInput` / `UpdateUserInput` role union
- `src/app/(protected)/users/users-client.tsx` — MODIFIED: ROLE_LABELS, state, select, option
- `src/app/(protected)/app-shell.tsx` — MODIFIED: ROLE_LABELS
- `prisma/seed.ts` — MODIFIED: `role: Role.KEPALA_BAGIAN`
- `src/app/login/page.tsx` — MODIFIED: label akun percobaan
- `docs/architecture.md`, `docs/decisions.md`, `docs/roadmap.md` — MODIFIED: referensi ATASAN → KEPALA_BAGIAN

**Verifikasi:**
- `npx prisma migrate dev` — migration applied ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — compiled successfully, 14/14 pages ✅
- Grep `ATASAN` di `src/` — tidak ada (hanya migration historis 20260717021729 yang mempertahankan nilai lama di CREATE TYPE)

### 2 Agustus 2026 — Sprint15: Rebranding SIAP-PRO + Enum KEGIATAN & TIDAK_DIRILIS

| Fitur | Status | Catatan |
|-------|--------|---------|
| R1: Branding SIAP-PRO | ✅ Selesai | Nama aplikasi di UI → "SIAP-PRO" (Sistem Informasi Agenda Pimpinan Prokompim) |
| R2: JenisPenugasan KEGIATAN | ✅ Selesai | Enum `JenisPenugasan` tambah value `KEGIATAN` (3 value: LEMBUR / SPPD / KEGIATAN) |
| R3: StatusPublikasi TIDAK_DIRILIS | ✅ Selesai | Enum `StatusPublikasi` tambah value `TIDAK_DIRILIS` (3 value: BELUM_DIRILIS / TIDAK_DIRILIS / DIRILIS) |

**Verifikasi:**
- `npx prisma migrate dev` — berhasil ✅
- `npx tsc --noEmit` — bersih ✅
- `npm run build` — berhasil ✅

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

**Verifikasi:** belum dijalankan — `npx tsc --noEmit`, `npm run build`, skenario manual (rename, rename duplikat, no-op, reset password saja, log masker, demote admin terakhir, akses STAFF/KEPALA_BAGIAN). Lihat `memory/session-sesi14.md`.

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
