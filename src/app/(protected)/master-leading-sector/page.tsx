import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MasterLeadingSectorClient from './master-leading-sector-client';

export default async function MasterLeadingSectorPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  let items = [];
  try {
    items = await prisma.leadingSector.findMany({ 
      orderBy: { nama: 'asc' } 
    });
  } catch (error) {
    console.error('[FETCH_LEADING_SECTOR_ERROR]', error);
    // Jika database gagal, kita lempar array kosong agar aplikasi tidak crash
  }

  return <MasterLeadingSectorClient initialData={items} canEdit={canEdit} />;
}