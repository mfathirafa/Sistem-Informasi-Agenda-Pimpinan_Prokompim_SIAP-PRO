import { JenisPenugasan } from '@prisma/client';

// Diturunkan langsung dari enum Prisma - kalau schema berubah ini otomatis ikut berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const JENIS_PENUGASAN_OPTIONS = Object.values(JenisPenugasan);

export type JenisPenugasanValue = JenisPenugasan;

export const JENIS_PENUGASAN_LABEL: Record<JenisPenugasanValue, string> = {
    LEMBUR: 'Lembur',
    SPPD: 'SPPD',
    KEGIATAN: 'Biasa',
};

// Tone badge yang sudah ada di globals.css - tidak perli CSS baru.
// LEMBUR kuning (menunggu), SPPD/KEGIATAN hijau (penugasan tetap).
export const JENIS_PENUGASAN_BADGE_CLASS: Record<JenisPenugasanValue, string> = {
    LEMBUR: 'badge-menunggu-persetujuan',
    SPPD: 'badge-sudah',
    KEGIATAN: 'badge-sudah',
};