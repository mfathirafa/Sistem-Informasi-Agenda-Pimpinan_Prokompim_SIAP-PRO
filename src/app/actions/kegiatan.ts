'use server';

import { revalidatePath } from 'next/cache';
import { JENIS_DOKUMEN_OPTIONS } from '@/lib/constants/status-dokumen';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { StatusKegiatanValue } from '@/lib/constants/status-kegiatan';

export type KegiatanInput = {
  namaKegiatan: string;
  tanggal: string;
  waktu?: string;
  tempat: string;
  pejabat: string;
  leadingSectorId: string;
  statusSambutan: 'SUDAH' | 'BELUM';
  statusKegiatan: StatusKegiatanValue;
  petugasProtokolId?: string | null;
  petugasLiputanId?: string | null;
  linkUpload?: string;
  catatan?: string;
  isLembur?: boolean;
};

export async function createKegiatan(data: KegiatanInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  try {
    await prisma.kegiatan.create({
      data: {
        ...data,
        tanggal: new Date(data.tanggal),
        // Nested create - Prisma menjalankan ini sebagai satu transaksi atomik;
        // kegiatan + 7 dokumen wajib berhasil dibuat semua, atau gagal semua
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
    await prisma.kegiatan.update({
      where: { id },
      data: { ...data, tanggal: new Date(data.tanggal) },
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