import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MasterLeadingSectorClient from './master-leading-sector-client';

export default async function MasterLeadingSectorPage() {
  const user = await getCurrentUser();
  const items = await prisma.leadingSector.findMany({ orderBy: { nama: 'asc' } });
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
  return <MasterLeadingSectorClient initialData={items} canEdit={canEdit} />;
}