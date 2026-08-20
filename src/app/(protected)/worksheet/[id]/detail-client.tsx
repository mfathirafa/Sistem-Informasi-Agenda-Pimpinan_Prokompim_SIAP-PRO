'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Check } from 'lucide-react';
import { saveDokumenKegiatan } from '@/app/actions/dokumen';
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

type ActivityLogItem = {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  userName: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Dibuat',
  UPDATE: 'Diperbarui',
  DELETE: 'Dihapus',
};

const ACTION_ICON: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
};

function formatChanges(changes: Record<string, unknown> | null): string {
  if (!changes) return '-';
  const after = changes.after as Record<string, unknown> | undefined;
  const before = changes.before as Record<string, unknown> | undefined;
  
  if (after && !before) {
    // CREATE
    return 'Data kegiatan dibuat';
  }
  if (before && after) {
    // UPDATE - list changed fields
    const changedKeys = Object.keys(before).filter(
      (k) => String(before[k] ?? '') !== String(after[k] ?? '')
    );
    if (changedKeys.length === 0) return 'Data diperbarui';
    return `Perubahan: ${changedKeys.slice(0, 3).join(', ')}${changedKeys.length > 3 ? ` (+${changedKeys.length - 3} lainnya)` : ''}`;
  }
  return 'Data diperbarui';
}

export default function DetailClient({
  kegiatan,
  dokumen,
  activityLog,
}: {
  kegiatan: KegiatanDetail;
  dokumen: DokumenDetail[];
  activityLog: ActivityLogItem[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simpan nilai awal sekali -- dipakai untuk init state & perbandingan dirty.
  const initialFolderLink = dokumen.find((d) => d.link)?.link ?? '';

  // Link folder sama untuk semua dokuemn.
  const [folderLink, setFolderLink] = useState(initialFolderLink);

  // Status per jenis -- Map di dalam, diubah ke array saat submit (mengikuti payload backend).
  const [statuses, setStatuses] = useState<Map<JenisDokumenValue, StatusDokumenValue>>(() => {
    const m = new Map<JenisDokumenValue, StatusDokumenValue>();
    for (const d of dokumen) m.set(d.jenis, d.status);
    return m;
  });

  const progress = hitungProgressDokumen(dokumen);

  // Cocokkan per jenis (bukan urutan array).
  const dirty = 
  folderLink.trim() !== initialFolderLink ||
  dokumen.some((d) => statuses.get(d.jenis) !== d.status);

  const openUrl = (() => {
    const t = folderLink.trim();
    if (!t) return null;
    try {
      return new URL(t).toString();
    } catch {
      return null;
    }
  })();

  async function handleSave() {
    setSaving(true);
    setError(null);
    // Konversi Map -> array { jenis, status } mengikuti bentuk payload backend.c
    const payload = Array.from(statuses, ([jenis, status]) => ({ jenis, status }));
    const result = await saveDokumenKegiatan(kegiatan.id, folderLink.trim() || null, payload);
    setSaving(false);
    if (result.ok) {
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
              <dt className="text-muted">Nomor Surat</dt>
              <dd className="font-medium">{kegiatan.nomorSurat || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted">Dresscode</dt>
              <dd className="font-medium">{kegiatan.dresscode || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted">PIC (LS)</dt>
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

      {/* Dokumen */}
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
            <div className="bg-navy h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-4">
            {/*Link Google Drive folder - berlaku untuk semua jenis dokumen */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Link Google Drive (folder)</label>
                {openUrl && (
                  <a 
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy hover:underline"
                  >
                    <ExternalLink size={12} /> Buka
                  </a>
                )}
              </div>
              <input 
                type="url"
                value={folderLink}
                onChange={(e) => setFolderLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              />
              <p className="text-xs text-muted mt-1">
                Link ini otomatis dipakai untuk semua jenis dokumen.
              </p>
            </div>

            {/* Daftar status per jenis dokumen */}
            <div className="border border-app rounded-lg divide-y divide-app">
                {dokumen.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <p className="text-sm font-medium">
                      {JENIS_DOKUMEN_LABEL[d.jenis]}
                    </p>
                    <select 
                      value={statuses.get(d.jenis) ?? d.status}
                      onChange={(ev) => 
                        setStatuses((prev) => {
                          const next = new Map(prev);
                          next.set(d.jenis, ev.target.value as StatusDokumenValue);
                          return next;
                        })
                      }
                      className="w-44 text-sm border border-app rounded-lg px-3 py-1.5"
                    >
                      {STATUS_DOKUMEN_OPTIONS.map((s)=> (
                        <option 
                          key={s}
                          value={s}
                        >
                          {STATUS_DOKUMEN_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>

            {/* Simpan */}
            <div className="flex items-center justify-end gap-3">
              {error && 
                <p className="text-xs text-red-600">
                  {error}
                </p>}
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-1 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Check size={14} />
                {saving ? 'Menyimpan...' : 'Simpan'} 
              </button>
            </div>
          </div>
      </div>
      
      {/* Activity Log */}
      {activityLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-app p-5">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wide mb-4">
            Riwayat Perubahan
          </h2>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={`mt-0.5 px-2 rounded text-xs font-medium ${ACTION_ICON[log.action]}`}>
                  {ACTION_LABEL[log.action]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy">
                    {formatChanges(log.changes)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    oleh {log.userName} • {new Date(log.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
