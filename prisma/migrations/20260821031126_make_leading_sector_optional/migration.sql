-- DropForeignKey
ALTER TABLE "kegiatan" DROP CONSTRAINT "kegiatan_leadingSectorId_fkey";

-- AlterTable
ALTER TABLE "kegiatan" ALTER COLUMN "leadingSectorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_leadingSectorId_fkey" FOREIGN KEY ("leadingSectorId") REFERENCES "leading_sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;
