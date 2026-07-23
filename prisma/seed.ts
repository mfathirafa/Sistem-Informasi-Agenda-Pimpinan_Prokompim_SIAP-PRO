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
    { nama: 'Rian', jabatan: 'Staf Protokol', noHp: '081234500001' },
    { nama: 'Dewi', jabatan: 'Staf Protokol', noHp: '081234500002' },
    { nama: 'Ahmad', jabatan: 'Staf Protokol', noHp: '081234500003' },
    { nama: 'Aron', jabatan: 'Staf Liputan', noHp: '081234500004' },
    { nama: 'Fajar', jabatan: 'Staf Liputan', noHp: '081234500005' },
    { nama: 'Dimas', jabatan: 'Staf Liputan', noHp: '081234500006' },
  ];
  const petugasList: Record<string, string> = {};
  for (const p of petugasData) {
    const existing = await prisma.petugas.findFirst({ where: { nama: p.nama } });
    if (existing) {
      petugasList[p.nama] = existing.id;
    } else {
      const created = await prisma.petugas.create({ data: p });
      petugasList[p.nama] = created.id;
    }
  }

  const findSector = (nama: string) => leadingSectors.find((s) => s.nama === nama)!.id;

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
          leadingSectorId: findSector('Bagian Protokol dan Komunikasi Pimpinan'),
          statusSambutan: StatusSambutan.BELUM,
          petugasProtokolId: petugasList['Rian'],
          petugasLiputanId: petugasList['Aron'],
        },
        {
          namaKegiatan: 'Peresmian Jembatan Desa Kalibuntu',
          tanggal: addDays(-2),
          waktu: '08:30',
          tempat: 'Desa Kalibuntu, Kec. Bumiayu',
          pejabat: 'Wakil Bupati',
          leadingSectorId: findSector('Dinas PUPR'),
          statusSambutan: StatusSambutan.SUDAH,
          petugasProtokolId: petugasList['Dewi'],
          petugasLiputanId: petugasList['Fajar'],
          linkUpload: 'https://drive.google.com/drive/folders/contoh1',
        },
        {
          namaKegiatan: 'Kunjungan Kerja Dinas Kesehatan ke Puskesmas Larangan',
          tanggal: addDays(7),
          waktu: '10:00',
          tempat: 'Puskesmas Larangan',
          pejabat: 'Bupati & Wakil Bupati',
          leadingSectorId: findSector('Dinas Kesehatan'),
          statusSambutan: StatusSambutan.BELUM,
          petugasProtokolId: petugasList['Ahmad'],
          catatan: 'Menunggu konfirmasi jadwal final',
        },
        {
          namaKegiatan: 'Rapat Koordinasi Kabupaten',
          tanggal: today,
          waktu: '09:00',
          tempat: 'Pendopo Kab. Brebes',
          pejabat: 'Bupati',
          leadingSectorId: findSector('Diskominfo'),
          statusSambutan: StatusSambutan.BELUM,
          petugasProtokolId: petugasList['Ahmad'],
          petugasLiputanId: petugasList['Dimas'],
          catatan: 'Koordinasi persiapan acara tingkat kabupaten.',
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