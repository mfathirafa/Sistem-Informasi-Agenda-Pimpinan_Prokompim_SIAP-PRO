'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';

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
    await prisma.$transaction(async (tx) => {
      const created = await tx.petugas.create({ data });
      await logActivity({
        entity: 'PETUGAS',
        entityId: created.id,
        action: 'CREATE',
        userId: user!.id,
        changes: { after: data, meta: { entityName: data.nama } },
      }, tx);
    });
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
    const existing = await prisma.petugas.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Petugas tidak ditemukan.' };

    const dataForDiff = data as Record<string, unknown>;
    const beforeSnapshot: Record<string, unknown> = {};
    const afterSnapshot: Record<string, unknown> = {};
    for (const key of Object.keys(dataForDiff)) {
      const beforeVal = String((existing as Record<string, unknown>)[key] ?? '');
      const afterVal = String(dataForDiff[key] ?? '');
      if (beforeVal !== afterVal) {
        beforeSnapshot[key] = (existing as Record<string, unknown>)[key];
        afterSnapshot[key] = dataForDiff[key];
      }
    }

    const hasDiff = Object.keys(beforeSnapshot).length > 0;
    if (!hasDiff) return { ok: true };

    await prisma.$transaction(async (tx) => {
      await tx.petugas.update({ where: { id }, data });
      await logActivity({
        entity: 'PETUGAS',
        entityId: id,
        action: 'UPDATE',
        userId: user!.id,
        changes: { before: beforeSnapshot, after: afterSnapshot, meta: { entityName: data.nama } },
      }, tx);
    });
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
    const existing = await prisma.petugas.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Petugas tidak ditemukan'};

    await prisma.$transaction(async (tx) => {
      await tx.petugas.delete({ where: { id } });
      await logActivity({
        entity: 'PETUGAS',
        entityId: id,
        action: 'DELETE',
        userId: user!.id,
        changes: { before: existing, meta: { entityName: existing.nama } },
      }, tx);
    });
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