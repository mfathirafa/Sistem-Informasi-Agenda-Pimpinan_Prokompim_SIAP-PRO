# Prompt Lanjutan — Sprint24B-2 (Leading Sector)

Salin-tempel prompt ini di sesi berikutnya:

```
Lanjut Sprint24B-2 (Leading Sector). Cek perubahan dulu sebelum lanjut.

1. Baca `src/lib/constants/kategori-leading-sector.ts` dan `src/app/actions/leading-sector.ts`.
   Verifikasi 2 bug kecil ini sudah difix atau belum:
   - CREATE logActivity `changes`: `kategori` masih di luar `after`? Harus di dalam `{ after: { nama, kategori } }`.
   - DELETE error: `di${usageCount}` — spasi hilang, harus `di ${usageCount}`.
   Kalau belum, minta diff fix-nya dulu.

2. Setelah itu kerjakan Tahap 3: update `src/app/(protected)/master-leading-sector/master-leading-sector-client.tsx` (TAMPILKAN DIFF, jangan full file):
   - Search input (filter nama, client-side)
   - Filter kategori dropdown: Semua / 9 opsi / "Belum Dikategorikan"
   - Pagination (PAGE_SIZE 20, reuse komponen `Pagination`) — reset ke halaman 1 saat search/filter berubah
   - Kolom Kategori di tabel + chip; NULL tampil "-"
   - Select kategori di form Tambah & modal Edit
   - Pesan error jelas saat delete ditolak ("masih dipakai di N kegiatan") — tampil di bawah grid
   - Pertahankan desain UI yang ada, hanya tambah fitur
   - `master-leading-sector/page.tsx` TIDAK berubah (Prisma sudah return kategori)

3. Setelah 3 file selesai, minta user jalankan:
   - `npx tsc --noEmit`
   - `npm run build`
   Laporkan hasil + ringkas perubahan. Catat progress di `docs/roadmap.md`.
```

Catatan konteks:
- Sprint24B-1 (Dashboard) sudah selesai & diverifikasi.
- Field `kategori String?` sudah ada sejak migration Sprint24A — **zero migration baru**.
- Tahap 1 (constants) & Tahap 2 (actions) sudah diapply user; Tahap 3 belum.
- Detail teknis Tahap 3 ada di `memory/session-sesi25.md`.
