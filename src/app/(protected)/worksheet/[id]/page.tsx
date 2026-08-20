import { notFound } from "next/navigation";
import { getKegiatanDetail } from "@/lib/queries/kegiatan";
import { getActivityLogByEntity } from "@/lib/activity-log";
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

    // Ambil activity log untuk kegiatan ini
    const activityLog = await getActivityLogByEntity(id);

    return (
      <DetailClient
        kegiatan={{
          id: kegiatan.id,
          namaKegiatan: kegiatan.namaKegiatan,
          tanggal: kegiatan.tanggal.toISOString(),
          waktu: kegiatan.waktu,
          tempat: kegiatan.tempat,
          pejabat: kegiatan.pejabat,
          perihalSurat: kegiatan.perihalSurat,
          nomorSurat: kegiatan.nomorSurat,
          dresscode: kegiatan.dresscode,
          picNama: kegiatan.picNama,
          picNoHp: kegiatan.picNoHp,
          leadingSectorNama: kegiatan.leadingSector.nama,
          jenisPenugasan: kegiatan.jenisPenugasan,
          statusPublikasi: kegiatan.statusPublikasi,
        }}
          dokumen={dokumenSorted.map((d) => ({
            id: d.id,
            jenis: d.jenis,
            status: d.status,
            link: d.link,
            catatan: d.catatan,
          }))}
          activityLog={activityLog.map((log) => ({
            id: log.id,
            action: log.action,
            userName: log.userName,
            changes: log.changes,
            createdAt: log.createdAt.toISOString(),
          }))}
        />
    );
}