import { Prisma, StatusKegiatan, JenisPenugasan, StatusSambutan } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { KegiatanRow } from '@/lib/worksheet';

export async function getKegiatanDetail(id: string) {
    return prisma.kegiatan.findUnique({
        where: { id },
        include: {
            leadingSector: { select: { nama: true } },
            dokumen: {
                select: {
                    id: true,
                    jenis: true,
                    status: true,
                    link: true,
                    catatan: true,
                },
            },
        },
    });
}

// Include relasi untuk query daftar kegiatan (worksheet + export).
export const kegiatanInclude = {
    leadingSector: true,
    petugas: { include: { petugas: true } },
} satisfies Prisma.KegiatanInclude;

type KegiatanWithRelations = Prisma.KegiatanGetPayload<{ include: typeof kegiatanInclude }>;

/** Filter dari searchParams halaman worksheet (URL-driven). */
export type KegiatanFilter = {
    q?: string;
    bulan?: string; // "YYYY-MM"
    status?: string; // statusSambutan: SUDAH | BELUM
    statusKegiatan?: string;
    pejabat?: string;
    penugasan?: string; // jenisPenugasan
    sektor?: string; // leadingSectorId
    pic?: string; // picNama contains
};

/**
 * Bangun Prisma where dari filter URL + window tanggal (3 bulan terakhir).
 * Dipakai bersama page.tsx (tabel + count) dan export action agar
 * hasil filter tabel == hasil export (satu sumber kebenaran).
 */
export function buildKegiatanWhere(filters: KegiatanFilter, fromDate?: Date): Prisma.KegiatanWhereInput {
    const where: Prisma.KegiatanWhereInput = {};

    // Gabungan window (fromDate) dan filter bulan → rentang tanggal.
    let gte: Date | undefined = fromDate;
    let lt: Date | undefined;
    if (filters.bulan) {
        const [y, m] = filters.bulan.split('-').map(Number);
        const monthStart = new Date(y, m - 1, 1);
        if (!gte || monthStart > gte) gte = monthStart;
        lt = new Date(y, m, 1); // awal bulan berikutnya
    }
    if (gte || lt) {
        where.tanggal = {
            ...(gte ? { gte } : {}),
            ...(lt ? { lt } : {}),
        };
    }

    if (filters.q) {
        where.OR = [
            { namaKegiatan: { contains: filters.q, mode: 'insensitive' } },
            { tempat: { contains: filters.q, mode: 'insensitive' } },
            { perihalSurat: { contains: filters.q, mode: 'insensitive' } },
            { pejabat: { contains: filters.q, mode: 'insensitive' } },
            { picNama: { contains: filters.q, mode: 'insensitive' } },
            { picNoHp: { contains: filters.q, mode: 'insensitive' } },
            { leadingSector: { is: { nama: { contains: filters.q, mode: 'insensitive' } } } },
        ];
    }
    if (filters.status === 'SUDAH' || filters.status === 'BELUM') {
        where.statusSambutan = filters.status as StatusSambutan;
    }
    if (filters.statusKegiatan && (Object.values(StatusKegiatan) as string[]).includes(filters.statusKegiatan)) {
        where.statusKegiatan = filters.statusKegiatan as StatusKegiatan;
    }
    if (filters.pejabat) where.pejabat = filters.pejabat;
    if (filters.penugasan && (Object.values(JenisPenugasan) as string[]).includes(filters.penugasan)) {
        where.jenisPenugasan = filters.penugasan as JenisPenugasan;
    }
    if (filters.sektor) where.leadingSectorId = filters.sektor;
    if (filters.pic) where.picNama = { contains: filters.pic, mode: 'insensitive' };

    return where;
}

/** Mapping hasil query kegiatan → bentuk baris worksheet (KegiatanRow). */
export function mapKegiatanToRow(k: KegiatanWithRelations): KegiatanRow {
    return {
        id: k.id,
        namaKegiatan: k.namaKegiatan,
        tanggal: k.tanggal.toISOString(),
        waktu: k.waktu,
        tempat: k.tempat,
        pejabat: k.pejabat,
        perihalSurat: k.perihalSurat,
        picNama: k.picNama,
        picNoHp: k.picNoHp,
        leadingSectorId: k.leadingSectorId,
        leadingSectorNama: k.leadingSector.nama,
        statusSambutan: k.statusSambutan,
        statusKegiatan: k.statusKegiatan,
        petugasProtokolIds: k.petugas.filter((p) => p.petugas.kategori === 'PROTOKOL').map((p) => p.petugas.id),
        petugasProtokolNama: k.petugas.filter((p) => p.petugas.kategori === 'PROTOKOL').map((p) => p.petugas.nama),
        petugasLiputanIds: k.petugas.filter((p) => p.petugas.kategori === 'LIPUTAN').map((p) => p.petugas.id),
        petugasLiputanNama: k.petugas.filter((p) => p.petugas.kategori === 'LIPUTAN').map((p) => p.petugas.nama),
        linkUpload: k.linkUpload,
        catatan: k.catatan,
        jenisPenugasan: k.jenisPenugasan,
        statusPublikasi: k.statusPublikasi,
    };
}
