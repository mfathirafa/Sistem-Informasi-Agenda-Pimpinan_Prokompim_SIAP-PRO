'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export type ActionResult = { ok: boolean; error?: string };

function canEditRole(role: string | undefined) {
  return role === 'ADMIN' || role === 'STAFF';
}

export async function createLeadingSector(nama: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  if (!nama.trim()) return { ok: false, error: 'Nama leading sector wajib diisi.' };

  const existing = await prisma.leadingSector.findUnique({ where: { nama: nama.trim() } });
  if (existing) return { ok: false, error: 'Leading sector ini sudah ada di daftar.' };

  try {
    await prisma.leadingSector.create({ data: { nama: nama.trim() } });
    revalidatePath('/master-leading-sector');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menambah leading sector.' };
  }
}

export async function deleteLeadingSector(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };

  try {
    await prisma.leadingSector.delete({ where: { id } });
    revalidatePath('/master-leading-sector');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Gagal menghapus. Kemungkinan leading sector ini masih dipakai di data kegiatan.',
    };
  }
}