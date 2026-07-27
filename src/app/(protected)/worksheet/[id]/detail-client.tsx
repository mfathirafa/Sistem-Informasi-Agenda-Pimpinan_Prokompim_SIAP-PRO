'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import {
  JENIS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_BADGE_CLASS,
  hitungProgressDokumen,
  type JenisDokumenValue,
  type StatusDokumenValue,
} from '@/lib/constants/status-dokumen';

type KegiatanDetail = {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  waktu: string | null;
  tempat: string;
  pejabat: string;
  leadingSectorNama: string;
  isLembur: boolean;
};

type DokumenDetail = {
  id: string;
  jenis: JenisDokumenValue;
  status: StatusDokumenValue;
  link: string | null;
  catatan: string | null;
};

export default function DetailClient({
  kegiatan,
  dokumen,
}: {
  kegiatan: KegiatanDetail;
  dokumen: DokumenDetail[];
}) {
  const router = useRouter();
  const progress = hitungProgressDokumen(dokumen);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-app text-navy"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">
            {kegiatan.namaKegiatan}
          </h1>
          <p className="text-sm text-muted">
            {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {kegiatan.waktu && ` • ${kegiatan.waktu}`}
          </p>
        </div>
      </div>

      {/* Info Kegiatan */}
      <div className="bg-white rounded-2xl border border-app p-5">
        <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wide mb-4">
          Informasi Kegiatan
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted">Tempat</dt>
            <dd className="font-medium">{kegiatan.tempat}</dd>
          </div>
          <div>
            <dt className="text-muted">Pejabat</dt>
            <dd className="font-medium">{kegiatan.pejabat}</dd>
          </div>
          <div>
            <dt className="text-muted">Leading Sector</dt>
            <dd className="font-medium">{kegiatan.leadingSectorNama}</dd>
          </div>
          <div>
            <dt className="text-muted">Waktu</dt>
            <dd className="font-medium">{kegiatan.waktu || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted">Lembur</dt>
            <dd className="font-medium">{kegiatan.isLembur ? 'Ya' : 'Tidak'}</dd>
          </div>
        </dl>
      </div>

      {/* Progress Dokumen */}
      <div className="bg-white rounded-2xl border border-app p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wide">
            Dokumen
          </h2>
          <span className="text-sm text-muted">
            {dokumen.filter((d) => d.status === 'SUDAH_UPLOAD').length} / {dokumen.length} selesai
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
          <div
            className="bg-navy h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Daftar Dokumen */}
        <div className="space-y-3">
          {dokumen.map((d) => (
            <div
              key={d.id}
              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {JENIS_DOKUMEN_LABEL[d.jenis]}
                </p>
                {d.catatan && (
                  <p className="text-xs text-muted mt-0.5">{d.catatan}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {d.link && (
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    <ExternalLink size={12} /> Buka
                  </a>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_DOKUMEN_BADGE_CLASS[d.status]}`}
                >
                  {STATUS_DOKUMEN_LABEL[d.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
