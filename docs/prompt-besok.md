# Prompt Lanjutan — Sprint25: Fitur Operasional

Salin-tempel prompt ini di sesi berikutnya:

```
Lanjutkan Sprint25: Fitur Operasional di docs/roadmap.md

Task yang sudah selesai:
- Task 1: Skip (export lokal sudah bekerja)
- Task 2: Sudah (saveDokumenKegiatan terintegrasi)
- Task 6: Sudah (gedung-kpt.jpg ada)

Task yang perlu dikerjakan:
- Task 7: Hapus unused imports (dokumen.ts:8, users.ts:7)
- Task 5: Ganti alert() dengan toast (install sonner + edit 3 file)
- Task 3: Verifikasi allCrew behavior
- Task 4: Activity Log di Detail Kegiatan
- Task 8: Redesign Print/PDF Laporan

Urutan pengerjaan: Task 7 → Task 5 → Task 3 → Task 4 → Task 8

Mulai dari Task 7 (hapus unused imports), tunjukkan kode BEFORE/AFTER.
```

---

## Catatan Konteks (18 Agustus 2026)

### Task 7: Hapus Unused Imports

**File 1: `src/app/actions/dokumen.ts` — Line 8**

BEFORE:
```typescript
import { logActivity } from "@/lib/activity-log";
import { before } from "node:test";

type DokumenUpdateInput = {
```

AFTER:
```typescript
import { logActivity } from "@/lib/activity-log";

type DokumenUpdateInput = {
```

**File 2: `src/app/actions/users.ts` — Line 7**

BEFORE:
```typescript
import { logActivity } from '@/lib/activity-log';
import { after, before } from 'node:test';

export type CreateUserInput = {
```

AFTER:
```typescript
import { logActivity } from '@/lib/activity-log';

export type CreateUserInput = {
```

---

### Task 5: Ganti alert() dengan Toast

**Step 1: Install sonner**
```
npm install sonner
```

**Step 2: Edit `src/app/layout.tsx`**

Tambahkan:
- Import: `import { Toaster } from 'sonner';`
- Sebelum `</body>`: `<Toaster position="top-right" richColors />`

**Step 3: Edit `src/app/(protected)/worksheet/worksheet-client.tsx`**

Tambahkan:
- Import: `import { toast } from 'sonner';`

Ganti 3 alert():
- Line ~157: `alert(res.warning)` → `toast.warning(res.warning)`
- Line ~159: `alert(res.error || 'Gagal menyimpan.')` → `toast.error(res.error || 'Gagal menyimpan.')`
- Line ~185: `alert(res.error || 'Gagal mengekspor.')` → `toast.error(res.error || 'Gagal mengekspor.')`

---

### Task 3: Verifikasi allCrew Behavior

**Yang sudah ada:**
- Checkbox "Semua crew Protokol/Liputan" di `kegiatan-modal.tsx`
- Label picker berubah saat checkbox aktif: "Pilih Penanggung Jawab (opsional)"
- Field `allCrewProtokol`/`allCrewLiputan` di schema (migration Sprint24F)

**Perlu verifikasi:**
- Apakah flag tersimpan ke database saat create/update
- Apakah display di worksheet/laporan sudah benar ("Semua crew (PJ: ...)")

---

### Task 4: Activity Log di Detail Kegiatan

**Langkah:**
1. Tambah query di `lib/activity-log.ts`: `getActivityLogByEntity(entityId)`
2. Query: `WHERE entity = 'KEGIATAN' AND entityId = ?` ORDER BY createdAt DESC
3. Buat timeline component sederhana
4. Tambahkan section di `detail-client.tsx`

---

### Task 8: Redesign Print/PDF Laporan

**Masalah saat ini:**
- Row terlalu tinggi, whitespace berlebih
- 16 kolom terlalu banyak, semua sempit
- Data terpotong ellipsis
- Header/footer belum resmi
- Browser timestamp muncul

**Target desain:**
- A4 Landscape
- Kop surat resmi:
  ```
  PEMERINTAH KABUPATEN BREBES
  SEKRETARIAT DAERAH
  BAGIAN PROTOKOL DAN KOMUNIKASI PIMPINAN
  ```
- Judul: LAPORAN KEGIATAN PROTOKOL
- Periode laporan + total kegiatan
- Header tabel repeat setiap halaman
- No ellipsis, wrap natural
- Footer: nama sistem + nomor halaman
- Format tanggal Indonesia

**Usulan Laporan Ringkas (9 kolom):**
1. Tanggal Pelaksanaan
2. Nama Kegiatan
3. Tempat
4. Pejabat
5. Waktu
6. Leading Sector
7. Petugas Protokol
8. Petugas Liputan
9. Status Kegiatan

---

## File yang Berubah (direncanakan)

| Task | File |
|------|------|
| 7 | `src/app/actions/dokumen.ts`, `src/app/actions/users.ts` |
| 5 | `src/app/layout.tsx`, `src/app/(protected)/worksheet/worksheet-client.tsx` |
| 3 | Tidak ada (verifikasi saja) |
| 4 | `src/lib/activity-log.ts`, `src/app/(protected)/worksheet/[id]/detail-client.tsx` |
| 8 | `src/app/(protected)/laporan/laporan-client.tsx` |

---

## Verifikasi Setelah Selesai

- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Update `docs/roadmap.md` dengan status task
