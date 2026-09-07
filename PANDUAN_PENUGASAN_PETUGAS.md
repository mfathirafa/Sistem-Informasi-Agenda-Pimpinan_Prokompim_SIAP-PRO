# Panduan Perubahan Konsep Penugasan Petugas (Protokol & Liputan Fleksibel)

Dokumen ini berisi panduan lengkap langkah-langkah dan perubahan kode (*Before & After*, nomor baris, dan file path) untuk mengubah konsep penugasan petugas di SIAP-PRO.

---

## Latar Belakang & Tujuan
Saat ini, setiap petugas di tabel Master Petugas dikunci secara permanen pada kategori tertentu (`PROTOKOL` atau `LIPUTAN`). Pada praktiknya di Bagian Prokompim, ada kasus di mana pegawai yang tercatat sebagai Liputan (misal: Angga dan Aron) ditugaskan sebagai Protokol pada kegiatan tertentu.

**Tujuan:**
1. Membuka pilihan dropdown pada form kegiatan agar **seluruh petugas aktif** dapat dipilih, baik sebagai **Petugas Protokol** maupun **Petugas Liputan**.
2. Menyimpan penugasan berdasarkan **peran riil di kegiatan tersebut** (`peran`), bukan semata-mata mengandalkan kategori permanen di tabel Master Petugas.
3. Menjamin data lama tetap terbaca normal (*backward compatible*).

---

## Langkah 1: Update Skema Database (Prisma)

### File: `prisma/schema.prisma`
Tambahkan field `peran KategoriPetugas @default(PROTOKOL)` pada model `KegiatanPetugas`, dan masukkan `peran` ke dalam primary key gabungan `@@id`.

* **Lokasi Baris:** Sekitar baris 150–160
* **Before:**
```prisma
model KegiatanPetugas {
  kegiatanId String
  kegiatan   Kegiatan @relation(fields: [kegiatanId], references: [id], onDelete: Cascade)
  petugasId  String
  petugas    Petugas  @relation(fields: [petugasId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@id([kegiatanId, petugasId])
  @@index([petugasId])
  @@map("kegiatan_petugas")
}
```

* **After:**
```prisma
model KegiatanPetugas {
  kegiatanId String
  kegiatan   Kegiatan        @relation(fields: [kegiatanId], references: [id], onDelete: Cascade)
  petugasId  String
  petugas    Petugas         @relation(fields: [petugasId], references: [id], onDelete: Cascade)
  peran      KategoriPetugas @default(PROTOKOL)
  createdAt  DateTime        @default(now())

  @@id([kegiatanId, petugasId, peran])
  @@index([petugasId])
  @@map("kegiatan_petugas")
}
```

---

## Langkah 2: Sinkronkan Skema Database & Generate Client

Buka terminal di root project, lalu jalankan dua perintah berikut:
```bash
npx prisma db push
npx prisma generate
```

---

## Langkah 3: Update Kode Aplikasi

### 1. `src/app/(protected)/worksheet/page.tsx`
Mengambil semua petugas aktif satu kali untuk diteruskan ke pilihan form modal Protokol dan Liputan.

* **Lokasi Baris:** 61–80
* **Before:**
```typescript
    const [kegiatan, dates, petugasProtokol, petugasLiputan, leadingSectors] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        orderBy: buildKegiatanOrderBy(sort, dir),
        include: kegiatanInclude,
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.kegiatan.findMany({
        select: { tanggal: true },
      }),
      prisma.petugas.findMany({
        where: { statusAktif: true, kategori: 'PROTOKOL' },
        orderBy: { nama: 'asc' }
      }),
      prisma.petugas.findMany({
        where: { statusAktif: true, kategori: 'LIPUTAN' },
        orderBy: { nama: 'asc' }
      }),
      prisma.leadingSector.findMany({
        orderBy: { nama: 'asc' }
      }),
    ]);
```
* **After:**
```typescript
    const [kegiatan, dates, allPetugas, leadingSectors] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        orderBy: buildKegiatanOrderBy(sort, dir),
        include: kegiatanInclude,
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.kegiatan.findMany({
        select: { tanggal: true },
      }),
      prisma.petugas.findMany({
        where: { statusAktif: true },
        orderBy: { nama: 'asc' },
      }),
      prisma.leadingSector.findMany({
        orderBy: { nama: 'asc' },
      }),
    ]);
```

* **Lokasi Baris:** Sekitar baris 99–100
* **Before:**
```tsx
        petugasProtokolOptions={petugasProtokol.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
        petugasLiputanOptions={petugasLiputan.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
```
* **After:**
```tsx
        petugasProtokolOptions={allPetugas.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
        petugasLiputanOptions={allPetugas.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
```

---

### 2. `src/app/actions/kegiatan.ts`

#### Perubahan 2.1: Validasi Petugas saat `createKegiatan`
* **Lokasi Baris:** Sekitar baris 99–115
* **Before:**
```typescript
    // Validasi petugas sesuai kategori
    if (petugasProtokolIds.length > 0) {
      const valid = await prisma.petugas.count({
        where: { id: { in: petugasProtokolIds }, kategori: 'PROTOKOL' },
      });
      if (valid !== petugasProtokolIds.length) {
        return { ok: false, error: 'Petugas Protokol tidak valid.' };
      }
    }
    if (petugasLiputanIds.length > 0) {
      const valid = await prisma.petugas.count({
        where: { id: { in: petugasLiputanIds }, kategori: 'LIPUTAN'},
      });
      if (valid !== petugasLiputanIds.length) {
        return { ok: false, error: 'Petugas Liputan tidak valid.'};
      }
    }
```
* **After:**
```typescript
    // Validasi petugas: pastikan seluruh ID petugas terdaftar di database
    if (petugasProtokolIds.length > 0) {
      const valid = await prisma.petugas.count({
        where: { id: { in: petugasProtokolIds } },
      });
      if (valid !== petugasProtokolIds.length) {
        return { ok: false, error: 'Petugas Protokol tidak valid.' };
      }
    }
    if (petugasLiputanIds.length > 0) {
      const valid = await prisma.petugas.count({
        where: { id: { in: petugasLiputanIds } },
      });
      if (valid !== petugasLiputanIds.length) {
        return { ok: false, error: 'Petugas Liputan tidak valid.' };
      }
    }
```

#### Perubahan 2.2: Simpan Nilai `peran` saat `createKegiatan`
* **Lokasi Baris:** Sekitar baris 142–147
* **Before:**
```typescript
          petugas: {
            create: [
              ...petugasProtokolIds.map((id) => ({ petugasId: id })),
              ...petugasLiputanIds.map((id) => ({ petugasId: id })),
            ],
          },
```
* **After:**
```typescript
          petugas: {
            create: [
              ...petugasProtokolIds.map((id) => ({ petugasId: id, peran: 'PROTOKOL' as const })),
              ...petugasLiputanIds.map((id) => ({ petugasId: id, peran: 'LIPUTAN' as const })),
            ],
          },
```

#### Perubahan 2.3: Validasi Petugas saat `updateKegiatan`
* **Lokasi Baris:** Sekitar baris 208–224
* **Before:**
```typescript
  // Validasi petugas sesuai kategori
  if (petugasProtokolIds.length > 0) {
    const valid = await prisma.petugas.count({
      where: { id: { in: petugasProtokolIds }, kategori: 'PROTOKOL'},
    });
    if (valid !== petugasProtokolIds.length) {
      return { ok: false, error: 'Petugas Protokol tidak valid.' };
    }
  }
  if (petugasLiputanIds.length > 0) {
    const valid = await prisma.petugas.count({
      where: { id: {in: petugasLiputanIds }, kategori: 'LIPUTAN'},
    });
    if (valid !== petugasLiputanIds.length) {
      return { ok: false, error: 'Petugas Liputan tidak valid.' };
    }
  }
```
* **After:**
```typescript
  // Validasi petugas: pastikan seluruh ID petugas terdaftar di database
  if (petugasProtokolIds.length > 0) {
    const valid = await prisma.petugas.count({
      where: { id: { in: petugasProtokolIds } },
    });
    if (valid !== petugasProtokolIds.length) {
      return { ok: false, error: 'Petugas Protokol tidak valid.' };
    }
  }
  if (petugasLiputanIds.length > 0) {
    const valid = await prisma.petugas.count({
      where: { id: { in: petugasLiputanIds } },
    });
    if (valid !== petugasLiputanIds.length) {
      return { ok: false, error: 'Petugas Liputan tidak valid.' };
    }
  }
```

