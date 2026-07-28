import { StatusKegiatan } from '@prisma/client';

// Diturunkan langsung dari enum Prisma - kalau schema berubah, ini otomatis ikut
// berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const STATUS_KEGIATAN_OPTIONS = Object.values(StatusKegiatan);

export type StatusKegiatanValue = StatusKegiatan;

export const STATUS_KEGIATAN_LABEL: Record<StatusKegiatanValue, string> = {
 ACARA_MASUK: 'Acara Masuk',
 MENUNGGU_PENUGASAN: 'Menunggu Penugasan',
 KEGIATAN_SELESAI: 'Kegiatan Selesai',
 SPJ_SELESAI: 'SPJ Selesai',
};

export const STATUS_KEGIATAN_BADGE_CLASS: Record<StatusKegiatanValue, string> = {
  ACARA_MASUK: 'badge-draft',
  MENUNGGU_PENUGASAN: 'badge-menunggu-persetujuan',
  KEGIATAN_SELESAI: 'badge-sudah',
  SPJ_SELESAI: 'badge-sudah',
};