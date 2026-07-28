import type { SearchableOption } from "@/components/searchable-select";
import { STATUS_KEGIATAN_OPTIONS } from "./constants/status-kegiatan";

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
    jenisPenugasan: 'LEMBUR' | 'SPPD';
    statusPublikasi: 'BELUM_DIRILIS' | 'DIRILIS';
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