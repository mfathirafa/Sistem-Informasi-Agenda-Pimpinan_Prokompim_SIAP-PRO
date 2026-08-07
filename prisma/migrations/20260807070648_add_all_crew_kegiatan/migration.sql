-- AlterTable
ALTER TABLE "kegiatan" ADD COLUMN     "allCrewLiputan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allCrewProtokol" BOOLEAN NOT NULL DEFAULT false;
