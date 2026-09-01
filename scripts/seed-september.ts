import { PrismaClient, Role, StatusSambutan, StatusKegiatan, JenisDokumen, StatusDokumen, JenisPenugasan, StatusPublikasi } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Memulai Pembuatan 50 Data Dummy Kegiatan September 2026 ---');

    // 1. Pastikan user admin ada
    let adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (!adminUser) {
        const passwordAdmin = await bcrypt.hash('prokompim', 10);
        adminUser = await prisma.user.create({
            data: { username: 'admin', password: passwordAdmin, nama: 'Admin Protokom', role: Role.ADMIN },
        });
    }

    // 2. Pastikan Master Leading Sector tersedia
    const leadingSectorNames = [
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

    const leadingSectorMap: Record<string, string> = {};
    for (const nama of leadingSectorNames) {
        const ls = await prisma.leadingSector.upsert({
            where: { nama },
            update: {},
            create: { nama },
        });
        leadingSectorMap[nama] = ls.id;
    }

    // 3. Pastikan Master Petugas tersedia
    const masterPetugas = [
        { nama: 'Rian Hidayat', jabatan: 'Koordinator Staf Protokol', noHp: '081234567001', kategori: 'PROTOKOL' as const },
        { nama: 'Dewi Lestari', jabatan: 'Staf Protokol Senior', noHp: '081234567002', kategori: 'PROTOKOL' as const },
        { nama: 'Ahmad Fauzi', jabatan: 'Staf Protokol Acara', noHp: '0812345670003', kategori: 'PROTOKOL' as const },
        { nama: 'Bambang Irawan', jabatan: 'Staf Protokol Lapangan', noHp: '0812345670004', kategori: 'PROTOKOL' as const },
        { nama: 'Siti Nurhaliza', jabatan: 'Staf Protokol Tamu', noHp: '081234567005', kategori: 'PROTOKOL' as const },
        { nama: 'Aron Prabowo', jabatan: 'Kamerawan & Fotografer Utama', noHp: '0812345670006', kategori: 'LIPUTAN' as const },
        { nama: 'Fajar Nugroho', jabatan: 'Videografer & Editor', noHp: '0812345670007', kategori: 'LIPUTAN' as const },
        { nama: 'Dimas Prasetyo', jabatan: 'Staf Peliputan & Narasi Berita', noHp: '0812345670008', kategori: 'LIPUTAN' as const },
        { nama: 'Rizki Kurniawan', jabatan: 'Fotografer Humas', noHp: '0812345670009', kategori: 'LIPUTAN' as const },
        { nama: 'Eko Prasojo', jabatan: 'Operator Streaming & Dokumentasi', noHp: '081234567010', kategori: 'LIPUTAN' as const },
    ];
    
    const protokolIds: string[] = [];
    const liputanIds: string[] = [];

    for (const p of masterPetugas) {
        let existing = await prisma.petugas.findFirst({ where: { nama: p.nama } });
        if (!existing) {
            existing = await prisma.petugas.create({ data: p });
        }
        if (existing.kategori === 'PROTOKOL') {
            protokolIds.push(existing.id);
        } else {
            liputanIds.push(existing.id);
        }
    }

    // 4. Daftar 50 Agenda Kegiatan Realistis Bulan September 2026
    const daftarKegiatanList = [
        // --- 1 September 2026 ---
        {
            namaKegiatan: 'Rapat Koordinasi Evaluasi Realisasi Fisik dan Keuangan APBD Triwulan III',
            tanggal: '2026-09-01', waktu: '08:30', tempat: 'Aula Pertemuan Bappeda Kab. Brebes',
            pejabat: 'Bupati', nomorSurat: '005/0901/Bappeda/2026', perihalSurat: 'Undangan Rakor Evaluasi APBD',
            dresscode: 'PDH Khaki', picNama: 'Budi Santoso, S.STP', picNoHP: '08139011001',
            leadingSector: 'Badan Perencanaan Pembangunan, Penelitian dan Pengembangan Daerah (Bappeda)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-01', catatan: 'Dokumen SPJ dan laporan selesai diarsipkan.',
            protokolCount: 2, liputanCount: 2,
        },
        {
            namaKegiatan: 'Penyerahan Bantuan Alat Mesin Pertanian (Alsintan) kepada Kelompok Tani',
            tanggal: '2026-09-01', waktu: '13:30', tempat: 'Balai Penyuluhan Pertanian (BPP) Kec. Larangan',
            pejabat: 'Wakil Bupati', nomorSurat: '520/0902/DPKP/2026', perihalSurat: 'Penyerehan Bantuan Alsintan APBD 2026',
            dresscode: 'Batik Brebesan', picNama: 'Ir. Hendra Gunawan', picNoHP: '08139011002',
            leadingSector: 'Dinas Pertanian dan Ketahanan Pangan (DPKP)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-02', catatan: 'Dihadiri 40 ketua gapoktan se-Kecamatan Larangan.',
            protokolCount: 1, liputanCount: 1,    
        },
        // --- 2 September 2026 ---
        {
            namaKegiatan: 'Sosialisasi Pencegahan Perkawinan Usia Anak dan Penurunan Angka Stunting',
            tanggal: '2026-09-02', waktu: '09:00', tempat: 'Pendopo Kecamatan Ketanggungan',
            pejabat: 'Bupati', nomorSurat: '440/0903/Dinkes/2026', perihalSurat: 'Sosialisasi Penurunan Stunting 2026',
            dresscode: 'Batik Bebas Rapi', picNama: 'dr. Ratna Kartika', picNoHP: '08139011003',
            leadingSector: 'Dinas Kesehatan (Dinkes)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-03', catatan: 'Kerjasama dengan TP PKK Kabupaten Brebes.',
            protokolCount: 2, liputanCount: 1,
        },
        {
            namaKegiatan: 'Rapat Koordinasi Pengendalian Inflasi Daerah (TPID) Menghadapi Akhir Tahun',
            tanggal: '2026-09-02', waktu: '13:00', tempat: 'Ruang Rapat Bupati Lt.2 Setda Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '500/0904/Perekonomian/2026', perihalSurat: 'Rakor Rutin Mingguan',
            dresscode: 'PDH Khaki', picNama: 'Drs. Agus Riyanto', picNoHP: '08139011004',
            leadingSector: 'Bagian Perekonomian dan SDA',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.TIDAK_DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-04', catatan:'Rapat Internal koordinasi ketersediaan pasokan beras dan cabai.',
            protokolCount: 1, liputanCount: 0,
        },
        // --- 3 September 2026 ---
        {
            namaKegiatan: 'Monitoring dan Evaluasi Peningkatan Mutu Jalan Ruas Banjarharjo - Salem',
            tanggal: '2026-09-03', waktu: '08:00', tempat: 'Ruas Jalan Banjarharjo - Bandungsari - Salem',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '600/0905/DPUPR/2026', perihalSurat: 'Kunjungan Lapangan Proyek Jalan',
            dresscode: 'Rompi Lapangan / Casual Rapih', picNama: 'Teguh Wibowo', picNoHP: '08139011005',
            leadingSector: 'Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-05', catatan: 'Progress fisik ruas jalan telah mencapai 70%.',
            protokolCount: 2, liputanCount: 2,
        },
        {
            namaKegiatan: 'Pembukaan Pelatihan Wirausaha Digital Bagi UMKM Olahan Hasil Laut',
            tanggal: '2026-09-03', waktu: '10:00', tempat: 'Aula Balai Desa Randusanga Kulon Kec. Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '560/0906/Dinkop/2026', perihalSurat: 'Pelatihan UMKM Go Digital',
            dresscode: 'Batik Brebesan', picNama: 'Sri Wahyuni, SE', picNoHP: '08139011006',
            leadingSector: 'Dinas Koperasi, Usaha Mikro dan Perdagangan (Dinkopumdag)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-06', catatan: 'Peserta 35 pelaku UMKM binaan olahan ikan dan rajungan.',
            protokolCount: 1, liputanCount: 1,
        },
        {
            namaKegiatan: 'Sosialisasi Program Perlindungan Jaminan Sosial Ketenagakerjaan Bagi Pekerja Rentan',
            tanggal: '2026-09-03', waktu: '14:00', tempat: 'Aula Kantor Kecamatan Jatibarang',
            pejabat: 'Belum Ditentukan', nomorSurat: '560/0907/Disperinaker/2026', perihalSurat: 'Sosialisasi BPJS',
            dresscode: 'Batik Brebesan', picNama: 'Drs. H. Mulyono', picNoHP: '08139011046',
            leadingSector: 'Dinas Sosial (Dinsos)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-46', catatan: 'Penyerahan 100 kartu kepesertaan bagi buruh tani tembakau dan bawang.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 4 September 2026 ---
        {
            namaKegiatan: 'Penyambutan Kunjungan Kerja Komisi II DPR RI Terkait Evaluasi Pelayanan Publik',
            tanggal: '2026-09-04', waktu: '09:00', tempat: 'Pendopo Kantor Bupati Brebes',
            pejabat: 'Bupati', nomorSurat: '005/0908/Prokompim/2026', perihalSurat: 'Penyambutan Kunker DPR RI',
            dresscode: 'Pakaian Sipil Lengkap (PSL)', picNama: 'M.Fathi Rafa', picNoHP: '08139011007',
            leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-07', catatan: 'Kunjungan berjalan tertib dan lancar.',
            protokolCount: 3, liputanCount: 2, allCrewProtokol: true,
        },
        {
            namaKegiatan: 'Sholat Jumat Keliling dan Silahturahmi Bersama Alim Ulama dan Tokoh Masyarakat',
            tanggal: '2026-09-04', waktu: '11:30', tempat: 'Masjid Jami Baiturrahim Desa Kluwut Kec. Bulakamba',
            pejabat: 'Bupati', nomorSurat: '451/0909/BagUmum/2026', perihalSurat: 'Safari Jumat Bupati Brebes',
            dresscode: 'Baju Koko Putih, Peci Hitam', picNama: 'H. Syarif Hidayatullah', picNoHP: '08139011008',
            leadingSector: 'Bagian Umum Setda',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-08', catatan: 'Penyerahan bantuan operasional masjid sebesar Rp. 20 Juta.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 5 September 2026 ---
        {
            namaKegiatan: 'Pemberangkatan Kontingen Atlet POPDA Kabupaten Brebes Menuju Tingkat Karesidenan Pekalongan',
            tanggal: '2026-09-05', waktu: '07:30', tempat: 'Halaman GOR Sasana Adikarsa Brebes',
            pejabat: 'Bupati', nomorSurat: '426/0910/Dindikpora/2026', perihalSurat: 'Pelepasan Atlet POPDA Brebes',
            dresscode: 'Jaket Kontingen / Training Olahraga', picNama: 'Bambang Hermanto, M. Pd', picNoHP: '08139011009',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-09', catatan: 'Sebanyak 120 atlet dan 30 official diberangkatkan.',
            protokolCount: 2, liputanCount: 2,
        },
        // --- 6 September 2026 ---
        {
            namaKegiatan: 'Peninjauan Lapangan Penanganan Tanggap Darurat Bencana Kekeringan dan Droping Air',
            tanggal: '2026-09-06', waktu: '09:30', tempat: 'Desa Wlahar dan Desa Winduaji Kec. Larangan',
            pejabat: 'Wakil Bupati', nomorSurat: '360/0911/BPBD/2026', perihalSurat: 'Distribusi Air Bersih BPBD',
            dresscode: 'Seragam BPBD / Tactical', picNama: 'Dwi Prasetyo, S.Sos', picNoHP: '08139011010',
            leadingSector: 'Badan Penanggulangan Bencana Daerah (BPBD)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-10', catatan: 'Penyaluran 8 tangki air bersih untuk warga terdampak kemarau',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 7 September 2026 ---
        {
            namaKegiatan: 'Apel Luar Biasa Penguatan Disiplin ASN dan Penyerahan SK Kenaikan Pangkat Periode OKtober',
            tanggal: '2026-09-07', waktu: '07:15', tempat: 'Halaman KPT (Kantor Pemerintahan Terpadu) Brebes',
            pejabat: 'Bupati', nomorSurat: '800/0912/BKPSDMD/2026', perihalSurat: 'Apel Luar Biasa & Penyerahan SK',
            dresscode: 'Kopri Lengkap / Peci Hitam', picNama: 'Drs. Yuli Purwanto', picNoHP: '08139011011',
            leadingSector: 'Badan Kepegawaian dan Pengembangan SDM Daerah (BKPSDMD)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-11', catatan: 'Penyerahan SK bagi 145 PNS periode Oktober 2026.',
            protokolCount: 3, liputanCount: 2,
        },
        {
            namaKegiatan: 'Rapat Paripurna DPRD Brebes Penyampaian Nota Keuangan Perubahan APBD 2026',
            tanggal: '2026-09-07', waktu: '10:00', tempat: 'Ruang Sidang Paripurna DPRD Kab. Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '170/0913/DPRD/2026', perihalSurat: 'Undangan Rapat Paripurna',
            dresscode: 'Pakaian Sipil Resmi (PSR)', picNama: 'Sekretariat DPRD Brebes', picNoHP: '08139011012',
            leadingSector: 'Bagian Perekonomian dan SDA',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-12', catatan: 'Nota keuangan diterima seluruh fraksi DPRD Brebes.',
            protokolCount: 3, liputanCount: 2, allCrewProtokol: true,
        },
        // --- 8 September 2026 ---
        {
            namaKegiatan: 'Forum Komunikasi Pimpinan Daerah (Forkopimda) Antisipasi Kerawanan Tratinbumlinas',
            tanggal: '2026-09-08', waktu: '09:00', tempat: 'Ruang Rapat VIP Pendopo Kab. Brebes',
            pejabat: 'Bupati', nomorSurat: '3000/0914/SatpolPP/2026', perihalSurat: 'Rakor Forkopimda Ketenteraman dan Ketertiban',
            dresscode: 'PDH Khaki', picNama: 'Agus Subekti, SH', picNoHP: '08139011013',
            leadingSector: 'Satuan Polisi Pamong Praja (Satpol PP)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-13', catatan: 'Dihadiri jajaran Forkopimda lengkap.',
            protokolCount: 2, liputanCount: 1,
        },
        {
            namaKegiatan: 'Pelantikan Dewan Hakim dan Panitera Musaqabah Tilawatil Quran (MTQ) Ke-32',
            tanggal: '2026-09-08', waktu: '14:00', tempat: 'Aula Islamic Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '500/0915/BagKesra/2026', perihalSurat: 'Pelantikan Dewan Hakim MTQ',
            dresscode: 'Batik Muslim / Peci Hitam', picNama: 'Drs. H. Makmur, M.PD.I', picNoHP: '08139011047',
            leadingSector: 'Bagian Umum Setda',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-47', catatan: 'Pelantikan 60 dewan hakim perwakilan 17 kecamatan',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 9 September 2026 (Hari Olahraga Nasional) ---
        {
            namaKegiatan: 'Upacara Peringatan Hari Olahraga Nasional (Haornas) Ke-43 Tingkat Kabupaten Brebes',
            tanggal: '2026-09-09', waktu: '07:30', tempat: 'Stadion Karangbiarahi Brebes',
            pejabat: 'Bupati', nomorSurat: '429/0916/Dindikpora/2026', perihalSurat: 'Upacara Peringatan Haornas 2026',
            dresscode: 'Training Olahraga Resmi Pemkab', picNama: 'Kusuma Wardani, S. Pd', picNoHP: '08139011014',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-14', catatan: 'Pemberian tali asih atlet berprestasi Brebes.',
            protokolCount: 3, liputanCount: 3, allCrewLiputan: true,
        },
        {
            namaKegiatan: 'Senam Bersama dan Gerakan Masyarakat Hidup Sehat (GERMAS) Massal',
            tanggal: '2026-09-09', waktu: '09:00', tempat: 'Alun-alun Kabupaten Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '4400/0917/Dinkes/2026', perihalSurat: 'Kegiatan Germas & Cek Kesehatan Gratis',
            dresscode: 'Olahraga Bebas Rapi', picNama: 'dr. H. Mukhtar', picNoHP: '08139011015',
            leadingSector: 'Dinas Kesehatan (Dinkes)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-15', catatan: 'Pemeriksaan tensi darah dan skrining PTM gratis untuk 500 warga.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 10 September 2026 ---
        {
            namaKegiatan: 'High Level Meeting Optimalisasi Digitalisasi Pendapatan Asli Daerah (PAD)',
            tanggal: '2026-09-10', waktu: '08:30', tempat: 'Grand Dian Hotel Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '970/0918/BPKAD/2026', perihalSurat: 'Rapat TP2DD Implementasi QRIS Pajak Daerah',
            dresscode: 'Batik Brebesan', picNama: 'Danang Sulistyo, SE, M.Si', picNoHP: '08139011016',
            leadingSector: 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-16', catatan: 'Kerjasama dengan BI Tegal dan Bank Jateng Cabang Brebes.',
            protokolCount: 1, liputanCount: 1,
        },
        {
            namaKegiatan: 'Peninjauan Revitalisasi Pasar Tradisional Jatibarang Pasca Penataan Kios',
            tanggal: '2026-09-10', waktu: '13:30', tempat: 'Kompleks Pasar Batang Indah Jatibarang',
            pejabat: 'Bupati', nomorSurat: '511/0919/Dinkopumdag/2026', perihalSurat: 'Kunjungan Kerja Bupati di Pasar Jatibarang',
            dresscode: 'Kemeja Putih Lengan Panjang', picNama: 'Nanang Kosim, S.IP', picNoHP: '08139011017',
            leadingSector: 'Dinas Koperasi, Usaha Mikro dan Perdagangan (Dinkopumdag)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-17', catatan: 'Dialog tatap muka dengan paguyuban pedagang pasar.',
            protokolCount: 2, liputanCount: 2,
        },
        // --- 11 September 2026 --- 
        {
            namaKegiatan: 'Workshop Transformasi Sistem Pemerintahan Berbasis Elektronik (SPBE)',
            tanggal: '2026-09-11', waktu: '09:00', tempat: 'Aula Gedung Korpri Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '060/0920/Diskominfo/2026', perihalSurat: 'Workshop SPBE Digital Kominfo',
            dresscode: 'Batik Motif Bebas', picNama: 'Arief Kurniawan S.Kom', picNoHP: '08139011018',
            leadingSector: 'Dinas Komunikasi, Informatika dan Statistik (Diskominfo)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-18', catatan: 'Diikuti seluruh admin website OPD se-Kabupaten Brebes.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 12 September 2026 ---
        {
            namaKegiatan: 'Pembinaan Kepala Desa dan Pengelolaan Dana Desa Se-Kecamatan Losari',
            tanggal: '2026-09-12', waktu: '09:30', tempat: 'Pendopo Kecamatan Losari',
            pejabat: 'Bupati', nomorSurat: '140/0921/Dinpermades/2026', perihalSurat: 'Pembinaan Pengelolaan Keuangan',
            dresscode: 'Batik Brebesan', picNama: 'Drs. Subagyo, M. Si', picNoHP: '08139011019',
            leadingSector: 'Dinas Pemberdayaan Masyarakat dan Desa (Dinpermades)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-19', catatan: 'Fokus pada akuntabilitas Siskeudes dan pencegahan korupsi desa.',
            protokolCount: 2, liputanCount: 1,
        },
        {
            namaKegiatan: 'Monitoring Penanganan Darurat Longsor Tebing Jembatan Plompong Sirampog',
            tanggal: '2026-09-12', waktu: '13:00', tempat: 'Desa Plompong Kec. Sirampog',
            pejabat: 'Bupati', nomorSurat: '600/0922/DPUPR/2026', perihalSurat: 'Peninjauan Jembatan Sirampog',
            dresscode: 'Casual Lapangan / Safety Shoes', picNama: 'Ir. Agus Pramono', picNoHP: '08139011048',
            leadingSector: 'Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-48', catatan: 'Pemasangan bronjong kawat pengaman tebing jalan.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 13 September 2026 ---
        {
            namaKegiatan: 'Pelepasan Kontingen Pramuka Penggalang Jambore Daerah Kwarda Jawa Tengah',
            tanggal: '2026-09-13', waktu: '08:00', tempat: 'Sanggar Bakti Kwarcab Pramuka Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '428/0923/Kwarcab/2026', perihalSurat: 'Pelepasan Kontingen Jamda Brebes',
            dresscode: 'Seragam Pramuka Lengkap', picNama: 'Kak Imron Rosyadi', picNoHP: '08139011020',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-20', catatan: 'Pelepasan 32 anggota pramuka penggalang berprestasi.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 14 September 2026 ---
        {
            namaKegiatan: 'Rapat Koordinasi Persiapan Audit Interim BPK RI Perwakilan Jateng atas LKPD TA 2026',
            tanggal: '2026-09-14', waktu: '09:00', tempat: 'Ruang Rapat Bupati Brebes Lt. 2',
            pejabat: 'Bupati', nomorSurat: '005/0924/Inspektorat/2026', perihalSurat: 'Persiapan Entry Meeting BPK RI',
            dresscode: 'PDH Khaki', picNama: 'Nurul Hidayah, SE, Ak', picNoHP: '08139011021',
            leadingSector: 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-21', catatan: 'Rakor internal persiapan data dukung LKPD.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 15 September 2026 ---
        {
            namaKegiatan: 'Peninjauan Progres Pembangunan Gedung Rawat Inap RSUD Ir. Soekarno Bumiayu',
            tanggal: '2026-09-15', waktu: '09:00', tempat: 'RSUD Ir. Soekarno Kec. Bumiayu',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '445/0925/RSUD/2026', perihalSurat: 'Kunjungan Kerja Bupati di RSUD Bumiayu',
            dresscode: 'Kemeja Putih Lengan Panjang', picNama: 'dr. Hj. Farikha, M. Kes', picNoHP: '08139011022',
            leadingSector: 'Dinas Kesehatan (Dinkes)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-22', catatan: 'Progres fisik proyek telah mencapai 65%.',
            protokolCount: 2, liputanCount: 2,
        },
        {
            namaKegiatan: 'Pemberian Makanan Tambahan (PMT) Balita Kurang Gizi dan Ibu Hamil KEK di Wilayah Selatan',
            tanggal: '2026-09-15', waktu: '14:00', tempat: 'Puskesmas Paguyangan',
            pejabat: 'Wakil Bupati', nomorSurat: '440/0926/Dinkes/2026', perihalSurat: 'Penyaluran PMT Berbasis Pangan Lokal',
            dresscode: 'Batik Brebesan', picNama: 'dr. Siti Nurohmah', picNoHP: '08139011049',
            leadingSector: 'Dinas Kesehatan (Dinkes)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-49', catatan: 'Penyaluran telur, biskuit gizi, dan susu fortifikasi untuk 80 anak.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 16 September 2026 ---
        {
            namaKegiatan: 'Rembug Stunting Tingkat Kabupaten dan Penandatanganan Komitmen Lintas Sektor',
            tanggal: '2026-09-16', waktu: '08:30', tempat: 'Convention Hall Grand Dian Hotel Brebes',
            pejabat: 'Bupati', nomorSurat: '050/0927/Bapeda/2026', perihalSurat: 'Undangan Rembug Stunting 2026',
            dresscode: 'Batik Brebesan', picNama: 'Drs. Endang Sulistyowati', picNoHP: '08139011023',
            leadingSector: 'Badan Perencanaan Pembangunan, Penelitian dan Pengembangan Daerah (Bappeda)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-23', catatan: 'Komitmen penurunan angka stunting menuju single digit.',
            protokolCount: 3, liputanCount: 2,
        },
        // --- 17 September 2026 (Hari Perhubungan Nasional) ---
        {
            namaKegiatan: 'Upacara Peringatan Hari Perhubungan Nasional (Harhubnas) Tahun 2026',
            tanggal: '2026-09-17', waktu: '07:30', tempat: 'Halaman Terminal Tipe C Tanjung Kab. Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '550/0928/Dishub/2026', perihalSurat: 'Upacara Harhubnas Brebes 2026',
            dresscode: 'Pakaian Dinas Harian Dishub / PDH', picNama: 'Johari Efendi, ATD, MT', picNoHP: '081390111024',
            leadingSector: 'Dinas Perhubungan (Dishub)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-24', catatan: 'Penyematan tanda penghargaan bagi juru parkir teladan.',
            protokolCount: 2, liputanCount: 1,
        },   
        {
            namaKegiatan: 'Peluncuran Inovasi Layanan Penerbitan Dokumen Adminduk "Lakon Brebes" di MPP',
            tanggal: '2026-09-17', waktu: '10:30', tempat: 'Mall Pelayanan Publik (MPP) Kabupaten Brebes',
            pejabat: 'Bupati', nomorSurat: '470/0929/Disdukcapil/2026', perihalSurat: 'Launching Inovasi Pelayanan Kependudukan',
            dresscode: 'Batik Motif Salem Brebes', picNama: 'Drs. Mayang Sri Kembaren', picNoHP: '08139011025',
            leadingSector: 'Bagian Organisasi dan Tata Laksana',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-25', catatan: 'Inovasi cetak KTP-el mandiri lewat Anjungan Dukcapil Mandiri (ADM).',
            protokolCount: 1, liputanCount: 2,
        },
        // --- 18 September 2026 ---
        {
            namaKegiatan: 'Gerakan Bersih Sungai dan Penanaman 1.000 Pohon Mangrove di Kawasan Pesisir',
            tanggal: '2026-09-18', waktu: '07:00', tempat: 'Kawasan Hutan Mangrove Pandansari Kec. Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '660/0930/DLHPS/2026', perihalSurat: 'Aksi Bersih Pantai dan Tanam Mangrove',
            dresscode: 'Kaos Olahraga Ramah Lingkungan', picNama: 'Laode M. Safaat, ST', picNoHP: '08139011026',
            leadingSector: 'Dinas Lingkungan Hidup dan Pengelolaan Sampah (DLHPS)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-26', catatan: 'Aksi kolaboratif bersama relawan dan pegiat lingkungan hidup.',
            protokolCount: 2, liputanCount: 2,
        },
        {
            namaKegiatan: 'Pembinaan Karang Taruna dan Penyerahan Bantuan Sarana Olahraga Kepemudaan',
            tanggal: '2026-09-18', waktu: '14:30', tempat: 'Aula Kecamatan Bersama',
            pejabat: 'Belum Ditentukan', nomorSurat: '427/0931/Dindikpora/2026', perihalSurat: 'Pembinaan Kepemudaan Karang Taruna',
            dresscode: 'Batik Motif Bebas', picNama: 'Faisal Akbar, S.STP', picNoHP: '08139011050',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-50', catatan: 'Pemberian paket olahraga voli dan bulutangkis.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 19 September 2026 ---
        {
            namaKegiatan: 'Penyerahan Sertifikat Hak Atas Tanah Program PTSL Tahun 2026 di Desa Songgom Lor',
            tanggal: '2026-09-19', waktu: '09:00', tempat: 'Aula Balai Desa Songgom Lor Kec. Songgom',
            pejabat: 'Bupati', nomorSurat: '590/0932/BPN/2026', perihalSurat: 'Penyerahan Simbolis 500 Sertifikat PTSL',
            dresscode: 'Batik Brebesan', picNama: 'Heru Triatmoko', picNoHP: '08139011027',
            leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-27', catatan: 'Kerjasama Pemkab Brebes dan Kantor Pertanahan ATR/BPN Brebes.',
            protokolCount: 2, liputanCount: 1,
        },
        {
            namaKegiatan: 'Pengukuhan dan Pelantikan Dewan Pengurus Forum Anak Kabupaten Brebes Periode 2026-2028',
            tanggal: '2026-09-19', waktu: '13:30', tempat: 'Pendopo Kantor Bupati Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '460/0933/DP3APPKB/2026', perihalSurat: 'Pelantikan Forum Anak Daerah',
            dresscode: 'Batik Bebas Rapi', picNama: 'Rina Wijayanti, S. Psi', picNoHP: '081390111028',
            leadingSector: 'Dinas Sosial (Dinsos)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-28', catatan: 'Pelantikan 45 perwakilan anak berprestasi se-Kabupaten Brebes.',
            protokolCount: 1, liputanCount: 1,
        },
        // --- 20 September 2026 ---
        {
            namaKegiatan: 'Festival Kuliner Khas Brebes Sate Blengong dan Telur Asin Nusantara',
            tanggal: '2026-09-20', waktu: '08:00', tempat: 'Taman Edukasi Gandasuli Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '556/0934/Dinbudpar/2026', perihalSurat: 'Festival Kuliner Tradisional Brebes',
            dresscode: 'Busana Adat / Batik Brebesan', picNama: 'Wahyu Nugroho, S.SN', picNoHP: '081390111029',
            leadingSector: 'Dinas Koperasi, Usaha Mikro dan Perdagangan (Dinkopumdag)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.KEGIATAN_SELESAI,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: 'https://drive.google.com/drive/folders/dummy-sep-29', catatan: 'Menampilkan 60 stand UMKM kulineran khas Brebesan.',
            protokolCount: 3, liputanCount: 2,
        },
        // --- 21 September 2026 ---
        {
            namaKegiatan: 'Rakor Sinergitas Penertiban Reklame dan Pajak Daerah Tanpa Izin di Ruas Jalan Nasional',
            tanggal: '2026-09-21', waktu: '08:30', tempat: 'Ruang Rapat Asisten I Setda Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '300/0935/Satpol/2026', perihalSurat: 'Penegakan Perda Pajak Reklame',
            dresscode: 'PDH Khaki', picNama: 'Imam Santoso, SH', picNoHP: '081390111030',
            leadingSector: 'Satuan Polisi Pamong Praja (Satpol PP)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.TIDAK_DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: '', catatan: 'Penataan spanduk dan baliho liar di sepanjang Pantura.',
            protokolCount: 1, liputanCount: 0,
        },
        {
            namaKegiatan: 'Kunjungan Kerja Evaluasi Kinerja Penyelenggaraan Pelayanan Publik di RSUD Brebes',
            tanggal: '2026-09-21', waktu: '13:00', tempat: 'Auditorium RSUD Brebes Lt. 3',
            pejabat: 'Bupati', nomorSurat: '445/0936/RSUD/2026', perihalSurat: 'Evaluasi SPM Layanan Kesehatan',
            dresscode: 'Batik Bebas Rapi', picNama: 'dr. Rasipin, M.Kes', picNoHP: '081390111031',
            leadingSector: 'Dinas Kesehatan (Dinkes)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Evaluasi respon time IGD dan kepuasan pasien BPJS.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 22 September 2026 ---
        {
            namaKegiatan: 'Bimbingan Teknis Pengelolaan Keuangan Berbasis Akrual bagi Seluruh Bendahara Pengeluaran OPD',
            tanggal: '2026-09-22', waktu: '09:00', tempat: 'Hotel Dedy Jaya Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '900/0937/BPKAD/2026', perihalSurat: 'Bimtek Bendahara OPD 2026',
            dresscode: 'Batik Brebesan', picNama: 'Kurniasih, SE', picNoHP: '081390111032',
            leadingSector: 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Menghadirkan narasumber dari BPKP Perwakilan Jateng.',
            protokolCount: 1, liputanCount: 1,
        },
        {
            namaKegiatan: 'Peninjauan Pelaksanaan Ujian Asesmen Nasional Berbasis Komputer (ANBK) Tingkat SMP',
            tanggal: '2026-09-22', waktu: '10:30', tempat: 'SMP Negeri 1 Brebes dan SMP Negeri 2 Wanasari',
            pejabat: 'Wakil Bupati', nomorSurat: '421/0938/Dindikpora/2026', perihalSurat: 'Monitoring ANBK Jenjang SMP',
            dresscode: 'PDH Khaki', picNama: 'Drs. Caridin, M. Pd', picNoHP: '081390111033',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: '', catatan: 'Memastikan fasilitas server dan koneksi berjalan stabil.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 23 September 2026 ---
        {
            namaKegiatan: 'Rapat Koordinasi Penataan Batas Wilayah Antar Desa dan Pemanfaatan Tanah Kas Desa',
            tanggal: '2026-09-23', waktu: '09:00', tempat: 'Aula Bappeda Lt. 2 Kab. Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '130/0939/TataPemerintahan/2026', perihalSurat: 'Penyelesaian Batas Desa',
            dresscode: 'PDH Khaki', picNama: 'Bambang Sudarmono, S.Sos', picNoHP: '081390111034',
            leadingSector: 'Bagian Tata Pemerintahan',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.TIDAK_DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: '', catatan: 'Fasilitasi mediasi batas tanah kas desa Kersana dan Cikandang.',
            protokolCount: 1, liputanCount: 0,
        },
        // --- 24 September 2026 (Hari Tani Nasional) ---
        {
            namaKegiatan: 'Peringatan Hari Tani Nasional (HTN) 2026 & Panen Raya Bawang Merah Varietas Bima Brebes',
            tanggal: '2026-09-24', waktu: '08:00', tempat: 'Lahan Pertanian Terpadu Desa Krasak Kec. Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '520/0940/DPKP/2026', perihalSurat: 'Undangan Panen Raya Hari Tani',
            dresscode: 'Batik Tani / Kemeja Putih', picNama: 'Ir. Yulia Rahmawati, MP', picNoHP: '081390111035',
            leadingSector: 'Dinas Pertanian dan Ketahanan Pangan (DPKP)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Penyerahan penghargaan untuk 10 petani bawang merah teladan.',
            protokolCount: 3, liputanCount: 2, allCrewProtokol: true,
        },
        {
            namaKegiatan: 'Dialog Interaktif Bersama Petani Bawang Merah Seputar Stabilisasi Harga Pasca Panen',
            tanggal: '2026-09-24', waktu: '10:30', tempat: 'Gudang Cold Storage Bawang Merah Klampok Wanasari',
            pejabat: 'Bupati', nomorSurat: '521/0941/DPKP/2026', perihalSurat: 'Temu Wicara Petani Bawang',
            dresscode: 'Kemeja Putih Lengan Panjang', picNama: 'H. Suheri', picNoHP: '081390111036',
            leadingSector: 'Dinas Pertanian dan Ketahanan Pangan (DPKP)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: '', catatan: 'Membahas pemanfaatan fasilitas Controlled Atmosphere Storage (CAS).',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 25 September 2026 ---
        {
            namaKegiatan: 'Sosialisasi Pencegahan Tindak Pidana Korupsi dan Penguatan Sistem Antigratifikasi Bersama KPK RI',
            tanggal: '2026-09-25', waktu: '08:30', tempat: 'Pendopo Kabupaten Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '700/0942/Inspektorat/2026', perihalSurat: 'Sosialisasi Antigratifikasi KPK',
            dresscode: 'Batik Brebesan', picNama: 'Drs. Supriyadi, M.M', picNoHP: '081390111037',
            leadingSector: 'Bagian Hukum Setda',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Dihadiri seluruh Kepala OPD, Camat, dan Direktur BUMD se-Brebes.',
            protokolCount: 3, liputanCount: 2,
        },
        // --- 26 September 2026 ---
        {
            namaKegiatan: 'Safari Gerakan Gemar Membaca dan Pengukuhan Bunda Literasi Kecamatan se-Kabupaten Brebes',
            tanggal: '2026-09-26', waktu: '09:00', tempat: 'Gedung Perpustakaan Daerah Kab. Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '041/0943/Dinarpus/2026', perihalSurat: 'Pengukuhan Bunda Literasi',
            dresscode: 'Batik Corak Cerah', picNama: 'Dra. Hj. Wahyuningrum', picNoHP: '081390111038',
            leadingSector: 'Dinas Pendidikan, Pemuda dan Olahraga (Dindikpora)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: '', catatan: 'Pemberian apresiasi perpustakaan desa terbaik.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 27 September 2026 ---
        {
            namaKegiatan: 'Penyerahan Paket Sembako dan Terpal Bagi Korban Terdampak Bencana Angin Puting Beliung',
            tanggal: '2026-09-27', waktu: '09:00', tempat: 'Balai Desa Cikakak Kec. Banjarharjo',
            pejabat: 'Bupati', nomorSurat: '460/0944/Dinsos/2026', perihalSurat: 'Penyaluran Bantuan Sosial Bencana',
            dresscode: 'Rompi Dinsos / Casual Rapih', picNama: 'Drs. Masrukhin', picNoHP: '081390111039',
            leadingSector: 'Dinas Sosial (Dinsos)',
            statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.MENUNGGU_PENUGASAN,
            statusPublikasi: StatusPublikasi.DIRILIS, jenisPenugasan: JenisPenugasan.SPPD,
            linkUpload: '', catatan: 'Bantuan darurat untuk 75 keluarga yang atap rumahnya rusak.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 28 September 2026 ---
        {
            namaKegiatan: 'Rapat Koordinasi Persiapan Penyusunan KUA-PPAS APBD Tahun Anggaran 2027',
            tanggal: '2026-09-28', waktu: '08:30', tempat: 'Ruang Rapat Bupati Lt.2 Setda Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '050/0945/Bappeda/2026', perihalSurat: 'Rakor Finalisasi KUA-PPAS 2027',
            dresscode: 'PDH Khaki', picNama: 'Suryono, SE, MM', picNoHP: '081390111040',
            leadingSector: 'Badan Perencanaan Pembangunan, Penelitian dan Pengembangan Daerah (Bappeda)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Menunggu penyelarasan pagu indikatif masing-masing urusan.',
            protokolCount: 1, liputanCount: 0,
        },
        {
            namaKegiatan: 'Penerimaan Studi Banding Pemkab Sambas Terkait Inovasi Penanganan Kemiskinan Ekstrem Berbasis Data',
            tanggal: '2026-09-28', waktu: '10:00', tempat: 'Ruang Rapat Sasana Praja Setda Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '005/0946/Prokompim/2026', perihalSurat: 'Penerimaan Kunjungan Studi Tiru',
            dresscode: 'Batik Brebesan', picNama: 'Anita Kusuma, S.STP', picNoHP: '081390111041',
            leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: '', catatan: 'Rombongan pimpinan dan Bappeda Pemkab Sambas',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 29 September 2026 ---
        {
            namaKegiatan: 'Konsultasi Publik Rancangan Peraturan Bupati tentang Tata Kelola Sampah Berkelanjutan',
            tanggal: '2026-09-29', waktu: '09:00', tempat: 'Aula Gedung Korpri Brebes',
            pejabat: 'Belum Ditentukan', nomorSurat: '180/0947/Hukum/2026', perihalSurat: 'Uji Publik Raperbup Pengelolaan Sampah',
            dresscode: 'Batik Bebas Rapi', picNama: 'Moh. Ridwan, SH, MH', picNoHP: '081390111042',
            leadingSector: 'Bagian Hukum Setda',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.KEGIATAN,
            linkUpload: '', catatan: 'Melibatkan pegiat lingkungan, akademisi, dan camat se-Kabupaten.',
            protokolCount: 1, liputanCount: 1,
        },
        {
            namaKegiatan: 'Pencanangan Gerakan Menanam Cabai di Pekarangan Rumah ASN Pemkab Brebes',
            tanggal: '2026-09-29', waktu: '13:30', tempat: 'Halaman Kompleks Kantor Setda Brebes',
            pejabat: 'Wakil Bupati', nomorSurat: '521/0948/DPKP/2026', perihalSurat: 'Gerakan Menanam Cabai Serentak',
            dresscode: 'PDH Khaki / Baju Tani', picNama: 'Ir. Ahmad Subhan', picNoHP: '081390111043',
            leadingSector: 'Dinas Pertanian dan Ketahanan Pangan (DPKP)',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Pembagian 1.000 bibit cabai rawit merah polybag.',
            protokolCount: 2, liputanCount: 1,
        },
        // --- 30 September 2026 ---
        {
            namaKegiatan: 'Rapat Paripurna DPRD Persetujuan Bersama Raperda Perubahan APBD TA 2026',
            tanggal: '2026-09-30', waktu: '09:30', tempat: 'Ruang Sidang Paripurna Gedung DPRD Kab. Brebes',
            pejabat: 'Bupati & Wakil Bupati', nomorSurat: '170/0949/DPRD/2026', perihalSurat: 'Persetujuan Bersama Raperda APBD-P',
            dresscode: 'Pakaian Sipil Lengkap (PSL)', picNama: 'Sekretariat DPRD Kab. Brebes', picNoHP: '081390111044',
            leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Penandatangan berita acara persetujuan bersama bupati dan pimpinan dewan.',
            protokolCount: 3, liputanCount: 2, allCrewProtokol: true,
        },
        {
            namaKegiatan: 'Malam Renungan dan Doa Bersama Akhir Bulan Lintas Agama',
            tanggal: '2026-09-30', waktu: '19:30', tempat: 'Pendopo Kabupaten Brebes',
            pejabat: 'Bupati', nomorSurat: '450/0950/Kesra/2026', perihalSurat: 'Doa Bersama Kerukunan Umat Beragama',
            dresscode: 'Batik Brebesan / Pakaian Adat', picNama: 'H. Akhmad Zaini, S.Ag', picNoHP: '081390111045',
            leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
            statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.ACARA_MASUK,
            statusPublikasi: StatusPublikasi.BELUM_DIRILIS, jenisPenugasan: JenisPenugasan.LEMBUR,
            linkUpload: '', catatan: 'Dihadiri FKUB, tokoh agama Islam, Kristen, Katolik, Hindu, Buddha, Khonghucu.',
            protokolCount: 2, liputanCount: 2,
        },
    ];

    console.log(`Jumlah agenda kegiatan yang disiapkan: ${daftarKegiatanList.length} data.`);

    const polaDokumen: Record<StatusKegiatan, StatusDokumen[]> = {
        SPJ_SELESAI: [
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
        ],
        KEGIATAN_SELESAI: [
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.PERLU_REVISI,
            StatusDokumen.BELUM_UPLOAD,
        ],
        MENUNGGU_PENUGASAN: [
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
        ],
        ACARA_MASUK: [
            StatusDokumen.SUDAH_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
            StatusDokumen.BELUM_UPLOAD,
        ],
    };

    const jenisDokumenList = Object.values(JenisDokumen);

    let insertedCount = 0;

    for (let i = 0; i < daftarKegiatanList.length; i++) {
        const item = daftarKegiatanList[i];
        const lsId = leadingSectorMap[item.leadingSector] || null;

        const assignedProtokol: string[] = [];
        for (let p = 0; p < item.protokolCount; p++) {
            const idx = (i + p) % protokolIds.length;
            assignedProtokol.push(protokolIds[idx]);
        }

        const assignedLiputan: string[] = [];
        for (let l = 0; l < item.liputanCount; l++) {
            const idx = (i + l) % liputanIds.length;
            assignedLiputan.push(liputanIds[idx]);
        }

        const createdKegiatan = await prisma.kegiatan.create({
            data: {
                namaKegiatan: item.namaKegiatan,
                tanggal: new Date(`${item.tanggal}T00:00:00.00Z`),
                waktu: item.waktu,
                tempat: item.tempat,
                pejabat: item.pejabat,
                nomorSurat: item.nomorSurat,
                dresscode: item.dresscode,
                picNama: item.picNama,
                picNoHp: item.picNoHP,
                leadingSectorId: lsId,
                statusSambutan: item.statusSambutan,
                statusKegiatan: item.statusKegiatan,
                statusPublikasi: item.statusPublikasi,
                jenisPenugasan: item.jenisPenugasan,
                linkUpload: item.linkUpload || null,
                catatan: item.catatan,
                allCrewProtokol: (item as any).allCrewProtokol || false,
                allCrewLiputan: (item as any).allCrewLiputan || false,
                petugas: {
                    create: [
                        ...assignedProtokol.map((pid) => ({ petugasId: pid })),
                        ...assignedLiputan.map((pid) => ({ petugasId: pid })),
                    ],
                },
                dokumen: {
                    create: jenisDokumenList.map((jenis, docIdx) => ({
                        jenis,
                        status: polaDokumen[item.statusKegiatan][docIdx],
                        link: polaDokumen[item.statusKegiatan][docIdx] === StatusDokumen.SUDAH_UPLOAD ? `https://drive.google.com/file/dummy-${item.tanggal}-${jenis}` : null,
                    })),
                },
            },
        });

        await prisma.activityLog.create({
            data: {
                entity: 'KEGIATAN',
                entityId: createdKegiatan.id,
                action: 'CREATE',
                userId: adminUser.id,
                changes: {
                    after: {
                        namaKegiatan: item.namaKegiatan,
                        tanggal: item.tanggal,
                        tempat: item.tempat,
                        pejabat: item.pejabat,
                    },
                    meta: { entityName: item.namaKegiatan },
                },
                createdAt: new Date(`${item.tanggal}T00:00:00.00Z`),
            },
        });

        insertedCount++;
    }

    console.log(`✅ Berhasil memasukkan ${insertedCount} data kegiatan untuk bulan September 2026!`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        process.exit(0);
    })
    .catch(async (e) => {
        console.error('Error saat seeding data September:', e);
        await prisma.$disconnect();
        process.exit(1);
    });

