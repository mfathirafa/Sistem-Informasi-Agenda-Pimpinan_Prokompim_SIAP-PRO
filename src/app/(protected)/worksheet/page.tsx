import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import WorksheetClient from './worksheet-client';

export default async function WorksheetPage() {
  const user = await getCurrentUser();
  const kegiatan = await prisma.kegiatan.findMany({ orderBy: { tanggal: 'asc' } });

  const data = kegiatan.map((k) => ({
    id: k.id,
    namaKegiatan: k.namaKegiatan,
    tanggal: k.tanggal.toISOString(),
    waktu: k.waktu,
    tempat: k.tempat,
    pejabat: k.pejabat,
    leadingSector: k.leadingSector,
    statusSambutan: k.statusSambutan,
    petugasProtokol: k.petugasProtokol,
    petugasLiputan: k.petugasLiputan,
    linkUpload: k.linkUpload,
    catatan: k.catatan,
  }));

  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return <WorksheetClient initialData={data} canEdit={canEdit} />;
}
