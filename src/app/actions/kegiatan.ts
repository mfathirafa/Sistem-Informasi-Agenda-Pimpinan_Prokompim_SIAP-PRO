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

export type KegiatanInput = {
  namaKegiatan: string;
  tanggal: string;
  waktu?: string;
  tempat: string;
  pejabat: string;
  leadingSectorId: string;
  statusSambutan: 'SUDAH' | 'BELUM';
  statusKegiatan: StatusKegiatanValue;
  petugasProtokolIds: string[];
  petugasLiputanIds: string[];
  linkUpload?: string;
  catatan?: string;
  jenisPenugasan: JenisPenugasanValue;
  statusPublikasi: StatusPublikasiValue;
};

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
    if (!data.leadingSectorId) return { ok: false, error: 'Leading sector wajib dipilih.' };

    // Validasi leading sector ada di database
    const leadingExists = await prisma.leadingSector.count({
      where: { id: data.leadingSectorId },
    });
    if (!leadingExists) return { ok: false, error: 'Leading sector tidak valid.' };
    
    const { petugasProtokolIds, petugasLiputanIds, ...kegiatanData } = data;

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
    await prisma.$transaction(async (tx) => {
      const created = await tx.kegiatan.create({
        data: {
          ...kegiatanData,
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
    return { ok: true };
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
    if (!data.leadingSectorId) return { ok: false, error: 'Leading sector wajib dipilih.' };

    // Validasi leading sector ada di database
  const leadingExists = await prisma.leadingSector.count({
    where: { id: data.leadingSectorId },
  });
  if (!leadingExists) return { ok: false, error: 'Leading sector tidak valid.' };

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
  const dataForDiff = kegiatanData as Record<string, unknown>;
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

  await prisma.$transaction(async (tx) => {
    await tx.kegiatan.update({
      where: { id },
      data: {
        ...kegiatanData,
        tanggal: new Date(data.tanggal),
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
  return { ok: true };
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