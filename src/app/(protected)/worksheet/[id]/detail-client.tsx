'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Pencil, Check, X } from 'lucide-react';
import { updateDokumen } from '@/app/actions/dokumen';
import {
  JENIS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_LABEL,
  STATUS_DOKUMEN_BADGE_CLASS,
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

type EditForm = {
  status: StatusDokumenValue;
  link: string;
  catatan: string;
};

export default function DetailClient({
  kegiatan,
  dokumen,
}: {
  kegiatan: KegiatanDetail;
  dokumen: DokumenDetail[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({
    status: 'BELUM_UPLOAD',
    link: '',
    catatan: '',
  });
  const [error, setError] = useState<string | null>(null);

  const progress = hitungProgressDokumen(dokumen);

  function handleEdit(doc: DokumenDetail) {
    setEditingId(doc.id);
    setForm({
      status: doc.status,
      link: doc.link ?? '',
      catatan: doc.catatan ?? '',
    });
    setError(null);
  }

  function handleCancel() {
    setEditingId(null);
    setError(null);
  }

  async function handleSave(id: string) {
    setSaving(true);
    setError(null);
    const result = await updateDokumen({
      id,
      status: form.status,
      link: form.link || null,
      catatan: form.catatan || null,
    });
    setSaving(false);
    if (result.ok) {
      setEditingId(null);
      router.refresh();
    } else {
      setError(result.error ?? 'Terjadi kesalahan.');
    }
  }

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
            <dt className="text-muted">Nama PIC</dt>
            <dd className="font-medium">{kegiatan.picNama || '-'}</dd>
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

        {/* Daftar Dokumen */}
        <div className="space-y-3">
          {dokumen.map((d) => {
            const isEditing = editingId === d.id;

            return (
              <div key={d.id} className="p-3 rounded-lg bg-slate-50">
                {isEditing ? (
                  /* ---- Edit Mode ---- */
                  <div className="space-y-3">
                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {error}
                      </p>
                    )}
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            status: e.target.value as StatusDokumenValue,
                          }))
                        }
                        className="w-full text-sm border border-app rounded-lg px-3 py-2"
                      >
                        {STATUS_DOKUMEN_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_DOKUMEN_LABEL[s]}
                          </option>
                        ))}  
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      Link Google Drive
                    </label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => 
                        setForm((f) => ({ ...f, link: e.target.value }))
                      }
                      placeholder="https://drive.google.com/..."
                      className="w-full text-sm border border-app rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      Catatan
                    </label>
                    <textarea
                      value={form.catatan}
                      onChange={(e) => 
                        setForm((f) => ({ ...f, catatan: e.target.value }))
                      }
                      rows={2}
                      className="w-full text-sm border border-app rounded-lg px-3 py-2 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(d.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg disabled:opacity-50">
                          <Check size={14} />
                          {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted hover:text-navy rounded-lg disabled:opacity-50"
                      >
                        <X size={14} /> Batal
                      </button>
                  </div>
                </div>
                ) : (
                  /* ---- View Mode ---- */
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {JENIS_DOKUMEN_LABEL[d.jenis]}
                      </p>
                      {d.catatan && (
                        <p className="text-xs text-muted mt-0.5">
                          {d.catatan}
                        </p>
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
                      <button
                        onClick={() => handleEdit(d)}
                        className="p-1 text-muted hover:text-navy rounded"
                        title="Edit dokumen"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}