#### Perubahan 2.4: Diff Activity Log Petugas saat `updateKegiatan`
* **Lokasi Baris:** Sekitar baris 252–260
* **Before:**
```typescript
  const existingProtokol = existingAssignments
    .filter((a) => a.petugas.kategori === 'PROTOKOL')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const existingLiputan = existingAssignments
    .filter((a) => a.petugas.kategori === 'LIPUTAN')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));
```
* **After:**
```typescript
  const existingProtokol = existingAssignments
    .filter((a) => (a.peran ?? a.petugas.kategori) === 'PROTOKOL')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const existingLiputan = existingAssignments
    .filter((a) => (a.peran ?? a.petugas.kategori) === 'LIPUTAN')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));
```

#### Perubahan 2.5: Simpan Nilai `peran` saat `updateKegiatan`
* **Lokasi Baris:** Sekitar baris 321–327
* **Before:**
```typescript
        petugas: {
          deleteMany: {},
          create: [
            ...petugasProtokolIds.map((id) => ({ petugasId: id })),
            ...petugasLiputanIds.map((id) => ({ petugasId: id })),
          ],
        },
```
* **After:**
```typescript
        petugas: {
          deleteMany: {},
          create: [
            ...petugasProtokolIds.map((id) => ({ petugasId: id, peran: 'PROTOKOL' as const })),
            ...petugasLiputanIds.map((id) => ({ petugasId: id, peran: 'LIPUTAN' as const })),
          ],
        },
```

---

### 3. `src/lib/queries/kegiatan.ts`
Membaca pengelompokan petugas berdasarkan `p.peran` kegiatan (dengan fallback ke `kategori` master untuk data lama).

* **Lokasi Baris:** Sekitar baris 142–145
* **Before:**
```typescript
        petugasProtokolIds: k.petugas.filter((p) => p.petugas.kategori === 'PROTOKOL').map((p) => p.petugas.id),
        petugasProtokolNama: k.petugas.filter((p) => p.petugas.kategori === 'PROTOKOL').map((p) => p.petugas.nama),
        petugasLiputanIds: k.petugas.filter((p) => p.petugas.kategori === 'LIPUTAN').map((p) => p.petugas.id),
        petugasLiputanNama: k.petugas.filter((p) => p.petugas.kategori === 'LIPUTAN').map((p) => p.petugas.nama),
```
* **After:**
```typescript
        petugasProtokolIds: k.petugas.filter((p) => (p.peran ?? p.petugas.kategori) === 'PROTOKOL').map((p) => p.petugas.id),
        petugasProtokolNama: k.petugas.filter((p) => (p.peran ?? p.petugas.kategori) === 'PROTOKOL').map((p) => p.petugas.nama),
        petugasLiputanIds: k.petugas.filter((p) => (p.peran ?? p.petugas.kategori) === 'LIPUTAN').map((p) => p.petugas.id),
        petugasLiputanNama: k.petugas.filter((p) => (p.peran ?? p.petugas.kategori) === 'LIPUTAN').map((p) => p.petugas.nama),
```

---

### 4. `src/app/(protected)/laporan/page.tsx`
Menyesuaikan fungsi pembacaan data laporan agar membaca `p.peran`.

* **Lokasi Baris:** Sekitar baris 12–21
* **Before:**
```typescript
function mapPetugasByKategori(
    petugas: Array<{ petugas: { id: string; nama: string; kategori: string } }>,
    kategori: string,
) {
    const filtered = petugas.filter((p) => p.petugas.kategori === kategori);
    return {
        ids: filtered.map((p) => p.petugas.id),
        names: filtered.map((p) => p.petugas.nama),
    } ;
}
```
* **After:**
```typescript
function mapPetugasByKategori(
    petugas: Array<{ peran?: string; petugas: { id: string; nama: string; kategori: string } }>,
    kategori: string,
) {
    const filtered = petugas.filter((p) => (p.peran ?? p.petugas.kategori) === kategori);
    return {
        ids: filtered.map((p) => p.petugas.id),
        names: filtered.map((p) => p.petugas.nama),
    };
}
```

---

## Verifikasi Akhir
Setelah semua perubahan diterapkan:
1. Jalankan pengecekan TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Coba buka form tambah/edit kegiatan:
   * Pilih pegawai Liputan (seperti Angga / Aron) di kolom **Petugas Protokol**.
   * Simpan, lalu pastikan di tabel Worksheet dan Laporan pegawai tersebut tampil di kolom Petugas Protokol.
