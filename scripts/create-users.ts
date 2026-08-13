/**
 * Script satu kali pakai: membuat 21 akun User untuk pegawai Bagian Prokompim.
 * Data dari daftar yang disediakan user (Nama Lengkap, NIP, Nama Panggilan).
 * 
 * username = nama panggilan lowercase * Password = {NamaPanggilan}{4 digit terakhir NIP}
 * Role: Murokhyati (yati) = KEPALA_BAGIAN, 20 lainnya = STAFF *
 * Jalankan : npx tsx scripts/create-users.ts */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface PegawaiData {
    nama: string;
    nip: string;
    panggilan: string;
    username: string;
    role: Role;
}

const pegawaiList: PegawaiData[] = [
    {
        nama: 'Anadia Syifa Ul Af Idah F., S.Sos',
        nip: '199504052022032019',
        panggilan: 'Nadia',
        username: 'nadia',
        role: 'ADMIN',
    },
    {
        nama: 'Angga Aryo Prakoso, Amd.T',
        nip: '199509052025211116',
        panggilan: 'Angga',
        username: 'angga',
        role: 'STAFF',
    },
    {
        nama: 'Bintang Fitriyana Wibowo, S.Tr.IP',
        nip: '200112202025101002',
        panggilan: 'Bintang',
        username: 'bintang',
        role: 'STAFF',
    },
    {
        nama: 'Dian Bagus Adi, S.Tr.IP',
        nip: '200203202025101002',
        panggilan: 'Dian',
        username: 'dian',
        role: 'STAFF',
    },
    {
        nama: 'Fajar Eka Pangestu, S.Tr.IP',
        nip: '200203122025101001',
        panggilan: 'Fajar',
        username: 'fajar',
        role: 'STAFF',
    },
    {
        nama: 'Handri, S.IP',
        nip: '198112292009011006',
        panggilan: 'Handri',
        username: 'handri',
        role: 'STAFF',
    },
    {
        nama: 'Hendra Gunawan',
        nip: '198210062025211068',
        panggilan: 'Gun',
        username: 'gun',
        role: 'STAFF',
    },
    {
        nama: 'Inayah Cahya Negtyas',
        nip: '200405112025042001',
        panggilan: 'Inayah',
        username: 'inayah',
        role: 'STAFF',
    },
    {
        nama: 'Lusiana Marita',
        nip: '198903202019032010',
        panggilan: 'Lusi',
        username: 'lusi',
        role: 'STAFF',
    },
    {
        nama: 'MUROKHYATI, S.Pi',
        nip: '197005101998032001',
        panggilan: 'Yati',
        username: 'yati',
        role: 'KEPALA_BAGIAN',
    },
    {
        nama: 'Nariyah Budiyani, SE',
        nip: '198506182009012001',
        panggilan: 'Ari',
        username: 'ari',
        role: 'ADMIN',
    },
    {
        nama: 'Nur Azmi Aprillia, SH',
        nip: '199404262025212087',
        panggilan: 'Lia',
        username: 'lia',
        role: 'ADMIN',
    },
    {
        nama: 'Rose Kusuma Ningrum, S.IP',
        nip: '197804272008012018',
        panggilan: 'Rose',
        username: 'rose',
        role: 'ADMIN',
    },
    {
        nama: 'Sharon Agridona, S.Ak',
        nip: '199608202025211021',
        panggilan: 'Aron',
        username: 'aron',
        role: 'STAFF',
    },
    {
        nama: 'Sofyan Tri Utomo, S.Tr.IP',
        nip: '200104122025101002',
        panggilan: 'Sofyan',
        username: 'sofyan',
        role: 'STAFF',
    },
    {
        nama: 'Supendi',
        nip: '197712152008011013',
        panggilan: 'Pendi',
        username: 'pendi',
        role: 'STAFF',
    },
    {
        nama: 'Titik Dwi Satrianingsih, ST, MT',
        nip: '198908282010122004',
        panggilan: 'Titik',
        username: 'titik',
        role: 'ADMIN',
    },
    {
        nama: 'Usman Firman Sah',
        nip: '198811282025211053',
        panggilan: 'Firman',
        username: 'firman',
        role: 'STAFF',
    },
    {
        nama: 'Vira Wirna Nurhidayat, S.Tr.IP',
        nip: '200202232023082001',
        panggilan: 'Vira',
        username: 'vira',
        role: 'STAFF',
    },
    {
        nama: 'Zalfa Azzahnal Bilqis, S.I.P.',
        nip: '199904192025042002',
        panggilan: 'Azza',
        username: 'azza',
        role: 'ADMIN',
    },
    {
        nama: 'Zulfania Najma Dwi Marella',
        nip: '200511192025042001',
        panggilan: 'Fani',
        username: 'fani',
        role: 'STAFF',
    },
];

function generatePassword(panggilan: string, nip: string):
string {
    const last4 = nip.slice(-4);
    return `${panggilan}${last4}`;
}

async function main() {
    console.log('🔧 Memulai pembuatan/perbaruan21 user Prokompim...\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pegawai of pegawaiList) {
        const password = generatePassword(pegawai.panggilan, pegawai.nip);
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { username: pegawai.username },
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    username: pegawai.username,
                    password: hashedPassword,
                    nama: pegawai.nama,
                    role: pegawai.role,
                },
            });
            console.log(`✅ CREATE: ${pegawai.username} (${pegawai.nama}) - Role: ${pegawai.role}`);
            created++;
        } else {
            const namaChanged = existingUser.nama !== pegawai.nama;
            const roleChanged = existingUser.role !== pegawai.role;

            if (!namaChanged && !roleChanged) {
                console.log(`⏭️ SKIP: ${pegawai.username} (${pegawai.nama}) - sudah sesuai`);
                skipped++;
            } else {
                await prisma.user.update({
                    where: { username: pegawai.username },
                    data: {
                        nama: pegawai.nama,
                        role: pegawai.role,
                    },
                });
                console.log(`🔄 UPDATE: ${pegawai.username} (${pegawai.nama}) - Role: ${pegawai.role} ${
                    namaChanged ? '[nama diubah]' : ''
                }${roleChanged ? '[role diubah]' : ''}`
            );
            updated++;
            }
        }
    }

    console.log('\n📊 Ringkasan:');
    console.log(` ✅Created: ${created}`);
    console.log(` 🔄 Updated: ${updated}`);
    console.log(` ⏭️ Skipped: ${skipped}`);
    console.log(` 📝 Total: ${pegawaiList.length}`);
    console.log('\n✅ Selesai!');
}

main()
    .catch((e) => {
        console.error('❌ error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });