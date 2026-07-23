'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';

export type PetugasInput = {
  nama: string;
  jabatan?: string;
  noHp?: string;
  statusAktif: boolean;
};

export async function createPetugas(data: PetugasInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  if (!data.nama.trim()) return { ok: false, error: 'Nama wajib diisi.' };

  try {
    await prisma.petugas.create({ data });
    revalidatePath('/master-petugas');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menambah petugas.' };
  }
}

export async function updatePetugas(id: string, data: PetugasInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  if (!data.nama.trim()) return { ok: false, error: 'Nama wajib diisi.' };

  try {
    await prisma.petugas.update({ where: { id }, data });
    revalidatePath('/master-petugas');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal memperbarui petugas.' };
  }
}

export async function deletePetugas(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };

  try {
    await prisma.petugas.delete({ where: { id } });
    revalidatePath('/master-petugas');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Gagal menghapus petugas. Kemungkinan petugas ini masih terpakai di data kegiatan — nonaktifkan saja daripada dihapus.',
    };
  }
}