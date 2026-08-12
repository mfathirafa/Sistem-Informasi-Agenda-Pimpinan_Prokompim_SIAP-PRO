/**
 * Script satu kali pakai: mengisi NIP untuk 21 pegawai Bagian Prokompim.
 * Data dari references/database/Data Pegawai Bagian Prokompim.pdf (halaman 1).
 * 
 * Matching pakai kat pertama nama (case-insensitive) - unik untuk 21 pegawai.
 * Jalankan: npx tsx scripts/set-nip.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Data NIP dari PDF (halaman 1). Format PDF: YYYYMMDD YYYYMM G NNN -> 18 digit ---
const NIP_DATA = [
    { key: 'MUROKHYATI', nip: '197005101998032001' }, // Murokhyati, S.Pi
    { key: 'TITIK', nip: '198908282010122004' },      // Titik Dwi Satrianingsih, ST, MT
    { key: 'ROSE', nip: '197804272008012018' },        // Rose Kusuma Ningrum, S.IP
    { key: 'HANDRI', nip: '198112292009011006' },      // Handri, S.IP
    { key: 'ZALFA', nip: '199904192025042002' },       // Zalfa Azzahnal Bilqis, S.I.P.
    { key: 'VIRA', nip: '200202232023082001' },        // Vira Wirna Nurhidayat, S.Tr.IP
    { key: 'NARIYAH', nip: '198506182009012001' },     // Nariyah Budiyani, SE
    { key: 'SUPENDI', nip: '197712152008011013' },     // Supendi
    { key: 'ANADIA', nip: '199504052022032019' },      // Anadia Syifa Ul Af Idah F., S.Sos
    { key: 'LUSIANA', nip: '198903202019032010' },     // Lusiana Marita
    { key: 'INAYAH', nip: '200405112025042001' },      // Inayah Cahya Negtyas
    { key: 'ZULFANIA', nip: '200511192025042001' },    // Zulfania Najma Dwi Marella
    { key: 'SOFYAN', nip: '200104122025101002' },      // Sofyan Tri Utomo, S.Tr.IP
    { key: 'BINTANG', nip: '200112202025101002' },     // Bintang Fitriyana Wibowo, S.Tr.IP
    { key: 'FAJAR', nip: '200203122025101001' },       // Fajar Eka Pangestu, S.Tr.IP
    { key: 'DIAN', nip: '200203202025101002' },        // Dian Bagus Adi, S.Tr.IP
    { key: 'NUR', nip: '199404262025212087' },         // Nur Azmi Aprillia, SH
    { key: 'USMAN', nip: '198811282025211053' },       // Usman Firman Sah
    { key: 'SHARON', nip: '199608202025211021' },      // Sharon Agridona, S.Ak
    { key: 'ANGGA', nip: '199509052025211116' },       // Angga Aryo Prakoso, Amd.T
    { key: 'HENDRA', nip: '198210062025211068' },      // Hendra Gunawan
] as const;

function normalizeKey(nama: string): string {
    return nama.trim().split(',')[0].split(' ')[0].toUpperCase();
}

async function main() {
    const allPetugas = await prisma.petugas.findMany({
        select: { id:true, nama: true, nip: true },
    });
    
    const byKey = new Map<string, (typeof allPetugas)[number]>();
    for (const p of allPetugas) byKey.set(normalizeKey(p.nama), p);

    let updated = 0, skipped = 0;
    const notFound: string[] = [];

    for (const entry of NIP_DATA) {
        const p = byKey.get(entry.key);
        if (!p) {
            notFound.push(`${entry.key}`);
            continue;
        }
        if (p.nip === entry.nip) {
            console.log(`⊘ SKIP ${p.nama} - NIP sudah sesuai`);
            skipped++;
            continue;
        }
        await prisma.petugas.update({ where: { id: p.id }, data: { nip: entry.nip, nama: p.nama.trim() } });
        console.log(`✓ UPDATE ${p.nama} → NIP ${entry.nip}`);
        updated++;
    }

    console.log(`\nSelesai: ${updated} diperbarui, ${skipped} dilewati, ${notFound.length} tidak ditemukan`);
    if (notFound.length > 0) console.log('Tidak cocok:', notFound.join(', '));
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });