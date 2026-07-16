'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/auth';

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !password) {
    return { error: 'Nama pengguna dan kata sandi wajib diisi.' };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: 'Nama pengguna atau kata sandi salah.' };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: 'Nama pengguna atau kata sandi salah.' };
  }

  const token = await createSessionToken({
    id: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role,
  });
  await setSessionCookie(token);
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
