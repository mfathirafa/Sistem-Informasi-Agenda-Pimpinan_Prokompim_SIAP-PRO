-- CreateEnum
CREATE TYPE "JenisDokumen" AS ENUM ('SURAT_TUGAS', 'SURAT_UNDANGAN', 'NASKAH_SAMBUTAN', 'DOKUMENTASi_FOTO', 'DOKUMENTASi_VIDEO', 'BERKAS_SPJ', 'LAPORAN_AKHIR');

-- CreateEnum
CREATE TYPE "StatusDokumen" AS ENUM ('BELUM_UPLOAD', 'SUDAH_UPLOAD', 'PERLU_REVISI');

-- CreateTable
CREATE TABLE "dokumen" (
    "id" TEXT NOT NULL,
    "kegiatanId" TEXT NOT NULL,
    "jenis" "JenisDokumen" NOT NULL,
    "status" "StatusDokumen" NOT NULL DEFAULT 'BELUM_UPLOAD',
    "link" TEXT,
    "catatan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_kegiatanId_jenis_key" ON "dokumen"("kegiatanId", "jenis");

-- AddForeignKey
ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
