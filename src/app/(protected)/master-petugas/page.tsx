 import { prisma } from '@/lib/prisma';
  import { getCurrentUser } from '@/lib/auth';
  import MasterPetugasClient from './master-petugas-client';

  export default async function MasterPetugasPage() {
    try {
      const user = await getCurrentUser();
      const petugas = await prisma.petugas.findMany({ orderBy: { nama: 'asc' } });
      const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
      return <MasterPetugasClient initialData={petugas} canEdit={canEdit} />;
    } catch (error) {
      console.error('[MASTER_PETUGAS_PAGE_ERROR]', error);
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
          <p className="font-medium">Gagal memuat data petugas.</p>
          <p className="text-sm mt-1">Silakan muat ulang halaman atau hubungi administrator.</p>
        </div>
      );
    }
  }