'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { KegiatanInput } from '@/app/actions/kegiatan';
import type { KegiatanRow } from '@/lib/worksheet';
import { type SearchableOption } from '@/components/searchable-select';
import PetugasPicker from '@/components/petugas-picker';
import { STATUS_KEGIATAN_OPTIONS, STATUS_KEGIATAN_LABEL } from '@/lib/constants/status-kegiatan';
import { JENIS_PENUGASAN_OPTIONS, JENIS_PENUGASAN_LABEL } from '@/lib/constants/status-penugasan';
import { STATUS_PUBLIKASI_OPTIONS, STATUS_PUBLIKASI_LABEL } from '@/lib/constants/status-publikasi';
import { toDateInput } from '@/lib/format';

const PEJABAT_OPTIONS = ['Bupati', 'Wakil Bupati', 'Bupati & Wakil Bupati', 'Lainnya'];

export default function KegiatanModal({
  item,
  onClose,
  onSave,
  saving,
  petugasProtokolOptions,
  petugasLiputanOptions,
  leadingSectorOptions,
}: {
  item: KegiatanRow | null;
  onClose: () => void;
  onSave: (data: KegiatanInput) => void;
  saving: boolean;
  petugasProtokolOptions: SearchableOption[];
  petugasLiputanOptions: SearchableOption[];
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
          perihalSurat: item.perihalSurat || '',
          picNama: item.picNama || '',
          picNoHp: item.picNoHp || '',
          leadingSectorId: item.leadingSectorId,
          statusSambutan: item.statusSambutan,
          statusKegiatan: item.statusKegiatan,
          petugasProtokolIds: item.petugasProtokolIds,
          petugasLiputanIds: item.petugasLiputanIds,
          linkUpload: item.linkUpload || '',
          catatan: item.catatan || '',
          jenisPenugasan: item.jenisPenugasan,
          statusPublikasi: item.statusPublikasi,
        }
      : {
          namaKegiatan: '',
          tanggal: toDateInput(new Date()),
          waktu: '',
          tempat: '',
          pejabat: 'Bupati',
          perihalSurat: '',
          picNama: '',
          picNoHp: '',
          leadingSectorId: leadingSectorOptions[0]?.id || '',
          statusSambutan: 'BELUM',
          statusKegiatan: 'ACARA_MASUK',
          petugasProtokolIds: [],
          petugasLiputanIds: [],
          linkUpload: '',
          catatan: '',
          jenisPenugasan: 'LEMBUR',
          statusPublikasi: 'BELUM_DIRILIS',
        }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomPejabat, setIsCustomPejabat] = useState(
    () => item != null && !PEJABAT_OPTIONS.includes(item.pejabat),
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [saving, onClose]);

  const update = <K extends keyof KegiatanInput>(field: K, value: KegiatanInput[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.namaKegiatan.trim()) errs.namaKegiatan = 'Wajib diisi';
    if (!form.tanggal.trim()) errs.tanggal = 'Wajib diisi';
    if (!form.tempat.trim()) errs.tempat = 'Wajib diisi';
    if (!form.leadingSectorId) errs.leadingSectorId = 'Wajib dipilih';
    if (isCustomPejabat && !form.pejabat.trim()) errs.pejabat = 'Nama pejabat wajib diisi';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kegiatan-modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app">
          <h3 id="kegiatan-modal-title" className="font-display text-lg font-semibold text-navy">
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
          <div>
            <label className="block text-sm font-medium mb-1.5">Perihal Surat</label>
            <input
              value={form.perihalSurat}
              onChange={(e) => update('perihalSurat', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              placeholder="cth. Undangan Rapat Koordinasi..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pejabat</label>
              <select
                value={isCustomPejabat ? 'Lainnya' : form.pejabat}
                onChange={(e) => {
                  if (e.target.value === 'Lainnya') {
                    setIsCustomPejabat(true);
                    update('pejabat', '');
                  } else {
                    setIsCustomPejabat(false);
                    update('pejabat', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
              >
                {PEJABAT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {isCustomPejabat && (
                <input
                  autoFocus
                  value={form.pejabat}
                  onChange={(e) => update('pejabat', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm mt-2"
                  placeholder="Ketik nama pejabat..."
                />
              )}
              {errors.pejabat && <p className="text-xs text-red-600 mt-1">{errors.pejabat}</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama PIC</label>
              <input
                value={form.picNama}
                onChange={(e) => update('picNama', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
                placeholder="cth. Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">No. HP PIC</label>
              <input
                value={form.picNoHp}
                onChange={(e) => update('picNoHp', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm"
                placeholder="cth. 0812xxxx"
              />
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
          <div>
            <label className="block text-sm font-medium mb-1.5">Jenis Penugasan</label>
            <select 
              value={form.jenisPenugasan} 
              onChange={(e) => update('jenisPenugasan', e.target.value as (typeof JENIS_PENUGASAN_OPTIONS)[number])}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
            >
             {JENIS_PENUGASAN_OPTIONS.map((j) => (
              <option key={j} value={j}>{JENIS_PENUGASAN_LABEL[j]}</option>
            ))}
            </select>
          </div>
          <div>
           <label className="block text-sm font-medium mb-1.5">Status Publikasi</label>
          <select value={form.statusPublikasi} onChange={(e) => update('statusPublikasi', e.target.value as (typeof STATUS_PUBLIKASI_OPTIONS)[number])}
          className="w-full px-3 py-2 rounded-lg border border-app text-sm"
          >
          {STATUS_PUBLIKASI_OPTIONS.map((s) => (
          <option key={s} value={s}>{STATUS_PUBLIKASI_LABEL[s]}</option>
          ))}
          </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PetugasPicker
              label="Petugas Protokol"
              options={petugasProtokolOptions}
              selected={form.petugasProtokolIds || []}
              onChange={(ids) => update('petugasProtokolIds', ids)}
              disabled={saving}
            />
            <PetugasPicker
              label="Petugas Liputan"
              options={petugasLiputanOptions}
              selected={form.petugasLiputanIds || []}
              onChange={(ids) => update('petugasLiputanIds', ids)}
              disabled={saving}
            />
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