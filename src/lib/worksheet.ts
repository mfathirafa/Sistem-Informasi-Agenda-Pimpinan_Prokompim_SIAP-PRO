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
    petugasProtokolId: string | null;
    petugasProtokolNama: string | null;
    petugasLiputanId: string | null;
    petugasLiputanNama: string | null;
    linkUpload: string | null;
    catatan: string | null;
    isLembur: boolean;
};

/** Cari nama petugas dari daftar opsi berdasarkan ID.
 * Saat multi-petugas diimplementasikan, ubah parameter `id` menjadi
 * `id: string | string[] | null | undefined` dan mapping array. */
export function findPetugasLabel(
    options: SearchableOption[],
    id: string | null | undefined,
): string {
    if (!id) return '';
    return options.find((o) => o.id === id)?.label || '';
}