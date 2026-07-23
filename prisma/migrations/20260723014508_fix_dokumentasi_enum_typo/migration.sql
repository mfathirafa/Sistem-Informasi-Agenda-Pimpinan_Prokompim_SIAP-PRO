/*
  Warnings:

  - The values [DOKUMENTASi_FOTO,DOKUMENTASi_VIDEO] on the enum `JenisDokumen` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JenisDokumen_new" AS ENUM ('SURAT_TUGAS', 'SURAT_UNDANGAN', 'NASKAH_SAMBUTAN', 'DOKUMENTASI_FOTO', 'DOKUMENTASI_VIDEO', 'BERKAS_SPJ', 'LAPORAN_AKHIR');
ALTER TABLE "dokumen" ALTER COLUMN "jenis" TYPE "JenisDokumen_new" USING ("jenis"::text::"JenisDokumen_new");
ALTER TYPE "JenisDokumen" RENAME TO "JenisDokumen_old";
ALTER TYPE "JenisDokumen_new" RENAME TO "JenisDokumen";
DROP TYPE "JenisDokumen_old";
COMMIT;
