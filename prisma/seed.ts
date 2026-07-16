import { PrismaClient, Role, StatusSambutan } from '@prisma/client';
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

  const count = await prisma.kegiatan.count();
  if (count === 0) {
    const today = new Date();
    const addDays = (d: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      return dt;
    };

    await prisma.kegiatan.createMany({
      data: [
        {
          namaKegiatan: 'Rapat Koordinasi Persiapan HUT Kabupaten',
          tanggal: addDays(3),
          waktu: '09:00',
          tempat: 'Pendopo Kabupaten Brebes',
          pejabat: 'Bupati',
          leadingSector: 'Bagian Protokol dan Komunikasi Pimpinan',
          statusSambutan: StatusSambutan.BELUM,
          petugasProtokol: 'Rian, Dewi',
          petugasLiputan: 'Aron',
        },
        {
          namaKegiatan: 'Peresmian Jembatan Desa Kalibuntu',
          tanggal: addDays(-2),
          waktu: '08:30',
          tempat: 'Desa Kalibuntu, Kec. Bumiayu',
          pejabat: 'Wakil Bupati',
          leadingSector: 'Dinas PUPR',
          statusSambutan: StatusSambutan.SUDAH,
          petugasProtokol: 'Dewi',
          petugasLiputan: 'Aron, Fajar',
          linkUpload: 'https://drive.google.com/drive/folders/contoh1',
        },
        {
          namaKegiatan: 'Kunjungan Kerja Dinas Kesehatan ke Puskesmas Larangan',
          tanggal: addDays(7),
          waktu: '10:00',
          tempat: 'Puskesmas Larangan',
          pejabat: 'Bupati & Wakil Bupati',
          leadingSector: 'Dinas Kesehatan',
          statusSambutan: StatusSambutan.BELUM,
          petugasProtokol: 'Rian',
          petugasLiputan: 'Fajar',
          catatan: 'Menunggu konfirmasi jadwal final',
        },
      ],
    });
  }

  console.log('Seed selesai.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
