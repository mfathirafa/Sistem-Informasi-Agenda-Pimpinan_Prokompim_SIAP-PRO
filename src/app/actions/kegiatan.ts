'use server';

import { revalidatePath } from 'next/cache';
import { JENIS_DOKUMEN_OPTIONS } from '@/lib/constants/status-dokumen';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { StatusKegiatanValue } from '@/lib/constants/status-kegiatan';
import { validateTransition } from '@/lib/workflow';

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
  jenisPenugasan: 'LEMBUR' | 'SPPD';
  statusPublikasi: 'BELUM_DIRILIS' | 'DIRILIS';
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
    await prisma.kegiatan.create({
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
    const existing = await prisma.kegiatan.findUnique({ where: { id }, select: { statusKegiatan: true } });
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
        where: { id: {in: petugasLiputanIds }, kategori: 'LIPUTAN' },
      });
      if (valid !== petugasLiputanIds.length) {
        return { ok: false, error: 'Petugas Liputan tidak valid.' };
      }
    }

    await prisma.kegiatan.update({
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
    await prisma.kegiatan.delete({ where: { id } });
    revalidatePath('/worksheet');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menghapus kegiatan.' };
  }
}