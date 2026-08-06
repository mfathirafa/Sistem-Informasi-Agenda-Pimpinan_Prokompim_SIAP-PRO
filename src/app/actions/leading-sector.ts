'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canEditRole, type ActionResult } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';
import { KATEGORI_LEADING_SECTOR_OPTIONS } from '@/lib/constants/kategori-leading-sector';

export async function createLeadingSector(nama: string, kategori: string | null): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  if (!nama.trim()) return { ok: false, error: 'Nama leading sector wajib diisi.' };

  const existing = await prisma.leadingSector.findUnique({ where: { nama: nama.trim() } });
  if (existing) return { ok: false, error: 'Leading sector ini sudah ada di daftar.' };

  const validKategori = kategori && kategori.trim().length > 0 ? kategori.trim() : null;
  if (validKategori && !(KATEGORI_LEADING_SECTOR_OPTIONS as readonly string[]).includes(validKategori)) {
    return { ok: false, error: 'Kategori tidak valid.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.leadingSector.create({ data: { nama: nama.trim(), kategori: validKategori } });
      await logActivity({
        entity: 'LEADING_SECTOR',
        entityId: created.id,
        action: 'CREATE',
        userId: user!.id,
        changes: { after: { nama: nama.trim() , kategori: validKategori }, meta: { entityName: nama.trim() } },
      }, tx);
    });
    revalidatePath('/master-leading-sector');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menambah leading sector.' };
  }
}

export async function updateLeadingSector(id: string, nama: string, kategori: string | null): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };

  const trimmed = nama.trim();
  if (!trimmed) return { ok: false, error: 'Nama leading sector wajib diisi.' };

  const validKategori = kategori && kategori.trim().length > 0 ? kategori.trim() : null;
  if (validKategori && !(KATEGORI_LEADING_SECTOR_OPTIONS as readonly string[]).includes(validKategori)) {
    return { ok: false, error: 'Kategori tidak valid.' };
  }

  try {
    const existing = await prisma.leadingSector.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Leading sector tidak ditemukan.' };

    // No-op guard -- nama tidak berubah, langsung sukses tanpa menulis DB/log.
    if (existing.nama === trimmed && existing.kategori === validKategori) return { ok: true };

    // Cek duplikat, kecuali record itu sendiri (konsisten dengan createLeadingSector).
    const duplicate = await prisma.leadingSector.findFirst({
      where: { nama: trimmed, NOT: { id } },
    });
    if (duplicate) return { ok: false, error: 'Leading sector ini sudah ada di daftar.' };

    await prisma.$transaction(async (tx) => {
      await tx.leadingSector.update({ where: { id }, data: { nama: trimmed, kategori: validKategori } });
      await logActivity({
        entity: 'LEADING_SECTOR',
        entityId: id,
        action: 'UPDATE',
        userId: user!.id,
        changes: { before: { nama: existing.nama, kategori: existing.kategori }, after: { nama: trimmed, kategori: validKategori }, meta: { entityName: trimmed } },
      }, tx);
    });
      revalidatePath('/master-leading-sector');
      revalidatePath('/worksheet');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Gagal memperbarui leading sector.' };
    }
  }

export async function deleteLeadingSector(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!canEditRole(user?.role)) return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };

  try {
    const existing = await prisma.leadingSector.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Leading sector tidak ditemukan.' };

    // Safe delete: cek penggunaan sebelum menghapus.
    const usageCount = await prisma.kegiatan.count({ where: { leadingSectorId: id } });
    if (usageCount > 0) {
      return { ok: false, error: Tidak bisa dihapus: masih dipakai di${usageCount} kegiatan. };
    }

    await prisma.$transaction(async (tx) => {
      await tx.leadingSector.delete({ where: { id } });
      await logActivity({
        entity: 'LEADING_SECTOR',
        entityId: id,
        action: 'DELETE',
        userId: user!.id,
        changes: { before: { nama: existing.nama, kategori: existing.kategori }, meta: { entityName: existing.nama } },
      }, tx);
    });
    revalidatePath('/master-leading-sector');
    revalidatePath('/worksheet');
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Gagal menghapus leading sector.',
    };
  }
}