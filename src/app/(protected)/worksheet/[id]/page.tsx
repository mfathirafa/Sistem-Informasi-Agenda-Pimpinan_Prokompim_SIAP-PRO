import { notFound } from "next/navigation";
import { getKegiatanDetail } from "@/lib/queries/kegiatan";
import { JENIS_DOKUMEN_OPTIONS } from "@/lib/constants/status-dokumen";
import DetailClient from "./detail-client";

export default async function DetailKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kegiatan = await getKegiatanDetail(id);
  if (!kegiatan) notFound();

  // Urutkan dokumen sesuai urutan standar, defensif terhadap data lama yang belum di-backfill.
  const dokumenMap = new Map(kegiatan.dokumen.map((d) => [d.jenis, d]));
  const dokumenSorted = JENIS_DOKUMEN_OPTIONS
    .map((jenis) => dokumenMap.get(jenis))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

    return (
      <DetailClient
        kegiatan={{
          id: kegiatan.id,
          namaKegiatan: kegiatan.namaKegiatan,
          tanggal: kegiatan.tanggal.toISOString(),
          waktu: kegiatan.waktu,
          tempat: kegiatan.tempat,
          pejabat: kegiatan.pejabat,
          leadingSectorNama: kegiatan.leadingSector.nama,
          isLembur: kegiatan.isLembur,
        }}
        dokumen={dokumenSorted.map((d) => ({
          id: d.id,
          jenis: d.jenis,
          status: d.status,
          link: d.link,
          catatan: d.catatan,
        }))}
      />
    );
}