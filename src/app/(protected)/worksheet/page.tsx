import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import WorksheetClient from './worksheet-client';

export default async function WorksheetPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  try {
    // Opsional: Batasi data agar tidak menarik ribuan histori dari tahun-tahun lama
    // Misalnya: Tarik data dari 3 bulan yang lalu ke depan
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [kegiatan, petugas, leadingSectors] = await Promise.all([
      prisma.kegiatan.findMany({
        where: {
          tanggal: { gte: threeMonthsAgo }, // <-- Filter batas waktu
        },
        orderBy: { tanggal: 'asc' },
        include: { leadingSector: true, petugasProtokol: true, petugasLiputan: true },
      }),
      prisma.petugas.findMany({ 
        where: { statusAktif: true }, 
        orderBy: { nama: 'asc' } 
      }),
      prisma.leadingSector.findMany({ 
        orderBy: { nama: 'asc' } 
      }),
    ]);

    const data = kegiatan.map((k) => ({
      id: k.id,
      namaKegiatan: k.namaKegiatan,
      tanggal: k.tanggal.toISOString(),
      waktu: k.waktu,
      tempat: k.tempat,
      pejabat: k.pejabat,
      leadingSectorId: k.leadingSectorId,
      leadingSectorNama: k.leadingSector.nama,
      statusSambutan: k.statusSambutan,
      petugasProtokolId: k.petugasProtokolId,
      petugasProtokolNama: k.petugasProtokol?.nama || null,
      petugasLiputanId: k.petugasLiputanId,
      petugasLiputanNama: k.petugasLiputan?.nama || null,
      linkUpload: k.linkUpload,
      catatan: k.catatan,
    }));

    return (
      <WorksheetClient
        initialData={data}
        canEdit={canEdit}
        petugasOptions={petugas.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
        leadingSectorOptions={leadingSectors.map((l) => ({ id: l.id, label: l.nama }))}
      />
    );
  } catch (error) {
    console.error('[WORKSHEET_PAGE_ERROR]', error);
    // Tampilkan UI error yang lebih ramah jika database gagal
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
        <p className="font-medium">Gagal memuat data worksheet.</p>
        <p className="text-sm mt-1">Silakan muat ulang halaman atau hubungi administrator.</p>
      </div>
    );
  }
}