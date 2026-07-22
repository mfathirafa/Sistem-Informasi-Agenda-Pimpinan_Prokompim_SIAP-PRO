import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MasterPetugasClient from './master-petugas-client';

export default async function MasterPetugasPage() {
  const user = await getCurrentUser();
  const petugas = await prisma.petugas.findMany({ orderBy: { nama: 'asc' } });
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
  return <MasterPetugasClient initialData={petugas} canEdit={canEdit} />;
}