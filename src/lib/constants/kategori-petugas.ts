import { KategoriPetugas } from "@prisma/client";

// Diturunkan langsung dari enum Prisma - kalau schema berubah, ini otomatis ikut berubah, tidak ada daftar string yang perlu disinkronkan manual.
export const  KATEGORI_PETUGAS_OPTIONS = Object.values(KategoriPetugas);

export type KategoriPetugasValue = KategoriPetugas;

export const KATEGORI_PETUGAS_LABEL: Record<KategoriPetugasValue, string> = {
    PROTOKOL: 'Protokol',
    LIPUTAN: 'Liputan',
};