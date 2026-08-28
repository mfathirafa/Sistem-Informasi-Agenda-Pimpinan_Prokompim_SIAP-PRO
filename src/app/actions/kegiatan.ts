'use server';

import { revalidatePath } from 'next/cache';
import { JENIS_DOKUMEN_OPTIONS } from '@/lib/constants/status-dokumen';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { StatusKegiatanValue } from '@/lib/constants/status-kegiatan';
import { JenisPenugasanValue } from '@/lib/constants/status-penugasan';
import { StatusPublikasiValue } from '@/lib/constants/status-publikasi';
import { validateTransition } from '@/lib/workflow';
import { logActivity } from '@/lib/activity-log';
import { buildKegiatanWhere, buildKegiatanOrderBy, mapKegiatanToRow, kegiatanInclude, type KegiatanFilter } from '@/lib/queries/kegiatan';

export type KegiatanInput = {
  namaKegiatan: string;
  tanggal: string;
  waktu?: string;
  tempat: string;
  pejabat: string;
  perihalSurat?: string;
  nomorSurat?: string;
  dresscode?: string;
  picNama?: string;
  picNoHp?: string;
  leadingSectorId: string | null;
  statusSambutan: 'SUDAH' | 'BELUM';
  statusKegiatan: StatusKegiatanValue;
  petugasProtokolIds: string[];
  petugasLiputanIds: string[];
  allCrewProtokol?: boolean;
  allCrewLiputan?: boolean;
  linkUpload?: string;
  catatan?: string;
  jenisPenugasan: JenisPenugasanValue;
  statusPublikasi: StatusPublikasiValue;
};

/**
 * Deteksi kemungkinan data duplikat (soft warning, tidak memblokir simpan).
 * Duplikat = kombinasi tanggal + tempat + pejabat + perihalSurat sama persis.
 */
async function cekDuplikat(
  tanggal: string,
  tempat: string,
  pejabat: string,
  perihalSurat: string | undefined,
  excludeId?: string,
): Promise<boolean> {
  if (!perihalSurat?.trim()) return false; // tanpa perihal, lewati pengecekan
  const start = new Date(tanggal);
  start.setHours(0, 0, 0, 0);
  const end = new Date(tanggal);
  end.setHours(23, 59, 59, 999);
  const dup = await prisma.kegiatan.findFirst({
    where: {
      tanggal: { gte: start, lte: end },
      tempat,
      pejabat,
      perihalSurat,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, namaKegiatan: true },
  });
  return Boolean(dup);
}

