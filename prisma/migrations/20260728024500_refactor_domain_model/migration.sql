/*
  Warnings:

  - The values [DRAFT,MENUNGGU_PERSETUJUAN,DISETUJUI,DILAKSANAKAN,MENUNGGU_DOKUMEN,SPJ_DIPROSES] on the enum `StatusKegiatan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isLembur` on the `kegiatan` table. All the data in the column will be lost.
  - You are about to drop the column `petugasLiputanId` on the `kegiatan` table. All the data in the column will be lost.
  - You are about to drop the column `petugasProtokolId` on the `kegiatan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusPublikasi" AS ENUM ('BELUM_DIRILIS', 'DIRILIS');

-- CreateEnum
CREATE TYPE "JenisPenugasan" AS ENUM ('LEMBUR', 'SPPD');

-- CreateTable (dibutuhkan sebelum INSERT data migration)
CREATE TABLE "kegiatan_petugas" (
    "kegiatanId" TEXT NOT NULL,
    "petugasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kegiatan_petugas_pkey" PRIMARY KEY ("kegiatanId","petugasId")
);

-- CreateIndex
CREATE INDEX "kegiatan_petugas_petugasId_idx" ON "kegiatan_petugas"("petugasId");

-- AddForeignKey
ALTER TABLE "kegiatan_petugas" ADD CONSTRAINT "kegiatan_petugas_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan_petugas" ADD CONSTRAINT "kegiatan_petugas_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "petugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (harus sebelum DROP COLUMN)
ALTER TABLE "kegiatan" DROP CONSTRAINT "kegiatan_petugasLiputanId_fkey";

ALTER TABLE "kegiatan" DROP CONSTRAINT "kegiatan_petugasProtokolId_fkey";

-- Tambah kolom baru sebelum migrasi data
ALTER TABLE "kegiatan" ADD COLUMN "jenisPenugasan" "JenisPenugasan" NOT NULL DEFAULT 'LEMBUR';

ALTER TABLE "kegiatan" ADD COLUMN "statusPublikasi" "StatusPublikasi" NOT NULL DEFAULT 'BELUM_DIRILIS';

-- Data Migration: petugasProtokolId -> kegiatan_petugas
INSERT INTO "kegiatan_petugas" ("kegiatanId", "petugasId", "createdAt")
SELECT "id", "petugasProtokolId", NOW() FROM "kegiatan" WHERE "petugasProtokolId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Data Migration: petugasLiputanId -> kegiatan_petugas
INSERT INTO "kegiatan_petugas" ("kegiatanId", "petugasId", "createdAt")
SELECT "id", "petugasLiputanId", NOW() FROM "kegiatan" WHERE "petugasLiputanId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Data Migration: isLembur -> jenisPenugasan
UPDATE "kegiatan" SET "jenisPenugasan" = 'SPPD' WHERE "isLembur" = false;

-- ALterEnum (dengan CASE mapping - aman meskipun ada nnilai enum lama)
BEGIN;
CREATE TYPE "StatusKegiatan_new" AS ENUM ('ACARA_MASUK', 'MENUNGGU_PENUGASAN', 'KEGIATAN_SELESAI', 'SPJ_SELESAI');
ALTER TABLE "kegiatan" ALTER COLUMN "statusKegiatan" DROP DEFAULT;
ALTER TABLE "kegiatan" ALTER COLUMN "statusKegiatan" TYPE "StatusKegiatan_new" USING (
  CASE "statusKegiatan"::text
    WHEN 'DRAFT' THEN 'ACARA_MASUK'::"StatusKegiatan_new"
    WHEN 'MENUNGGU_PERSETUJUAN' THEN 'ACARA_MASUK'::"StatusKegiatan_new"
    WHEN 'DISETUJUI' THEN 'ACARA_MASUK'::"StatusKegiatan_new"
    WHEN 'DILAKSANAKAN' THEN 'MENUNGGU_PENUGASAN'::"StatusKegiatan_new"
    WHEN 'MENUNGGU_DOKUMEN' THEN 'KEGIATAN_SELESAI'::"StatusKegiatan_new"
    WHEN 'SPJ_DIPROSES' THEN 'SPJ_SELESAI'::"StatusKegiatan_new"
    WHEN 'SPJ_SELESAI' THEN 'SPJ_SELESAI'::"StatusKegiatan_new"
    ELSE 'ACARA_MASUK'::"StatusKegiatan_new"
   END
);
ALTER TYPE "StatusKegiatan" RENAME TO "StatusKegiatan_old";
ALTER TYPE "StatusKegiatan_new" RENAME TO "StatusKegiatan";
DROP TYPE "StatusKegiatan_old";
ALTER TABLE "kegiatan" ALTER COLUMN "statusKegiatan" SET DEFAULT 'ACARA_MASUK';
COMMIT;

-- Drop old columns (data sudah dimigrasi)
ALTER TABLE "kegiatan" DROP COLUMN "isLembur",
DROP COLUMN "petugasLiputanId",
DROP COLUMN "petugasProtokolId";

