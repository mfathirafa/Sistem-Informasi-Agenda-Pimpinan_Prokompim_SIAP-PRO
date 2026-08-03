import { StatusPublikasi } from '@prisma/client';

// Diturunkan langsung dari enum Prisma - kalau schema berubah ini otomatis ikut berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const STATUS_PUBLIKASI_OPTIONS = Object.values(StatusPublikasi);

export type StatusPublikasiValue = StatusPublikasi;

export const STATUS_PUBLIKASI_LABEL: Record<StatusPublikasiValue, string> = {
    BELUM_DIRILIS: 'Belum Dirilis',
    TIDAK_DIRILIS: 'Tidak Dirilis',
    DIRILIS: 'Dirilis',
};

// Tone badge yang sudah ada di globals.css - tidak perlu CSS baru.
export const STATUS_PUBLIKASI_BADGE_CLASS: Record<StatusPublikasiValue, string> = {
    BELUM_DIRILIS: 'badge-belum',
    TIDAK_DIRILIS: 'badge-belum',
    DIRILIS: 'badge-sudah',
};