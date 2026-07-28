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

    const [kegiatan, petugasProtokol, petugasLiputan, leadingSectors] = await Promise.all([
      prisma.kegiatan.findMany({
        where: {
          tanggal: { gte: threeMonthsAgo },
        },
        orderBy: { tanggal: 'asc' },
        include: { leadingSector: true, petugas: { include: { petugas: true } } },
      }),
      prisma.petugas.findMany({
        where: { statusAktif: true, kategori: 'PROTOKOL' },
        orderBy: { nama: 'asc' }
      }),
      prisma.petugas.findMany({
        where: { statusAktif: true, kategori: 'LIPUTAN' },
        orderBy: { nama: 'asc' }
      }),
      prisma.leadingSector.findMany({
        orderBy: { nama: 'asc' }
      }),
    ])

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
      statusKegiatan: k.statusKegiatan,
      petugasProtokolIds: k.petugas
        .filter((p) => p.petugas.kategori === 'PROTOKOL')
        .map((p) => p.petugas.id),
      petugasProtokolNama: k.petugas
        .filter((p) => p.petugas.kategori === 'PROTOKOL')
        .map((p) => p.petugas.nama),
      petugasLiputanIds: k.petugas
        .filter((p) => p.petugas.kategori === 'LIPUTAN')
        .map((p) => p.petugas.id),
      petugasLiputanNama: k.petugas
        .filter((p) => p.petugas.kategori === 'LIPUTAN')
        .map((p) => p.petugas.nama),
      linkUpload: k.linkUpload,
      catatan: k.catatan,
      jenisPenugasan: k.jenisPenugasan,
      statusPublikasi: k.statusPublikasi,
    }));

    return (
      <WorksheetClient
        initialData={data}
        canEdit={canEdit}
        petugasProtokolOptions={petugasProtokol.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
        petugasLiputanOptions={petugasLiputan.map((p) => ({ id: p.id, label: p.nama, sublabel: p.jabatan || undefined }))}
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