import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MasterPetugasClient from './master-petugas-client';

export default async function MasterPetugasPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  let petugas = [];
  try {
    petugas = await prisma.petugas.findMany({ 
      orderBy: { nama: 'asc' } 
    });
  } catch (error) {
    console.error('[FETCH_PETUGAS_ERROR]', error);
    // Kirim array kosong sebagai fallback jika database bermasalah
  }

  return <MasterPetugasClient initialData={petugas} canEdit={canEdit} />;
}