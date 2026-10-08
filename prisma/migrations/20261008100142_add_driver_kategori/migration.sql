-- AlterEnum
ALTER TYPE "KategoriPetugas" ADD VALUE 'DRIVER';

-- AlterTable
ALTER TABLE "kegiatan" ADD COLUMN "allCrewDriver" BOOLEAN NOT NULL DEFAULT false;
