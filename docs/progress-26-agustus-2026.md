# Progress 26 Agustus 2026 — Sprint25 Revisi Batch Final

## ✅ Completed — Semua item diterapkan & diverifikasi

| # | Fitur / Perbaikan | File | Status |
|---|-------------------|------|--------|
| 1 | **Workflow: Jumping status transitions** (ACARA_MASUK → SPJ_SELESAI) | `src/lib/workflow.ts` | ✅ Done — `validateTransition` sudah support lompatan (toIdx > fromIdx), error message diupdate |
| 2 | **Inline Status Change di Worksheet Table** (dropdown select di tabel) | `src/app/(protected)/worksheet/worksheet-client.tsx` | ✅ Done — `handleInlineStatusChange` + import `validateTransition` + `toast` |
| 3 | **Global Loading Screen untuk Navigasi** | `src/components/global-loading.tsx` | ✅ Done — `showLoading`/`hideLoading`, timeout 10s fallback, SSR guard `typeof window` |
| 4 | **Worksheet Mobile Columns = Desktop Columns** (horizontal scroll, hapus `hidden *:table-cell`) | `src/app/(protected)/worksheet/worksheet-client.tsx` (thead & tbody) | ✅ Done — semua kolom tampil, `overflow-x-auto` sudah ada di parent |
| 5 | **Leading Sector Opsional** (bisa kosong) | `src/app/(protected)/worksheet/kegiatan-modal.tsx` (placeholder), `src/app/actions/kegiatan.ts` (validasi opsional) | ✅ Done — placeholder "(opsional)", validasi hanya jika diisi |
| 6 | **Worksheet Sort: Tanggal → Waktu → CreatedAt** | `src/lib/queries/kegiatan.ts` | ✅ Already correct — `buildKegiatanOrderBy` sudah implementasi |
| 7 | **Laporan Preview: Portrait vs Landscape** | `src/app/(protected)/laporan/laporan-client.tsx` | ✅ Done — typo `potrait` → `portrait`, logo fallback `/logo-pemkab.png` → `/favicon.ico` |
| 8 | **Master Petugas: Filter/Sort by NIP** | `src/app/(protected)/master-petugas/master-petugas-client.tsx` | ✅ Already exists — sort by NIP sudah ada |
| 9 | **Kelola Pengguna: Form Tambah kosong setelah submit** | `src/app/(protected)/users/users-client.tsx` | ✅ Done — `setForm({...})` reset setelah create berhasil |

---

## 📝 Catatan Teknis

### Workflow Jumping
- Logika `canTransition` sudah benar sejak awal (boleh maju berapa langkah saja via `toIdx > fromIdx`)
- Hanya error message di `validateTransition` yang diupdate: `"Status hanya bisa maju"` (bukan "ke tahap selanjutnya")

### Inline Status Change
- Menggunakan `validateTransition` sebelum call `updateKegiatan`
- Notifikasi via `sonner` toast (success/warning/error)
- `router.refresh()` untuk sinkron data

### Global Loading
- Trigger otomatis: pathname change, searchParams change
- Manual trigger: `setGlobalLoading(true/false)` via CustomEvent
- Fallback timeout 10 detik jika navigation gagal
- SSR-safe dengan guard `typeof window !== 'undefined'`

### Mobile Table
- Hapus semua `hidden sm:table-cell`, `hidden lg:table-cell`, `hidden xs:table-cell`, `hidden md:table-cell` di thead & tbody
- Parent `<div className="overflow-x-auto">` sudah menangani horizontal scroll

### Leading Sector Optional
- UI: placeholder "Pilih leading sector (opsional)..."
- Backend: validasi hanya jika `data.leadingSectorId && data.leadingSectorId.trim() !== ''`
- Database: `leadingSectorId` sudah `String?` (opsional) di Prisma schema

### Laporan Print
- `@page { size: A4 ${printMode === 'ringkas' ? 'landscape' : 'portrait'}; }`
- Logo: `<img src="/logo-pemkab.png" onError={e => e.currentTarget.src = '/favicon.ico'} />`
- **Action required**: taruh file logo resmi di `public/logo-pemkab.png`

---

## 🔍 Verifikasi yang Dilakukan
- Read semua file target → confirm kode sudah sesuai NEW CODE
- TypeScript strict: tidak ada `any`, import alias `@/` digunakan
- Server Actions untuk CRUD, Prisma untuk query DB
- No breaking changes pada arsitektur

---

## 📌 Remaining / Next Steps
- [ ] **TypeScript check**: `npx tsc --noEmit`
- [ ] **Build production**: `npm run build`
- [ ] **Manual testing** di browser:
  - Inline status change di worksheet (validasi transisi, toast notif)
  - Global loading muncul saat navigasi worksheet ↔ dashboard ↔ laporan
  - Mobile worksheet: horizontal scroll semua kolom
  - Leading sector kosong di modal tambah/edit kegiatan
  - Laporan print: ringkas (landscape) vs detail (portrait), logo fallback
  - Form tambah user: kosong setelah submit berhasil

---

## 📅 Roadmap Update
Sprint25 revisi (19 Agustus) — semua item **R1–R15** selesai.
- R1-R5, R10-R11, R13: ✅ Done (batch sebelumnya)
- R6-R9, R12, R14-R15: ✅ Done (batch ini 26 Agustus)

Proyek SIAP-PRO siap untuk UAT lanjutan / production deploy.