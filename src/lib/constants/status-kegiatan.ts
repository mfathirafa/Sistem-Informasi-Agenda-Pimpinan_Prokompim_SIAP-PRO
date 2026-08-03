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

// Hex untuk chart recharts — sebelumnya duplikat di dashboard-stats.
export const STATUS_KEGIATAN_CHART_COLOR: Record<StatusKegiatanValue, string> = {
  ACARA_MASUK: '#A78BFA',
  MENUNGGU_PENUGASAN: '#FBBF24',
  KEGIATAN_SELESAI: '#34D399',
  SPJ_SELESAI: '#60A5FA',
};

// Tailwind bg+text untuk statusCellClass — sebelumnya duplikat di laporan-client.
export const STATUS_KEGIATAN_CELL_CLASS: Record<StatusKegiatanValue, string> = {
  ACARA_MASUK: 'bg-purple-100 text-purple-800',
  MENUNGGU_PENUGASAN: 'bg-yellow-100 text-yellow-800',
  KEGIATAN_SELESAI: 'bg-green-100 text-green-800',
  SPJ_SELESAI: 'bg-blue-100 text-blue-800',
};