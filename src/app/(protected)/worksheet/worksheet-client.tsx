'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createKegiatan, updateKegiatan, deleteKegiatan, getKegiatanExport, type KegiatanInput } from '@/app/actions/kegiatan';
import type { SearchableOption } from '@/components/searchable-select';
import { STATUS_KEGIATAN_OPTIONS, STATUS_KEGIATAN_LABEL, STATUS_KEGIATAN_BADGE_CLASS } from '@/lib/constants/status-kegiatan';
import { JENIS_PENUGASAN_OPTIONS, JENIS_PENUGASAN_LABEL, JENIS_PENUGASAN_BADGE_CLASS } from '@/lib/constants/status-penugasan';
import { STATUS_PUBLIKASI_LABEL, STATUS_PUBLIKASI_BADGE_CLASS } from '@/lib/constants/status-publikasi';
import type { KegiatanFilter } from '@/lib/queries/kegiatan';
import KegiatanModal from './kegiatan-modal';
import type { KegiatanRow } from '@/lib/worksheet';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { toDateInput } from '@/lib/format';

const PEJABAT_OPTIONS = ['Bupati', 'Wakil Bupati', 'Bupati & Wakil Bupati', 'Lainnya'];

/** Format daftar nama petugas menjadi "Nama A, Nama B +N" agar sel tabel tetap ringkas. */
function petugasSummary(names: string[]): string {
  if (names.length === 0) return '-';
  const shown = names.slice(0, 2);
  const extra = names.length - shown.length;
  return extra > 0 ? `${shown.join(', ')} +${extra}` : shown.join(', ');
}

