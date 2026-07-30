'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';

export async function createLeadingSector(nama: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  if (!nama.trim()) return { ok: false, error: 'Nama leading sector wajib diisi.' };

  const existing = await prisma.leadingSector.findUnique({ where: { nama: nama.trim() } });
  if (existing) return { ok: false, error: 'Leading sector ini sudah ada di daftar.' };

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.leadingSector.create({ data: { nama: nama.trim() } });
      await logActivity({
        entity: 'LEADING_SECTOR',
        entityId: created.id,
        action: 'CREATE',
        userId: user!.id,
        changes: { after: { nama: nama.trim() }, meta: { entityName: nama.trim() } },
      }, tx);
    });
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
    const existing = await prisma.leadingSector.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Leading sector tidak ditemukan.' };

    await prisma.$transaction(async (tx) => {
      await tx.leadingSector.delete({ where: { id } });
      await logActivity({
        entity: 'LEADING_SECTOR',
        entityId: id,
        action: 'DELETE',
        userId: user!.id,
        changes: { before: existing, meta: { entityName: existing.nama } },
      }, tx);
    });
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