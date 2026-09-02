import { PrismaClient } from "@prisma/client";
import { count } from "console";

const prisma = new PrismaClient();

// Daftar nama petugas dummy September
const DUMMY_PETUGAS_SEPTEMBER = [
    'Rian Hidayat', 'Dewi Lestari', 'Ahmad Fauzi', 'Bambang Irawan', 'Siti Nurhaliza',
    'Aron Prabowo', 'Fajar Nugroho', 'Dimas Prasetyo', 'Rizki Kurniawan', 'Eko Prasojo'
];

// Daftar nama leading sector dummy September
const DUMMY_SEKTOR_SEPTEMBER = [
        'Bagian Protokol dan Komunikasi Pimpinan',
        'Bagian Umum Setda',
        'Bagian Organisasi dan Tata Laksana',
        'Bagian Hukum Setda',
        'Bagian Perekonomian dan SDA',
        'Bagian Tata Pemerintahan',
        'Badan Perencanaan Pembangunan, Penelitian dan Pengembangan Daerah (Bappeda)',
        'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
        'Badan Kepegawaian dan Pengembangan SDM Daerah (BKPSDMD)',
        'Badan Penanggulangan Bencana Daerah (BPBD)',
        'Dinas Komunikasi, Informatika dan Statistik (Diskominfo)',
        'Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR)',
        'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
        'Dinas Kesehatan (Dinkes)',
        'Dinas Pertanian dan Ketahanan Pangan (DPKP)',
        'Dinas Koperasi, Usaha Mikro dan Perdagangan (Dinkopumdag)',
        'Dinas Sosial (Dinsos)',
        'Dinas Lingkungan Hidup dan Pengelolaan Sampah (DLHPS)',
        'Dinas Perhubungan (Dishub)',
        'Dinas Pemberdayaan Masyarakat dan Desa (Dinpermades)',
        'Satuan Polisi Pamong Praja (Satpol PP)',
];
 
async function main() {
    console.log('--- Membersihkan Data Kegiatan, Petugas, & Sektor September ---');

    // Rentang: 1 September 2026 s.d. 2 Oktober 2026 (mengakomodasi data yang melompat kareba timezone)
    const startUtc = new Date(Date.UTC(2026, 8, 1, 0, 0, 0));
    const endUtc = new Date(Date.UTC(2026, 9, 2, 23, 59, 59, 999));

    const kegiatanSeptember = await prisma.kegiatan.findMany({
        where: {
            tanggal: {
                gte: startUtc,
                lte: endUtc,
            },
        },
        select: { id: true },
    });

    const ids = kegiatanSeptember.map((k) => k.id);

    const result = await prisma.$transaction(async (tx) => {
       // Hapus child data kegiatan
       const activityLog = ids.length > 0 ? await tx.activityLog.deleteMany({ where: { entityId: { in: ids } } }) : { count: 0 };
       const kegiatanPetugas = ids.length > 0 ? await tx.kegiatanPetugas.deleteMany({ where: { kegiatanId: { in: ids } } }) : { count: 0 };
       const dokumen = ids.length > 0 ? await tx.dokumen.deleteMany({ where: { kegiatanId: { in: ids } } }) : { count: 0 };
       const kegiatan = ids.length > 0 ? await tx.kegiatan.deleteMany({ where: { id: { in: ids } } }): { count: 0 };

       // Hapus Petugas dummy September (hanya jika tidak dipakai di kegiatan lain)
       const petugas = await tx.petugas.deleteMany({
        where: {
            nama: { in: DUMMY_PETUGAS_SEPTEMBER },
            kegiatan: { none: {} },
        },
       });

       // Hapus Leading Sector dummy September (hanya jika tidak dipakau di kegiatan lain)
       const leadingSector = await tx.leadingSector.deleteMany({
        where: {
            nama: { in: DUMMY_SEKTOR_SEPTEMBER },
            kegiatan: { none: {} },
        },
       });

        return { activityLog, kegiatanPetugas, dokumen, kegiatan, petugas, leadingSector };
    });

    console.log(`
    Berhasil membersihkan:
    - Kegiatan: ${result.kegiatan.count} baris
    - Dokumen: ${result.dokumen.count} baris
    - Relasi Petugas: ${result.kegiatanPetugas.count} baris 
    - Petugas Dummy: ${result.petugas.count} orang
    - Leading Sector Dummy: ${result.leadingSector.count} instansi
    - Log Aktivitas: ${result.activityLog.count} baris   
    `);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });