import type { SearchableOption } from "@/components/searchable-select";
import { STATUS_KEGIATAN_OPTIONS } from "./constants/status-kegiatan";
import { JenisPenugasanValue } from "./constants/status-penugasan"; 
import { StatusPublikasiValue } from "./constants/status-publikasi";

export type KegiatanRow = {
    id: string;
    namaKegiatan: string;
    tanggal: string;
    waktu: string | null;
    tempat: string;
    pejabat: string;
    leadingSectorId: string;
    leadingSectorNama: string;
    statusSambutan: 'SUDAH' | 'BELUM';
    statusKegiatan: (typeof STATUS_KEGIATAN_OPTIONS)[number];
    petugasProtokolIds: string[];
    petugasProtokolNama: string[];
    petugasLiputanIds: string[];
    petugasLiputanNama: string[];
    linkUpload: string | null;
    catatan: string | null;
    jenisPenugasan: JenisPenugasanValue;
    statusPublikasi: StatusPublikasiValue;
};

/** Cari nama petugas dari daftar opsi berdasarkan ID.
 * Saat multi-petugas diimplementasikan, ubah parameter `id` menjadi
 * `id: string | string[] | null | undefined` dan mapping array. */
export function findPetugasLabel(
    options: SearchableOption[],
    ids: string[],
): string[] {
    return ids.map((id) => options.find((o) => o.id === id)?.label || id).filter(Boolean);
}