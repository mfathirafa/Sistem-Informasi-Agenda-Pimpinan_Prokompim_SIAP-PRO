-- CreateEnum
CREATE TYPE "KategoriPetugas" AS ENUM ('PROTOKOL', 'LIPUTAN');

-- AlterTable
ALTER TABLE "petugas" ADD COLUMN     "kategori" "KategoriPetugas" NOT NULL DEFAULT 'PROTOKOL';
