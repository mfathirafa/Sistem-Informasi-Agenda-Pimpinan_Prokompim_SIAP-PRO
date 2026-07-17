-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'ATASAN');

-- CreateEnum
CREATE TYPE "StatusSambutan" AS ENUM ('SUDAH', 'BELUM');

-- CreateEnum
CREATE TYPE "StatusKegiatan" AS ENUM ('DRAFT', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'DILAKSANAKAN', 'MENUNGGU_DOKUMEN', 'SPJ_DIPROSES', 'SPJ_SELESAI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petugas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT,
    "noHp" TEXT,
    "statusAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leading_sector" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leading_sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" TEXT NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu" TEXT,
    "tempat" TEXT NOT NULL,
    "pejabat" TEXT NOT NULL,
    "leadingSectorId" TEXT NOT NULL,
    "statusSambutan" "StatusSambutan" NOT NULL DEFAULT 'BELUM',
    "statusKegiatan" "StatusKegiatan" NOT NULL DEFAULT 'DRAFT',
    "petugasProtokolId" TEXT,
    "petugasLiputanId" TEXT,
    "linkUpload" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "leading_sector_nama_key" ON "leading_sector"("nama");

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_leadingSectorId_fkey" FOREIGN KEY ("leadingSectorId") REFERENCES "leading_sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_petugasProtokolId_fkey" FOREIGN KEY ("petugasProtokolId") REFERENCES "petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_petugasLiputanId_fkey" FOREIGN KEY ("petugasLiputanId") REFERENCES "petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
