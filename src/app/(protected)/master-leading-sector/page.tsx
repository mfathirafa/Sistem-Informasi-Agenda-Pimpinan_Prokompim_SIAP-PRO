import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MasterLeadingSectorClient from './master-leading-sector-client';

export default async function MasterLeadingSectorPage() {
  try {
    const user = await getCurrentUser();
    const items = await prisma.leadingSector.findMany({ orderBy: { nama: 'asc' } });
    const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
    return <MasterLeadingSectorClient initialData={items} canEdit={canEdit} />;
  } catch (error) {
    console.error('[MASTER_LEADING_SECTOR_PAGE_ERROR]', error);
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
        <p className="font-medium">Gagal memuat data leading sector.</p>
        <p className="text-sm mt-1">Silakan muat ulang halaman atau hubungi administrator.</p>
      </div>
    );
  }
}