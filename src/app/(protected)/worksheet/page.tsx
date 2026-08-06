import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buildKegiatanWhere, mapKegiatanToRow, kegiatanInclude, type KegiatanFilter } from '@/lib/queries/kegiatan';
import WorksheetClient from './worksheet-client';

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WorksheetPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  try {
    const params = await searchParams;
    const rawPage = Number(params.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const filters: KegiatanFilter = {
      q: typeof params.q === 'string' ? params.q : undefined,
      tahun: typeof params.tahun === 'string' ? params.tahun : undefined,
      bulan: typeof params.bulan === 'string' ? params.bulan : undefined,
      status: typeof params.status === 'string' ? params.status : undefined,
      statusKegiatan: typeof params.statusKegiatan === 'string' ? params.statusKegiatan : undefined,
      pejabat: typeof params.pejabat === 'string' ? params.pejabat : undefined,
      penugasan: typeof params.penugasan === 'string' ? params.penugasan : undefined,
      sektor: typeof params.sektor === 'string' ? params.sektor : undefined,
      pic: typeof params.pic === 'string' ? params.pic : undefined,
    };

    // Opsional: Batasi data agar tidak menarik ribuan histori dari tahun-tahun lama
    // Misalnya: Tarik data dari 3 bulan yang lalu ke depan
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const where = buildKegiatanWhere(filters, threeMonthsAgo);

    // Hitung total terlebih dahulu agar page bisa di-clamp sebelum findMany.
    const total = await prisma.kegiatan.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);

    const [kegiatan, dates, petugasProtokol, petugasLiputan, leadingSectors] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        orderBy: { tanggal: 'asc' },
        include: kegiatanInclude,
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.kegiatan.findMany({
        select: { tanggal: true },
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
    ]);

    const data = kegiatan.map(mapKegiatanToRow);

    // opsi filter tahun dari seluruh data di database (bukan hanya halaman aktif).
    // Urut turun tahun terbaru di atas.
    const tahunOptions = Array.from(
      new Set(dates.map((d) => d.tanggal.getFullYear()))
    ).sort((a, b) => b - a).map(String);

    return (
      <WorksheetClient
        initialData={data}
        total={total}
        page={safePage}
        pageSize={PAGE_SIZE}
        filters={filters}
        tahunOptions={tahunOptions}
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
