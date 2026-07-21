import { JenisDokumen, StatusDokumen } from '@prisma/client';

// Diturunkan langsung dari enum Prisma - kalau schema berubah, ini otomatis ikut
// berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const JENIS_DOKUMEN_OPTIONS = Object.values(JenisDokumen);

export type JenisDokumenValue = JenisDokumen;

export const JENIS_DOKUMEN_LABEL: Record<JenisDokumenValue, string> = {
  SURAT_TUGAS: 'Surat Tugas',
  SURAT_UNDANGAN: 'Surat Undangan',
  NASKAH_SAMBUTAN: 'Naskah Sambutan',
  DOKUMENTASI_FOTO: 'Dokumentasi Foto',
  DOKUMENTASI_VIDEO: 'Dokumentasi Video',
  BERKAS_SPJ: 'Berkas SPJ',
  LAPORAN_AKHIR: 'Laporan Akhir',
};

export const STATUS_DOKUMEN_OPTIONS = Object.values(StatusDokumen);

export type StatusDokumenValue = StatusDokumen;

export const STATUS_DOKUMEN_LABEL: Record<StatusDokumenValue, string> = {
  BELUM_UPLOAD: 'Belum Upload',
  SUDAH_UPLOAD: 'Sudah Upload',
  PERLU_REVISI: 'Perlu Revisi',
};

// Reuses badge tone classes yang sudah ada di globals.css (badge-belum / badge-sudah /
// badge-menunggu-persetujuan) - tidak perlu tambah CSS baru untuk fitur ini.
export const STATUS_DOKUMEN_BADGE_CLASS: Record<StatusDokumenValue, string> = {
  BELUM_UPLOAD: 'badge-belum',
  SUDAH_UPLOAD: 'badge-sudah',
  PERLU_REVISI: 'badge-menunggu-persetujuan',
};

export function hitungProgressDokumen(dokumen: { status: StatusDokumenValue }[]): number {
  if (dokumen.length === 0) return 0;
  const selesai = dokumen.filter((d) => d.status === 'SUDAH_UPLOAD').length;
  return Math.round((selesai / dokumen.length) * 100);
}