export default function WorksheetClient({
  initialData,
  total,
  page,
  pageSize,
  filters,
  bulanOptions,
  canEdit,
  petugasProtokolOptions,
  petugasLiputanOptions,
  leadingSectorOptions,
}: {
  initialData: KegiatanRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: KegiatanFilter;
  bulanOptions: string[];
  canEdit: boolean;
  petugasProtokolOptions: SearchableOption[];
  petugasLiputanOptions: SearchableOption[];
  leadingSectorOptions: SearchableOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KegiatanRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);
  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, total);

  /** Terapkan satu filter (sinkron ke URL), selalu kembali ke halaman 1. */
  const setFilter = (key: string, value: string | undefined) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.replace(`/worksheet?${params.toString()}`);
    });
  };

  const handlePageChange = (p: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.replace(`/worksheet?${params.toString()}`);
    });
  };

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openEdit = (item: KegiatanRow) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = (data: KegiatanInput) => {
    startTransition(async () => {
      const res = editingItem ? await updateKegiatan(editingItem.id, data) : await createKegiatan(data);
      if (res.ok) {
        setModalOpen(false);
        router.refresh(); // sinkronkan ulang data + total dengan server
        if (res.warning) alert(res.warning);
      } else {
        alert(res.error || 'Gagal menyimpan.');
      }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    setConfirmDelete({ id, nama });
    setDeleteError('');
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const res = await deleteKegiatan(confirmDelete.id);
      if (res.ok) {
        setConfirmDelete(null);
        router.refresh();
      } else {
        setDeleteError(res.error || 'Gagal menghapus.');
      }
    });
  };

  const exportExcel = async () => {
    const res = await getKegiatanExport(filters);
    if (!res.ok) {
      alert(res.error || 'Gagal mengekspor.');
      return;
    }
    const data = res.data;
    const header = [
      'Tanggal',
      'Nama Kegiatan',
      'Perihal Surat',
      'Tempat',
      'Pejabat',
      'PIC',
      'No. HP PIC',
      'Leading Sector',
      'Status Sambutan',
      'Status Kegiatan',
      'Petugas Protokol',
      'Petugas Liputan',
      'Link Upload',
      'Catatan',
      'Jenis Penugasan',
      'Status Publikasi',
    ];
    const rows = data.map((k) => [
      new Date(k.tanggal),
      k.namaKegiatan,
      k.perihalSurat || '',
      k.tempat,
      k.pejabat,
      k.picNama || '',
      k.picNoHp || '',
      k.leadingSectorNama,
      k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum',
      STATUS_KEGIATAN_LABEL[k.statusKegiatan],
      k.petugasProtokolNama || '',
      k.petugasLiputanNama || '',
      k.linkUpload || '',
      k.catatan || '',
      JENIS_PENUGASAN_LABEL[k.jenisPenugasan],
      STATUS_PUBLIKASI_LABEL[k.statusPublikasi],
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Auto-Width
    const colWidths = header.map((_, ci) => {
      const maxLen = Math.max(
        header[ci].length,
        ...rows.map((r) => String(r[ci] ?? '').length),
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Worksheet');
    XLSX.writeFile(wb, `worksheet-spj-${toDateInput(new Date())}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            defaultValue={filters.q || ''}
            placeholder="Cari kegiatan, tempat, atau PIC..."
            onBlur={(e) => setFilter('q', e.target.value.trim() || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter('q', (e.target as HTMLInputElement).value.trim() || undefined)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-app text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.bulan || 'Semua'}
            onChange={(e) => setFilter('bulan', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Bulan</option>
            {bulanOptions.map((b) => {
              const [y, m] = b.split('-');
              const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric',
              });
              return (
                <option key={b} value={b}>
                  {label}
                </option>
              );
            })}
          </select>
          <select
            value={filters.status || 'Semua'}
            onChange={(e) => setFilter('status', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="SUDAH">Sudah Sambutan</option>
            <option value="BELUM">Belum Sambutan</option>
          </select>
          <select
            value={filters.statusKegiatan || 'Semua'}
            onChange={(e) => setFilter('statusKegiatan', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Status Kegiatan</option>
            {STATUS_KEGIATAN_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_KEGIATAN_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            value={filters.pejabat || 'Semua'}
            onChange={(e) => setFilter('pejabat', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Pejabat</option>
            {PEJABAT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filters.penugasan || 'Semua'}
            onChange={(e) => setFilter('penugasan', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Penugasan</option>
            {JENIS_PENUGASAN_OPTIONS.map((j) => (
              <option key={j} value={j}>{JENIS_PENUGASAN_LABEL[j]}</option>
            ))}
          </select>
          <select
            value={filters.sektor || 'Semua'}
            onChange={(e) => setFilter('sektor', e.target.value === 'Semua' ? undefined : e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Sektor</option>
            {leadingSectorOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <input
            defaultValue={filters.pic || ''}
            placeholder="Filter PIC..."
            onBlur={(e) => setFilter('pic', e.target.value.trim() || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter('pic', (e.target as HTMLInputElement).value.trim() || undefined)}
            className="px-3 py-2 rounded-lg border border-app text-sm w-36"
          />
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
          >
            <Download size={15} /> Excel
          </button>
          {canEdit && (
            <button
              onClick={openAdd}
              className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={15} /> Tambah Kegiatan
            </button>
          )}
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-app overflow-hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Kegiatan</th>
                <th className="px-4 py-3 font-medium">Perihal Surat</th>
                <th className="px-4 py-3 font-medium">Tempat</th>
                <th className="px-4 py-3 font-medium">Pejabat</th>
                <th className="px-4 py-3 font-medium">PIC</th>
                <th className="px-4 py-3 font-medium">No. HP PIC</th>
                <th className="px-4 py-3 font-medium">Leading Sector</th>
                <th className="px-4 py-3 font-medium">Sambutan</th>
                <th className="px-4 py-3 font-medium">Status Kegiatan</th>
                <th className="px-4 py-3 font-medium">Petugas Protokol</th>
                <th className="px-4 py-3 font-medium">Petugas Liputan</th>
                <th className="px-4 py-3 font-medium">Dokumentasi</th>
                <th className="px-4 py-3 font-medium">Penugasan</th>
                <th className="px-4 py-3 font-medium">Publikasi</th>
                {canEdit && <th className="px-4 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 16 : 15} className="px-4 py-10 text-center text-muted">
                    Tidak ada kegiatan yang cocok.
                  </td>
                </tr>
              ) : (
                initialData.map((k) => (
                  <tr key={k.id} className="border-t border-app hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {new Date(k.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{k.namaKegiatan}</td>
                    <td className="px-4 py-3 text-muted max-w-[200px] truncate">{k.perihalSurat || '-'}</td>
                    <td className="px-4 py-3 text-muted">{k.tempat}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{k.pejabat}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{k.picNama || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{k.picNoHp || '-'}</td>
                    <td className="px-4 py-3 text-muted">{k.leadingSectorNama}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          k.statusSambutan === 'SUDAH' ? 'badge-sudah' : 'badge-belum'
                        }`}
                      >
                        {k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_KEGIATAN_BADGE_CLASS[k.statusKegiatan]}`}>
                        {STATUS_KEGIATAN_LABEL[k.statusKegiatan]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{petugasSummary(k.petugasProtokolNama)}</td>
                    <td className="px-4 py-3 text-muted">{petugasSummary(k.petugasLiputanNama)}</td>
                    <td className="px-4 py-3">
                      {k.linkUpload ? (
                        <a
                          href={k.linkUpload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-navy inline-flex items-center gap-1 hover:underline"
                        >
                          <LinkIcon size={13} /> Buka
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${JENIS_PENUGASAN_BADGE_CLASS[k.jenisPenugasan]}`}>
                        {JENIS_PENUGASAN_LABEL[k.jenisPenugasan]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_PUBLIKASI_BADGE_CLASS[k.statusPublikasi]}`}>
                        {STATUS_PUBLIKASI_LABEL[k.statusPublikasi]}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(k)}
                            aria-label="Edit"
                            className="p-1.5 rounded-md hover:bg-app text-navy"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id, k.namaKegiatan)}
                            aria-label="Hapus"
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Menampilkan {pageStart}–{pageEnd} dari {total} kegiatan
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Hapus kegiatan ini?"
        message={confirmDelete ? `"${confirmDelete.nama}" akan dihapus permanen beserta dokumen terkait.` : ''}
        confirmLabel="Hapus"
        loading={isPending}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {modalOpen && (
        <KegiatanModal
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={isPending}
          petugasProtokolOptions={petugasProtokolOptions}
          petugasLiputanOptions={petugasLiputanOptions}
          leadingSectorOptions={leadingSectorOptions}
        />
      )}
    </div>
  );
}
