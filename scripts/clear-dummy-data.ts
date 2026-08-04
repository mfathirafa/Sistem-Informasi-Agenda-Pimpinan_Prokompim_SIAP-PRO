/**
 * Script satu kali pakai: menghapus SEMUA data dummy dari database,
 * MEMPERTAHANKAN akun (users) - tabel users tidak disentuh.
 * 
 * Urutan child -> parent (aman dari constraint error):
 * 1. activity_log (child users, independen dari data dummy)
 * 2. kegiatan_petugas (child kegiatan + petugas)
 * 3. dokumen (child kegiatan)
 * 4. kegiatan (parent dokumen/kegiatan_petugas, child leading_sector)
 * 5. petugas (parent kegiatan_petugas)
 * 6. leading_sector (parent kegiatan)
 * 
 * Jalankan: npx tsx scipts/clear-dummy-data.ts 
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const hasil = await prisma.$transaction(async (tx) => {
        const activityLog = await tx.activityLog.deleteMany({});
        const kegiatanPetugas = await tx.kegiatanPetugas.deleteMany({});
        const dokumen = await tx.dokumen.deleteMany({});
        const kegiatan = await tx.kegiatan.deleteMany({});
        const petugas = await tx.petugas.deleteMany({});
        const leadingSector = await tx.leadingSector.deleteMany({});
        return { activityLog, kegiatanPetugas, dokumen, kegiatan, petugas, leadingSector };
    });

    const userCount = await prisma.user.count();

    console.log(`
        Hasil penghapusan:
        - Activity Log: ${hasil.activityLog.count} baris
        - KegiatanPetugas: ${hasil.kegiatanPetugas.count} baris
        - Dokumen: ${hasil.dokumen.count} baris
        - Kegiatan: ${hasil.kegiatan.count} baris
        - Petugas: ${hasil.petugas.count} baris
        - LeadingSector: ${hasil.leadingSector.count} baris
        Users (TIDAK dihapus): ${userCount} akun tersisa.
        `);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });