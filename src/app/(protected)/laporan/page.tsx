import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LaporanClient from './laporan-client';
import { type Prisma } from "@prisma/client";

type Props = {
    searchParams: Promise<{ startDate?: string; endDate?: string }>;
};

function mapPetugasByKategori(
    petugas: Array<{ petugas: { id: string; nama: string; kategori: string } }>,
    kategori: string,
) {
    const filtered = petugas.filter((p) => p.petugas.kategori === kategori);
    return {
        ids: filtered.map((p) => p.petugas.id),
        names: filtered.map((p) => p.petugas.nama),
    } ;
}

export default async function LaporanPage({ searchParams }: Props) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    try {
        const params = await searchParams;
        const rawStart = params.startDate;
        const rawEnd = params.endDate;

        const now = new Date();
        const startDate = rawStart
            ? new Date(rawStart)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = rawEnd ? new Date(rawEnd) : now;

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date');
        }

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        const where: Prisma.KegiatanWhereInput = {
            tanggal: { gte: startDate, lte: endOfDay },
        };

        const kegiatan = await prisma.kegiatan.findMany({
            where,
            orderBy: { tanggal: 'asc' },
            include: { leadingSector: true, petugas: { include: { petugas: true } } },
        });

        const data = kegiatan.map((k) => {
            const protokol = mapPetugasByKategori(k.petugas, 'PROTOKOL');
            const liputan = mapPetugasByKategori(k.petugas, 'LIPUTAN');
            return {
                id: k.id,
                namaKegiatan: k.namaKegiatan,
                tanggal: k.tanggal.toISOString(),
                waktu: k.waktu,
                tempat: k.tempat,
                pejabat: k.pejabat,
                perihalSurat: k.perihalSurat,
                nomorSurat: k.nomorSurat,
                dresscode: k.dresscode,
                picNama: k.picNama,
                picNoHp: k.picNoHp,
                leadingSectorId: k.leadingSectorId,
                leadingSectorNama: k.leadingSector.nama,
                statusSambutan: k.statusSambutan,
                statusKegiatan: k.statusKegiatan,
                petugasProtokolIds: protokol.ids,
                petugasProtokolNama: protokol.names,
                petugasLiputanIds: liputan.ids,
                petugasLiputanNama: liputan.names,
                linkUpload: k.linkUpload,
                catatan: k.catatan,
                jenisPenugasan: k.jenisPenugasan,
                statusPublikasi: k.statusPublikasi,
            };
        });

        return (
            <LaporanClient
                data={data}
                startDate={startDate.toISOString().split('T')[0]}
                endDate={endDate.toISOString().split('T')[0]}
            />
        );
    } catch (error) {
        console.error('[LAPORAN_PAGE_ERROR]', error);
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
                <p className="font-medium">Gagal memuat data laporan.</p>
                <p className="text-sm mt-1">Silahkan muat ulang halaman atau hubungi administrator.</p>
            </div>
        );
    }
}