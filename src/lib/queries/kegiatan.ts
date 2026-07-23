import { prisma } from '@/lib/prisma';

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