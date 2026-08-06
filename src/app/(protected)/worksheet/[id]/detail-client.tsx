'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Check } from 'lucide-react';
import { updateDokumen } from '@/app/actions/dokumen';
import {
  JENIS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_OPTIONS,
  hitungProgressDokumen,
  type JenisDokumenValue,
  type StatusDokumenValue,
} from '@/lib/constants/status-dokumen';
import { JENIS_PENUGASAN_LABEL, type JenisPenugasanValue } from '@/lib/constants/status-penugasan';
import { STATUS_PUBLIKASI_LABEL, type StatusPublikasiValue } from '@/lib/constants/status-publikasi';

type KegiatanDetail = {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  waktu: string | null;
  tempat: string;
  pejabat: string;
  perihalSurat: string | null;
  nomorSurat: string | null;
  dresscode: string | null;
  picNama: string | null;
  picNoHp: string | null;
  leadingSectorNama: string;
  jenisPenugasan: JenisPenugasanValue;
  statusPublikasi: StatusPublikasiValue;
};

type DokumenDetail = {
  id: string;
  jenis: JenisDokumenValue;
  status: StatusDokumenValue;
  link: string | null;
  catatan: string | null;
};

// Satu baris dokumen selalu dalam mode edit (flat list, tanpa expand).
function DokumenRow({ doc }: { doc: DokumenDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusDokumenValue>(doc.status);
  const [link, setLink] = useState(doc.link ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catatan tidak ditampilkan, tapi nilainya dipertahankan saat update.
  const catatan = doc.catatan;

  const dirty = status !== doc.status || link !== (doc.link ?? '');

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateDokumen({
      id: doc.id,
      status,
      link: link || null,
      catatan,
    });
    setSaving(false);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error ?? 'Terjadi kesalahan.');
    }
  }

  return (
    <div className="p-3 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium">{JENIS_DOKUMEN_LABEL[doc.jenis]}</p>
        {doc.link && (
          <a
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-navy hover:underline"
          >
            <ExternalLink size={12} /> Buka
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusDokumenValue)}
          className="w-44 text-sm border border-app rounded-lg px-3 py-1.5"
        >
          {STATUS_DOKUMEN_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_DOKUMEN_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="flex-1 min-w-[200px] text-sm border border-app rounded-lg px-3 py-1.5"
        />
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg disabled:opacity-50"
        >
          <Check size={14} />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

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
            <dt className="text-muted">Perihal Surat</dt>
            <dd className="font-medium">{kegiatan.perihalSurat || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted">Nomor Surat</dt>
            <dd className="font-medium">{kegiatan.nomorSurat || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted">Dresscode</dt>
            <dd className="font-medium">{kegiatan.dresscode || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted">No. HP PIC</dt>
            <dd className="font-medium">{kegiatan.picNoHp || '-'}</dd>
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
            <dt className="text-muted">Jenis Penugasan</dt>
            <dd className="font-medium">{JENIS_PENUGASAN_LABEL[kegiatan.jenisPenugasan]}</dd>
          </div>
          <div>
            <dt className="text-muted">Status Publikasi</dt>
            <dd className="font-medium">{STATUS_PUBLIKASI_LABEL[kegiatan.statusPublikasi]}</dd>
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

        {/* Daftar Dokumen — semua baris selalu editable */}
        <div className="space-y-3">
          {dokumen.map((d) => (
            <DokumenRow key={d.id} doc={d} />
          ))}
        </div>
      </div>
    </div>
  );
}
