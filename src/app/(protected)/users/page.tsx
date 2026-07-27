import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import UsersClient from './users-client';

export default async function UsersPage() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') redirect('/dashboard');

    const users = await prisma.user.findMany({ 
      orderBy: { createdAt: 'asc' },
      select: { id: true, username: true, nama: true, role: true },
    });
    return (
      <UsersClient
        users={users.map((u) => ({ id: u.id, username: u.username, nama: u.nama, role: u.role }))}
        currentUserId={user.id}
      />
    );
  } catch (error) {
    console.error('[USERS_PAGE_ERROR]', error);
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
        <p className="font-medium">Gagal memuat data pengguna.</p>
        <p className="text-sm mt-1">Silakan muat ulang halaman atau hubungi administrator.</p>
      </div>
    );
  }
}