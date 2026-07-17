'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { KegiatanInput } from '@/app/actions/kegiatan';
import type { KegiatanRow } from './worksheet-client';
import SearchableSelect, { type SearchableOption } from '@/components/searchable-select';
import { STATUS_KEGIATAN_OPTIONS, STATUS_KEGIATAN_LABEL } from '@/lib/status-kegiatan';

const PEJABAT_OPTIONS = ['Bupati', 'Wakil Bupati', 'Bupati & Wakil Bupati', 'Lainnya'];

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}
function toDateInput(d: Date | string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export default function KegiatanModal({
  item,
  onClose,
  onSave,
  saving,
  petugasOptions,
  leadingSectorOptions,
}: {
  item: KegiatanRow | null;
  onClose: () => void;
  onSave: (data: KegiatanInput) => void;
  saving: boolean;
  petugasOptions: SearchableOption[];
  leadingSectorOptions: SearchableOption[];
}) {
  const [form, setForm] = useState<KegiatanInput>(() =>
    item
      ? {
          namaKegiatan: item.namaKegiatan,
          tanggal: toDateInput(item.tanggal),
          waktu: item.waktu || '',
          tempat: item.tempat,
          pejabat: item.pejabat,
          leadingSectorId: item.leadingSectorId,
          statusSambutan: item.statusSambutan,
          statusKegiatan: item.statusKegiatan,
          petugasProtokolId: item.petugasProtokolId,
          petugasLiputanId: item.petugasLiputanId,
          linkUpload: item.linkUpload || '',
          catatan: item.catatan || '',
        }
      : {
          namaKegiatan: '',
          tanggal: toDateInput(new Date()),
          waktu: '',
          tempat: '',
          pejabat: 'Bupati',
          leadingSectorId: leadingSectorOptions[0]?.id || '',
          statusSambutan: 'BELUM',
          statusKegiatan: 'DRAFT',
          petugasProtokolId: null,
          petugasLiputanId: null,
          linkUpload: '',
          catatan: '',
        }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof KegiatanInput>(field: K, value: KegiatanInput[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.namaKegiatan.trim()) errs.namaKegiatan = 'Wajib diisi';
    if (!form.tanggal.trim()) errs.tanggal = 'Wajib diisi';
    if (!form.tempat.trim()) errs.tempat = 'Wajib diisi';
    if (!form.leadingSectorId) errs.leadingSectorId = 'Wajib dipilih';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app">
          <h3 className="font-display text-lg font-semibold text-navy">
            {item ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
          </h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1 rounded-md hover:bg-app">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nama Kegiatan</label>
            <input
              value={form.namaKegiatan}
              onChange={(e) => update('namaKegiatan', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              placeholder="cth. Rapat Koordinasi..."
            />
            {errors.namaKegiatan && <p className="text-xs text-red-600 mt-1">{errors.namaKegiatan}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Status Kegiatan</label>
            <select
              value={form.statusKegiatan}
              onChange={(e) => update('statusKegiatan', e.target.value as (typeof STATUS_KEGIATAN_OPTIONS)[number])}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
            >
              {STATUS_KEGIATAN_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_KEGIATAN_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => update('tanggal', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              />
              {errors.tanggal && <p className="text-xs text-red-600 mt-1">{errors.tanggal}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Waktu</label>
              <input
                type="time"
                value={form.waktu}
                onChange={(e) => update('waktu', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tempat</label>
            <input
              value={form.tempat}
              onChange={(e) => update('tempat', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              placeholder="cth. Pendopo Kabupaten Brebes"
            />
            {errors.tempat && <p className="text-xs text-red-600 mt-1">{errors.tempat}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pejabat</label>
              <select
                value={form.pejabat}
                onChange={(e) => update('pejabat', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              >
                {PEJABAT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status Sambutan</label>
              <select
                value={form.statusSambutan}
                onChange={(e) => update('statusSambutan', e.target.value as 'SUDAH' | 'BELUM')}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              >
                <option value="BELUM">Belum</option>
                <option value="SUDAH">Sudah</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Leading Sector</label>
            <select
              value={form.leadingSectorId}
              onChange={(e) => update('leadingSectorId', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
            >
              <option value="">Pilih leading sector...</option>
              {leadingSectorOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.leadingSectorId && <p className="text-xs text-red-600 mt-1">{errors.leadingSectorId}</p>}
            {leadingSectorOptions.length === 0 && (
              <p className="text-xs text-muted mt-1">
                Belum ada data leading sector — tambahkan dulu lewat menu Master Leading Sector.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Petugas Protokol</label>
              <SearchableSelect
                options={petugasOptions}
                value={form.petugasProtokolId || null}
                onChange={(id) => update('petugasProtokolId', id)}
                placeholder="Cari nama petugas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Petugas Liputan</label>
              <SearchableSelect
                options={petugasOptions}
                value={form.petugasLiputanId || null}
                onChange={(id) => update('petugasLiputanId', id)}
                placeholder="Cari nama petugas..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Link Upload Dokumentasi</label>
            <input
              value={form.linkUpload}
              onChange={(e) => update('linkUpload', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => update('catatan', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}