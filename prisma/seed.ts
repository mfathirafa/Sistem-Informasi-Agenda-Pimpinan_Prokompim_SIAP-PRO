import { PrismaClient, Role, StatusSambutan, StatusKegiatan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordStaff = await bcrypt.hash('staff123', 10);
  const passwordAtasan = await bcrypt.hash('atasan123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: passwordAdmin, nama: 'Admin Protokom', role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: { username: 'staff', password: passwordStaff, nama: 'Staf Protokol', role: Role.STAFF },
  });
  await prisma.user.upsert({
    where: { username: 'atasan' },
    update: {},
    create: { username: 'atasan', password: passwordAtasan, nama: 'Pimpinan', role: Role.ATASAN },
  });

  const leadingSectorNames = [
    'Bagian Protokol dan Komunikasi Pimpinan',
    'Dinas Pendidikan',
    'Dinas Kesehatan',
    'Dinas PUPR',
    'Diskominfo',
    'Bagian Umum',
  ];
  const leadingSectors: { id: string; nama: string }[] = [];
  for (const nama of leadingSectorNames) {
    const ls = await prisma.leadingSector.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
    leadingSectors.push(ls);
  }

  const petugasData = [
    { nama: 'Rian', jabatan: 'Staf Protokol', noHp: '081234500001', kategori: 'PROTOKOL' as const },
    { nama: 'Dewi', jabatan: 'Staf Protokol', noHp: '081234500002', kategori: 'PROTOKOL' as const },
    { nama: 'Ahmad', jabatan: 'Staf Protokol', noHp: '081234500003', kategori: 'PROTOKOL' as const },
    { nama: 'Aron', jabatan: 'Staf Liputan', noHp: '081234500004', kategori: 'LIPUTAN' as const},
    { nama: 'Fajar', jabatan: 'Staf Liputan', noHp: '081234500005', kategori: 'LIPUTAN' as const },
    { nama: 'Dimas', jabatan: 'Staf Liputan', noHp: '081234500006', kategori: 'LIPUTAN' as const },
  ];
  const petugasList: Record<string, string> = {};
  for (const p of petugasData) {
    const existing = await prisma.petugas.findFirst({ where: { nama: p.nama } });
    if (existing) {
      await prisma.petugas.update({ where: { id: existing.id }, data: { kategori: p.kategori } });
      petugasList[p.nama] = existing.id;
    } else {
      const created = await prisma.petugas.create({ data: p });
      petugasList[p.nama] = created.id;
    }
  }

  const findSector = (nama: string) => leadingSectors.find((s) => s.nama === nama)!.id;

  const count = await prisma.kegiatan.count();
  if (count < 20) {
    // Hapus data lama agar seed konsisten
    await prisma.kegiatan.deleteMany();

    const today = new Date();
    const addDays = (d: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      return dt;
    };

    const protokolPetugas = ['Rian', 'Dewi', 'Ahmad'];
    const liputanPetugas = ['Aron', 'Fajar', 'Dimas'];
    const pilihProtokol = (i: number) => petugasList[protokolPetugas[i % 3]];
    const pilihLiputan = (i: number) => petugasList[liputanPetugas[i % 3]];
    
    await prisma.kegiatan.createMany({
      data: [
         {
          namaKegiatan: 'Rapat Koordinasi Pembangunan Daerah',
          tanggal: addDays(-90), waktu: '09:00',
          tempat: 'Aula Bappeda Kab. Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(0),
          linkUpload: 'https://drive.google.com/drive/folders/001',
          isLembur: false,
        },
        {
          namaKegiatan: 'Sosialisasi Program Ketahanan Pangan',
          tanggal: addDays(-75), waktu: '10:00',
          tempat: 'Aula Dinas Pertanian',
          pejabat: 'Wakil Bupati', leadingSectorId: findSector('Bagian Umum'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(1),
          linkUpload: 'https://drive.google.com/drive/folders/002',
          isLembur: false,
        },
        {
          namaKegiatan: 'Monitoring Pembangunan Infrastruktur Jalan',
          tanggal: addDays(-60), waktu: '08:00',
          tempat: 'Ruas Jalan Brebes–Bumiayu',
          pejabat: 'Bupati & Wakil Bupati', leadingSectorId: findSector('Dinas PUPR'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_SELESAI,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(2),
          linkUpload: 'https://drive.google.com/drive/folders/003',
          isLembur: true,
        },
        {
          namaKegiatan: 'Forum Komunikasi OPD Se-Kabupaten Brebes',
          tanggal: addDays(-45), waktu: '09:30',
          tempat: 'Pendopo Kabupaten Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_DIPROSES,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(0),
          linkUpload: 'https://drive.google.com/drive/folders/004',
          isLembur: false,
        },
        {
          namaKegiatan: 'Rapat Persiapan Lomba Desa Tingkat Provinsi',
          tanggal: addDays(-30), waktu: '13:00',
          tempat: 'Aula Kecamatan Brebes',
          pejabat: 'Wakil Bupati', leadingSectorId: findSector('Bagian Umum'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_DIPROSES,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(1),
          linkUpload: 'https://drive.google.com/drive/folders/005',
          catatan: 'Laporan masih dalam proses',
          isLembur: true,
        },
        {
          namaKegiatan: 'Sosialisasi Peraturan Bupati No. 7/2026',
          tanggal: addDays(-21), waktu: '09:00',
          tempat: 'Aula Diskominfo',
          pejabat: 'Bupati', leadingSectorId: findSector('Diskominfo'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.SPJ_DIPROSES,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(2),
          linkUpload: 'https://drive.google.com/drive/folders/006',
          isLembur: false,
        },
        {
          namaKegiatan: 'Rapat Koordinasi Penanganan Bencana',
          tanggal: addDays(-14), waktu: '10:00',
          tempat: 'BPBD Kab. Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Dinas Kesehatan'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.DILAKSANAKAN,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(1),
          linkUpload: 'https://drive.google.com/drive/folders/007',
          isLembur: true,
        },
        {
          namaKegiatan: 'Evaluasi Kinerja Triwulan II',
          tanggal: addDays(-7), waktu: '08:00',
          tempat: 'Aula Bappeda',
          pejabat: 'Bupati & Wakil Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.DILAKSANAKAN,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(2),
          isLembur: false,
        },
         {
          namaKegiatan: 'Musrenbang Kecamatan Brebes',
          tanggal: addDays(-3), waktu: '09:00',
          tempat: 'Aula Kecamatan Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Umum'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.DILAKSANAKAN,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(0),
          isLembur: true,
        },
        {
          namaKegiatan: 'Apel Pagi Gabungan ASN',
          tanggal: addDays(-1), waktu: '07:30',
          tempat: 'Halaman Pendopo Kab. Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.SUDAH, statusKegiatan: StatusKegiatan.DILAKSANAKAN,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(1),
          isLembur: false,
        },
        {
          namaKegiatan: 'Rapat Koordinasi Harian Bupati',
          tanggal: addDays(0), waktu: '09:00',
          tempat: 'Ruang Rapat Bupati',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_DOKUMEN,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(2),
          catatan: 'Dokumentasi menyusul',
          isLembur: false,
        },
         {
          namaKegiatan: 'Kunjungan Kerja ke Kecamatan Banjarharjo',
          tanggal: addDays(2), waktu: '08:00',
          tempat: 'Kantor Kecamatan Banjarharjo',
          pejabat: 'Bupati & Wakil Bupati', leadingSectorId: findSector('Bagian Umum'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_DOKUMEN,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(0),
          isLembur: true,
        },
        {
          namaKegiatan: 'Halal Bihalal dan Silaturahmi',
          tanggal: addDays(5), waktu: '09:00',
          tempat: 'Pendopo Kabupaten Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_DOKUMEN,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(1),
          isLembur: false,
        },
        {
          namaKegiatan: 'Persiapan HUT RI Ke-81',
          tanggal: addDays(10), waktu: '10:00',
          tempat: 'Aula Diskominfo',
          pejabat: 'Wakil Bupati', leadingSectorId: findSector('Diskominfo'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DISETUJUI,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(2),
          catatan: 'Rapat koordinasi panitia',
          isLembur: false,
        },
        {
          namaKegiatan: 'Sosialisasi Pencegahan Stunting',
          tanggal: addDays(14), waktu: '09:00',
          tempat: 'Puskesmas Bumiayu',
          pejabat: 'Bupati', leadingSectorId: findSector('Dinas Kesehatan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DISETUJUI,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(0),
          isLembur: true,
        },
        {
          namaKegiatan: 'Peringatan Hari Jadi Kabupaten Brebes',
          tanggal: addDays(21), waktu: '08:00',
          tempat: 'Lapangan Pemkab Brebes',
          pejabat: 'Bupati & Wakil Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.MENUNGGU_PERSETUJUAN,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(1),
          isLembur: true,
        },
         {
          namaKegiatan: 'Upacara 17 Agustus 2026',
          tanggal: addDays(24), waktu: '07:00',
          tempat: 'Lapangan Pemkab Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DISETUJUI,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(2),
          isLembur: false,
        },
        {
          namaKegiatan: 'Rapat Anggaran Perubahan APBD 2026',
          tanggal: addDays(30), waktu: '09:00',
          tempat: 'Aula DPRD Brebes',
          pejabat: 'Bupati', leadingSectorId: findSector('Bagian Umum'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DRAFT,
          petugasProtokolId: pilihProtokol(2), petugasLiputanId: pilihLiputan(0),
          isLembur: false,
        },
        {
          namaKegiatan: 'Kunjungan Dinas ke Kecamatan Bumiayu',
          tanggal: addDays(45), waktu: '08:30',
          tempat: 'Kantor Kecamatan Bumiayu',
          pejabat: 'Wakil Bupati', leadingSectorId: findSector('Dinas Pendidikan'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DRAFT,
          petugasProtokolId: pilihProtokol(0), petugasLiputanId: pilihLiputan(1),
          isLembur: true,
        },
        {
          namaKegiatan: 'Expo Pembangunan Daerah 2026',
          tanggal: addDays(60), waktu: '09:00',
          tempat: 'GOR Adipura Brebes',
          pejabat: 'Bupati & Wakil Bupati', leadingSectorId: findSector('Diskominfo'),
          statusSambutan: StatusSambutan.BELUM, statusKegiatan: StatusKegiatan.DRAFT,
          petugasProtokolId: pilihProtokol(1), petugasLiputanId: pilihLiputan(2),
          catatan: 'Menunggu approval anggaran',
          isLembur: false,
        },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });