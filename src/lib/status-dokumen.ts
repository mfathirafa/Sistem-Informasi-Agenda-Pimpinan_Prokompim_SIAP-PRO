export const JENIS_DOKUMEN_OPTIONS = [
    'SURAT_TUGAS',
    'SURAT_UNDANGAN',
    'NASKAH_SAMBUTAN',
    'DOKUMENTASI_FOTO',
    'DOKUMENTASI_VIDEO',
    'BERKAS_SPJ',
    'LAPORAN_AKHIR',
] as const;

export type JenisDokumenValue = (typeof JENIS_DOKUMEN_OPTIONS)[number];

export const JENIS_DOKUMEN_LABEL: Record<JenisDokumenValue, string> = {
    SURAT_TUGAS: 'Surat Tugas',
    SURAT_UNDANGAN: 'Surat Undangan',
    NASKAH_SAMBUTAN: 'Naskah Sambutan',
    DOKUMENTASI_FOTO: 'Dokumentasi Foto',
    DOKUMENTASI_VIDEO: 'Dokumentasi Video',
    BERKAS_SPJ: 'Berkas SPJ',
    LAPORAN_AKHIR: 'Laporan Akhir',
};

export const STATUS_DOKUMEN_OPTIONS = ['BELUM_UPLOAD', 'SUDAH_UPLOAD', 'PERLU_REVISI'] as const;

export type StatusDokumenValue = (typeof STATUS_DOKUMEN_OPTIONS)[number];

export const STATUS_DOKUMEN_LABEL: Record<StatusDokumenValue, string>= {
    BELUM_UPLOAD: 'Belum Upload',
    SUDAH_UPLOAD: 'Sudah Upload',
    PERLU_REVISI: 'Perlu Revisi',
};

// Reuse badge tone classes yang sudah ada di global.css (badge-belum / bagde-sudah /
// badge-menunggu-persetujuan) - tidak perlu ditambah CSS baru untuk fitur ini.
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