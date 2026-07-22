import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import UsersClient from './users-client';

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return (
    <UsersClient
      users={users.map((u) => ({ id: u.id, username: u.username, nama: u.nama, role: u.role }))}
      currentUserId={user.id}
    />
  );
}