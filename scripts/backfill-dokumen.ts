/**
 * Script backfill satu kali pakai: memastikan setiap kegiatan yang sudah ada
 * punya 7 baris Dokumen wajib (untuk kegiatan yang dibuat sebelum fitur
 * Manajemen Dokumen ada). Idempotent - aman dijalankan berkali-kali.
 *
 * Ini BUKAN bagian dari seed. Data contoh dibuat lewat prisma/seed.ts;
 * script ini murni migrasi data untuk kegiatan yang sudah ada.
 *
 * Jalankan: npx tsx scripts/backfill-dokumen.ts
 */
import { PrismaClient, JenisDokumen } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jenisDokumenList = Object.values(JenisDokumen);
  const allKegiatan = await prisma.kegiatan.findMany({ select: { id: true, namaKegiatan: true } });

  let totalDibuat = 0;
  for (const k of allKegiatan) {
    const existing = await prisma.dokumen.findMany({ where: { kegiatanId: k.id }, select: { jenis: true } });
    const existingJenis = new Set(existing.map((d) => d.jenis));
    const missing = jenisDokumenList.filter((j) => !existingJenis.has(j));

    if (missing.length > 0) {
      await prisma.dokumen.createMany({
        data: missing.map((jenis) => ({ kegiatanId: k.id, jenis })),
      });
      totalDibuat += missing.length;
      console.log(`+ ${missing.length} dokumen dibuat untuk "${k.namaKegiatan}"`);
    }
  }

  console.log(`\nBackfill selesai. Total ${totalDibuat} baris dokumen baru, dari ${allKegiatan.length} kegiatan diperiksa.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });