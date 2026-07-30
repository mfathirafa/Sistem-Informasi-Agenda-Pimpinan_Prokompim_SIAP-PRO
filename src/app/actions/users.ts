'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword, type ActionResult } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';

export type CreateUserInput = {
  username: string;
  password: string;
  nama: string;
  role: 'ADMIN' | 'STAFF' | 'ATASAN';
};

export async function createUser(data: CreateUserInput): Promise<ActionResult> {
  const current = await getCurrentUser();
  if (current?.role !== 'ADMIN') {
    return { ok: false, error: 'Hanya admin yang bisa mengelola pengguna.' };
  }

  const username = data.username.trim();
  if(username.length < 3) {
    return { ok: false, error:'Nama pengguna minimal 3 karakter.'};
  }
  if(data.password.length < 6) {
    return { ok: false, error:'Kata sandi minimal 6 karakter.' };
  }
  if(!data.nama.trim()) {
    return { ok: false, error:'Nama wajib diisi.' };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { ok: false, error: 'Nama pengguna sudah dipakai.' };
  }

  try {
    const hashed = await hashPassword(data.password);
    const { password: _, ...dataWithoutPassword } = data;
    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { username: data.username, password: hashed, nama: data.nama, role: data.role },
      });
      await logActivity({
      entity: 'USER',
      entityId: created.id,
      action: 'CREATE',
      userId: current!.id,
      changes: { after: dataWithoutPassword, meta: { entityName: dataWithoutPassword.nama } },
    }, tx);
    }) 
    revalidatePath('/users');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menambah pengguna.' };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const current = await getCurrentUser();
  if (current?.role !== 'ADMIN') {
    return { ok: false, error: 'Hanya admin yang bisa mengelola pengguna.' };
  }
  if (current.id === id) {
    return { ok: false, error: 'Tidak bisa menghapus akun sendiri.' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Pengguna tidak ditemukan.' };

    const { password: _, ...existingWithoutPassword } = existing;
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id } });
      await logActivity({
        entity: 'USER',
        entityId: id,
        action: 'DELETE',
        userId: current!.id,
        changes: { before: existingWithoutPassword, meta: { entityName: existingWithoutPassword.nama } },
      }, tx);
    });
    revalidatePath('/users');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menghapus pengguna.' };
  }
}
