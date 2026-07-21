import { StatusKegiatan } from '@prisma/client';

// Diturunkan langsung dari enum Prisma - kalau schema berubah, ini otomatis ikut
// berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const STATUS_KEGIATAN_OPTIONS = Object.values(StatusKegiatan);

export type StatusKegiatanValue = StatusKegiatan;

export const STATUS_KEGIATAN_LABEL: Record<StatusKegiatanValue, string> = {
  DRAFT: 'Draft',
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  DISETUJUI: 'Disetujui',
  DILAKSANAKAN: 'Dilaksanakan',
  MENUNGGU_DOKUMEN: 'Menunggu Dokumen',
  SPJ_DIPROSES: 'SPJ Diproses',
  SPJ_SELESAI: 'SPJ Selesai',
};

export const STATUS_KEGIATAN_BADGE_CLASS: Record<StatusKegiatanValue, string> = {
  DRAFT: 'badge-draft',
  MENUNGGU_PERSETUJUAN: 'badge-menunggu-persetujuan',
  DISETUJUI: 'badge-disetujui',
  DILAKSANAKAN: 'badge-dilaksanakan',
  MENUNGGU_DOKUMEN: 'badge-menunggu-dokumen',
  SPJ_DIPROSES: 'badge-spj-diproses',
  SPJ_SELESAI: 'badge-sudah',
};