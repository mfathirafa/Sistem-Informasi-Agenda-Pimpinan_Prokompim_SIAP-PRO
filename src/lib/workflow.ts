import { StatusKegiatan } from "@prisma/client";

// Urutan workflow - index menentukan posisi
const WORKFLOW_ORDER = [
    StatusKegiatan.DRAFT,
    StatusKegiatan.MENUNGGU_PERSETUJUAN,
    StatusKegiatan.DISETUJUI,
    StatusKegiatan.DILAKSANAKAN,
    StatusKegiatan.MENUNGGU_DOKUMEN,
    StatusKegiatan.SPJ_DIPROSES,
    StatusKegiatan.SPJ_SELESAI,
] as const;

type Status = (typeof WORKFLOW_ORDER)[number];

/** Cek apakah transisi dari `from` ke `to` valid (hanya maju 1 langkah). */
export function canTransition(from: Status, to: Status): boolean {
    const fromIdx = WORKFLOW_ORDER.indexOf(from);
    const toIdx = WORKFLOW_ORDER.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return false;
    return toIdx === fromIdx + 1;
}

/** Pesan error jika transisi tidak valid. Null jika valid. */
export function validateTransition(from: Status, to: Status): string | null {
  if (from === to) return null;
  if (!canTransition(from, to)) {
    return `Status tidak bisa berubah dari "${from}" ke "${to}". Urutan yang benar: ${WORKFLOW_ORDER.join(' → ')}.`;
  }
  return null;
}
