'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export type ActionResult = { ok: boolean; error?: string };

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

  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) {
    return { ok: false, error: 'Nama pengguna sudah dipakai.' };
  }

  try {
    const hashed = await hashPassword(data.password);
    await prisma.user.create({
      data: { username: data.username, password: hashed, nama: data.nama, role: data.role },
    });
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
    await prisma.user.delete({ where: { id } });
    revalidatePath('/users');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menghapus pengguna.' };
  }
}
