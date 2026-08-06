export const KATEGORI_LEADING_SECTOR_OPTIONS = [
    'Forum Koordinasi Pimpinan Daerah',
    'Satuan Kerja Perangkat Daerah (SKPD)',
    'Dinas',
    'Instansi Vertikal',
    'Badan',
    'Rumah Sakit',
    'Perusahaan Umum Daerah',
    'Camat',
    'Lain-lain',
] as const;

export type KategoriLeadingSectorValue = (typeof KATEGORI_LEADING_SECTOR_OPTIONS)[number];