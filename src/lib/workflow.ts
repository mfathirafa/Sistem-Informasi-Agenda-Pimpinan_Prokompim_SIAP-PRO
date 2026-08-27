import { StatusKegiatan } from "@prisma/client";

// Urutan workflow - index menentukan posisi
const WORKFLOW_ORDER = [
    StatusKegiatan.ACARA_MASUK,
    StatusKegiatan.MENUNGGU_PENUGASAN,
    StatusKegiatan.KEGIATAN_SELESAI,
    StatusKegiatan.SPJ_SELESAI,
] as const;

type Status = (typeof WORKFLOW_ORDER)[number];

/** Cek apakah transisi dari `from` ke `to` valid (bisa maju atau mundur kapan saja). */
export function canTransition(from: Status, to: Status): boolean {
  const fromIdx = WORKFLOW_ORDER.indexOf(from);
  const toIdx = WORKFLOW_ORDER.indexOf(to);
  return fromIdx !== -1 && toIdx !== -1;
}

/** Pesan error jika transisi tidak valid. Null jika valid */
export function validateTransition(from: Status, to: Status): string | null {
  if (from === to) return null;
  if (!canTransition(from, to)) {
    return `Status "${to}" tidak valid.`;
  }
  return null;
}