export async function createKegiatan(data: KegiatanInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  try {
    // Validasi field wajib
    if (!data.namaKegiatan.trim()) return { ok: false, error: 'Nama kegiatan wajib diisi.' };
    if (!data.tanggal) return { ok: false, error: 'Tanggal wajib diisi.' };
    if (!data.tempat.trim()) return { ok: false, error: 'Tempat wajib diisi.' };
    
    const { petugasProtokolIds, petugasLiputanIds, ...kegiatanData } = data;
    
    // Normalisasi leading sector: kosong atau "-" -> null
    const leadingSectorId =
      data.leadingSectorId && data.leadingSectorId.trim() !== '' && data.leadingSectorId !== '-'
        ? data.leadingSectorId.trim()
        : null;
      
    // Validasi leading sector hnya jika diisi (opsional)
    if (leadingSectorId) {
      const leadingExists = await prisma.leadingSector.count({
        where: { id: leadingSectorId },
      });
      if (!leadingExists) return { ok: false, error: 'Leading sector tidak valid.' };
    }

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
    // Normalisasi nomorSurat/dresscode: kosong -> null.
    const nomorSurat = data.nomorSurat?.trim() || null;
    const dresscode = data.dresscode?.trim() || null;

    // Validasi unik per tahun: nomorSurat yang diisi wajib unik dalam tahun yang sama.
    if (nomorSurat) {
      const tahun = new Date(data.tanggal).getFullYear();
      const dup = await prisma.kegiatan.findFirst({
        where: {
          nomorSurat,
          tanggal: { gte: new Date(tahun,0,1), lt: new Date(tahun +1,0,1) },
        },
        select: { id: true },
      });
      if (dup) return { ok: false, error: `Nomor surat ${nomorSurat} sudah dipakai di tahun ${tahun}.` };
    }
    const duplikat = await cekDuplikat(data.tanggal, data.tempat, data.pejabat, data.perihalSurat);

    await prisma.$transaction(async (tx) => {
      const created = await tx.kegiatan.create({
        data: {
          ...kegiatanData,
          leadingSectorId,
          nomorSurat,
          dresscode,
          tanggal: new Date(data.tanggal),
          petugas: {
            create: [
              ...petugasProtokolIds.map((id) => ({ petugasId: id })),
              ...petugasLiputanIds.map((id) => ({ petugasId: id })),
            ],
          },
          dokumen: {
            create: JENIS_DOKUMEN_OPTIONS.map((jenis) => ({ jenis })),
          },
        },
      });
      await logActivity({
        entity: 'KEGIATAN',
        entityId: created.id,
        action: 'CREATE',
        userId: user!.id,
        changes: { after: kegiatanData, meta: { entityName: kegiatanData.namaKegiatan } },
      }, tx);
    });
    revalidatePath('/worksheet');
    revalidatePath('/dashboard');
    return duplikat
      ? { ok: true, warning: 'Kegiatan dengan perihal, tanggal, tempat, dan pejabat yang sama sudah ada. Periksa kembali apakah ini benar-benar kegiatan baru.' }
      : { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menyimpan kegiatan.' };
  }
}

export async function updateKegiatan(id: string, data: KegiatanInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  try {
    const existing = await prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      return { ok: false, error: 'Kegiatan tidak ditemukan.' };
    }

    const error = validateTransition(existing.statusKegiatan, data.statusKegiatan);
    if (error) return { ok: false, error };

    // Validasi field wajib
    if (!data.namaKegiatan.trim()) return { ok: false, error: 'Nama kegiatan wajib diisi.' };
    if (!data.tanggal) return { ok: false, error: 'Tanggal wajib diisi.' };
    if (!data.tempat.trim()) return { ok: false, error: 'Tempat wajib diisi.' };

    // Normalisasi leading sector: kosong atau "-" -> null
    const leadingSectorId = 
      data.leadingSectorId && data.leadingSectorId.trim() !== '' && data.leadingSectorId !== '-'
        ? data.leadingSectorId.trim()
        : null;
    
    // Validasi leading sector hanya jika diisi (opsional)
    if (leadingSectorId) {
      const leadingExists = await prisma.leadingSector.count({
        where: { id: leadingSectorId },
      });
      if (!leadingExists) return { ok: false, error: 'Leading sector tidak valid.' };
    }


  const { petugasProtokolIds, petugasLiputanIds, ...kegiatanData } = data;

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

  // --- scalar diff ---
  const dataForDiff = { ...kegiatanData, leadingSectorId } as Record<string, unknown>;
  const beforeSnapshot: Record<string, unknown> = {};
  const afterSnapshot: Record<string, unknown> = {};
  let hasDiff = false;

  for (const key of Object.keys(dataForDiff)) {
    let beforeVal: unknown = (existing as Record<string, unknown>)[key];
    let afterVal: unknown = dataForDiff[key];
    if (key === 'tanggal') {
      beforeVal = beforeVal instanceof Date ? beforeVal.toISOString().split('T')[0] : String(beforeVal ?? '');
      afterVal = String(afterVal ?? '');
    }
    if (String(beforeVal ?? '') !== String(afterVal ?? '')) {
      beforeSnapshot[key] = beforeVal;
      afterSnapshot[key] = afterVal;
      hasDiff = true;
    }
  }

  // --- petugas diff ---
  const existingAssignments = await prisma.kegiatanPetugas.findMany({
    where: { kegiatanId: id },
    include: { petugas: { select: { id: true, nama: true, kategori: true } } },
  });

  const existingProtokol = existingAssignments
    .filter((a) => a.petugas.kategori === 'PROTOKOL')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const existingLiputan = existingAssignments
    .filter((a) => a.petugas.kategori === 'LIPUTAN')
    .map((a) => ({ id: a.petugasId, nama: a.petugas.nama }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const newProtokolIds = [...new Set(petugasProtokolIds)].sort();
  const newLiputanIds = [...new Set(petugasLiputanIds)].sort();

  const protokolChanged = 
    existingProtokol.length !== newProtokolIds.length ||
    existingProtokol.some((p, i) => p.id !== newProtokolIds[i]);
  
  const liputanChanged = 
    existingLiputan.length !== newLiputanIds.length ||
    existingLiputan.some((p, i) => p.id !== newLiputanIds[i]);
  
  if (protokolChanged || liputanChanged) {
    const allNewIds = [...newProtokolIds, ...newLiputanIds];
    const nameMap = new Map(
      (await prisma.petugas.findMany({
        where: { id: { in: allNewIds } },
        select: { id: true, nama: true },
      })).map((p) => [p.id, p.nama]),
    );

    beforeSnapshot.petugasProtokol = existingProtokol;
    afterSnapshot.petugasProtokol = newProtokolIds.map((id) => ({ id, nama: nameMap.get(id) ?? id }));
    beforeSnapshot.petugasLiputan = existingLiputan;
    afterSnapshot.petugasLiputan = newLiputanIds.map((id) => ({ id, nama: nameMap.get(id) ?? id }));
    hasDiff = true;
  }

  // -- no-op guard ---
  if (!hasDiff) return { ok: true };

  // Normalisasi nomorSurat/dresscode: kosong -> null,
  const nomorSurat = data.nomorSurat?.trim() || null;
  const dresscode = data.dresscode?.trim() || null;

  // Validasi unik per tahun (kecuali record ini sendiri).
  if (nomorSurat) {
    const tahun = new Date(data.tanggal).getFullYear();
    const dup = await prisma.kegiatan.findFirst({
      where: {
        nomorSurat,
        tanggal: { gte: new Date(tahun,0,1), lt: new Date(tahun +1,0,1) },
        NOT: { id },
      },
      select: { id:true },
    });
    if (dup) return { ok: false, error: `Nomor surat ${nomorSurat} sudah dipakai di tahun ${tahun}.` };
  }

  const duplikat = await cekDuplikat(data.tanggal, data.tempat, data.pejabat, data.perihalSurat, id);

  await prisma.$transaction(async (tx) => {
    await tx.kegiatan.update({
      where: { id },
      data: {
        ...kegiatanData,
        leadingSectorId,
        tanggal: new Date(data.tanggal),
        nomorSurat,
        dresscode,
        petugas: {
          deleteMany: {},
          create: [
            ...petugasProtokolIds.map((id) => ({ petugasId: id })),
            ...petugasLiputanIds.map((id) => ({ petugasId: id })),
          ],
        },
      },
    });
    await logActivity({
      entity: 'KEGIATAN',
      entityId: id,
      action: 'UPDATE',
      userId: user!.id,
      changes: { before: beforeSnapshot, after: afterSnapshot, meta: { entityName: kegiatanData.namaKegiatan } },
    }, tx);
  });
  revalidatePath('/worksheet');
  revalidatePath('/dashboard');
  return duplikat
    ? { ok: true, warning: 'Kegiatan dengan perihal, tanggal, tempat, dan pejabat yang sama sudah ada. Periksa kembali apakah ini benar-benar kegiatan baru.' }
    : { ok: true };
  } catch {
    return { ok: false, error: 'Gagal memperbarui kegiatan.' };
  }
}

export async function deleteKegiatan(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  try {
    const existing = await prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      return { ok: false, error: 'Kegiatan tidak ditemukan.' };
    }
    await prisma.$transaction(async (tx) => {
      await tx.kegiatan.delete({ where: { id } });
      await logActivity({
        entity: 'KEGIATAN',
        entityId: id,
        action: 'DELETE',
        userId: user!.id, 
        changes: { before: existing, meta: { entityName: existing.namaKegiatan } },
      }, tx);
    });
    revalidatePath('/worksheet');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menghapus kegiatan.' };
  }
}

/** Ambil semua kegiatan hasil filter aktif untuk export Excel (tanpa pagination).
 * Client hanya memegang 1 halaman — action ini mengembalikan seluruh hasil filter. */
export async function getKegiatanExport(filters: KegiatanFilter) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: 'Sesi berakhir. Silakan login kembali.' };
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const where = buildKegiatanWhere(filters, threeMonthsAgo);
  const kegiatan = await prisma.kegiatan.findMany({
    where,
    orderBy: buildKegiatanOrderBy(filters.sort, filters.dir),
    include: kegiatanInclude,
  });
  return { ok: true as const, data: kegiatan.map(mapKegiatanToRow) };
}