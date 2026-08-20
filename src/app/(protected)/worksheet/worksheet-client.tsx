'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Plus, Edit2, Trash2, Link as LinkIcon, ArrowUp, ArrowUpDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { createKegiatan, updateKegiatan, deleteKegiatan, getKegiatanExport, type KegiatanInput } from '@/app/actions/kegiatan';
import SearchableSelect, { type SearchableOption } from '@/components/searchable-select';
import { STATUS_KEGIATAN_OPTIONS, STATUS_KEGIATAN_LABEL, STATUS_KEGIATAN_BADGE_CLASS } from '@/lib/constants/status-kegiatan';
import { JENIS_PENUGASAN_OPTIONS, JENIS_PENUGASAN_LABEL, JENIS_PENUGASAN_BADGE_CLASS } from '@/lib/constants/status-penugasan';
import { STATUS_PUBLIKASI_LABEL, STATUS_PUBLIKASI_BADGE_CLASS } from '@/lib/constants/status-publikasi';
import type { KegiatanFilter, KegiatanSortKey, KegiatanSortDir } from '@/lib/queries/kegiatan';
import KegiatanModal from './kegiatan-modal';
import type { KegiatanRow } from '@/lib/worksheet';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { toDateInput } from '@/lib/format';
import { setGlobalLoading } from '@/components/global-loading';

const PEJABAT_OPTIONS = ['Bupati', 'Wakil Bupati', 'Bupati & Wakil Bupati', 'Lainnya'];

// 12 bulan statis - filter bulan tak lagi diambil dari data.
const BULAN_NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** Format daftar nama petugas menjadi "Nama A, Nama B +N" agar sel tabel tetap ringkas. */
function petugasSummary(names: string[]): string {
  if (names.length === 0) return '-';
  const shown = names.slice(0, 2);
  const extra = names.length - shown.length;
  return extra > 0 ? `${shown.join(', ')} +${extra}` : shown.join(', ');
}

/** Tampilan ALL CREW: seluruh anggota kategori bertugas, nama yang terpilih = Penanggung Jawab. */
function allCrewSummary(allCrew: boolean, names: string[]): string {
  if (!allCrew) return petugasSummary(names);
  const pj = petugasSummary(names);
  return pj === '-' ? 'Semua crew' : `Semua crew (PJ: ${pj})`;
}

// Header kolom yang bisa di-klik untuk sort. Toggle asc <-> desc; reset ke halaman 1.
function SortableTh({
  label,
  sortKey,
  current,
  dir, 
  onSort,
  className,
}: {
  label: string;
  sortKey: KegiatanSortKey;
  current?: KegiatanSortKey;
  dir?: KegiatanSortDir;
  onSort: (key: KegiatanSortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;
  return (
    <th className={className ?? 'px-4 py-3 font-medium'}
    aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-navy"
      >
        {label}
        {active ? (
          <ArrowUp size={12} className={`transition-transform ${dir === 'desc' ? 'rotate-180' : ''}`} />
        ) : (
          <ArrowUpDown size={12} className="text-muted" />
        )}
      </button>
    </th>
  );
}

export default function WorksheetClient({
  initialData,
  total,
  page,
  pageSize,
  filters,
  tahunOptions,
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
  tahunOptions: string[];
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
    setGlobalLoading(true); 
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.replace(`/worksheet?${params.toString()}`);
    });
  };

  const handlePageChange = (p: number) => {
    setGlobalLoading(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.replace(`/worksheet?${params.toString()}`);
    });
  };

  // Sort kolom: klik header toggle asc <->, kembali ke halaman 1.
  const setSort = (key: KegiatanSortKey) => {
    setGlobalLoading(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextDir: KegiatanSortDir = filters.sort === key && filters.dir === 'asc' ? 'desc' : 'asc';
      params.set('sort', key);
      params.set('dir', nextDir);
      params.delete('page'); // <- reset ke halaman 1
      router.replace(`/worksheet?${params.toString()}`);
    });
  }

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
        if (res.warning) toast.warning(res.warning);
      } else {
        toast.error(res.error || 'Gagal menyimpan.');
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
    setGlobalLoading(true);
    // Show loading toast for export
    const loadingToast = toast.loading('Menyiapkan export Excel...');
    try{
    const res = await getKegiatanExport(filters);
    if (!res.ok) {
      setGlobalLoading(false);
      toast.error(res.error || 'Gagal mengekspor.', { id: loadingToast} );
      return;
    }
    const data = res.data;
    const header = [
      'Tanggal Pelaksanaan',
      'Nama Kegiatan',
      'Perihal Surat',
      'Nomor Surat',
      'Dresscode',
      'Tempat',
      'Pejabat',
      'No. HP PIC',
      'Leading Sector',
      'Status Sambutan',
      'Status Kegiatan',
      'Petugas Protokol',
      'Petugas Liputan',
      'Link Upload',
      'Catatan',
      'Jenis Tugas',
      'Status Publikasi',
    ];
    const rows = data.map((k) => [
      new Date(k.tanggal),
      k.namaKegiatan,
      k.perihalSurat || '',
      k.nomorSurat || '',
      k.dresscode || '',
      k.tempat,
      k.pejabat,
      k.picNoHp || '',
      k.leadingSectorNama,
      k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum',
      STATUS_KEGIATAN_LABEL[k.statusKegiatan],
      allCrewSummary(k.allCrewProtokol, k.petugasProtokolNama),
      allCrewSummary(k.allCrewLiputan, k.petugasLiputanNama),
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

    toast.success('Export berhasil', { id: loadingToast });
    setGlobalLoading(false);
    } catch (err) {
      setGlobalLoading(false);
      toast.error('Gagal mengekspor.', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            defaultValue={filters.q || ''}
            placeholder="Cari kegiatan, tempat, atau perihal..."
            onBlur={(e) => setFilter('q', e.target.value.trim() || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter('q', (e.target as HTMLInputElement).value.trim() || undefined)}
            className="w-full min-w-0 pl-9 pr-3 py-2 rounded-lg border border-app text-sm"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <select value={filters.tahun || ''} 
          onChange={(e) => {
            const v = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (v) params.set('tahun', v);
            else params.delete('tahun');
            params.delete('bulan'); // bulan mengikuti tahun - reset saat tahun berubah
            params.delete('page');
            router.replace(`/worksheet?${params.toString()}`);
          }}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="">Semua Tahun</option>
            {tahunOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={filters.bulan ? Number(filters.bulan.split('-')[1]) :0}
          onChange={(e) => {
            const m = Number(e.target.value);
            const tahun = filters.tahun || String(new Date().getFullYear());
            setFilter('bulan', m ===0 ? undefined : `${tahun}-${String(m).padStart(2, '0')}`);
          }}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value={0}>Semua Bulan</option>
            {BULAN_NAMA.map((nama, i) => (
              <option key={i +1} value={i +1}>{nama}</option>
            ))}
          </select>
          <select value={filters.status || 'Semua'}
          onChange={(e) => setFilter('status', e.target.value === 'Semua' ? undefined : e.target.value)}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Sambutan</option>
            <option value="SUDAH">Sudah Sambutan</option>
            <option value="BELUM">Belum Sambutan</option>
          </select>
          <select value={filters.statusKegiatan || 'Semua'}
          onChange={(e) => setFilter('statusKegiatan', e.target.value === 'Semua' ? undefined : e.target.value)}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Status Kegiatan</option>
            {STATUS_KEGIATAN_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_KEGIATAN_LABEL[s]}</option>
            ))}
          </select>
          <select value={filters.pejabat || 'Semua'}
          onChange={(e) => setFilter('pejabat', e.target.value === 'Semua' ? undefined : e.target.value)}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Pejabat</option>
            {PEJABAT_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={filters.penugasan || 'Semua'}
          onChange={(e) => setFilter('penugasan', e.target.value === 'Semua' ? undefined : e.target.value)}
          className="min-w-0 px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Jenis Tugas</option>
            {JENIS_PENUGASAN_OPTIONS.map((j) => (
              <option key={j} value={j}>{JENIS_PENUGASAN_LABEL[j]}</option>
            ))}
          </select>
          <div className="w-full col-span-2 sm:w-48">
            <SearchableSelect options={leadingSectorOptions}
            value={filters.sektor || null}
            onChange={(v) => setFilter('sektor', v || undefined)}
            placeholder="Semua Sektor"
          />
          </div>
          <button onClick={exportExcel}
          className="col-span-2 justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
          >
            <Download size={15} /> Excel
          </button>
          {canEdit && (
            <button onClick={openAdd}
            className="btn-primary col-span-2 justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={15} /> Tambah Kegiatan
            </button>
          )}
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-app overflow-hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] sm:min-w-[640px] md:min-w-[1100px] text-sm">
            <thead>
              <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
                <SortableTh label="Tanggal Pelaksanaan" sortKey="tanggal" current={filters.sort} dir={filters.dir} onSort={setSort} className="sticky left-0 z-10 bg-app border-r border-app px-4 py-3 font-medium" />
                <SortableTh label="Kegiatan" sortKey="namaKegiatan" current={filters.sort} dir={filters.dir} onSort={setSort} />
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Perihal Surat</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Nomor Surat</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Dresscode</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Tempat</th>
                <th className="px-4 py-3 font-medium">Pejabat</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">No. HP PIC</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Leading Sector</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Sambutan</th>
                <SortableTh  label="Status Kegiatan" sortKey="statusKegiatan" current={filters.sort} dir={filters.dir} onSort={setSort} />
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Petugas Protokol</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Petugas Liputan</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Dokumentasi</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Jenis Tugas</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">Publikasi</th>
                {canEdit && <th className="px-4 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 17 : 16} className="px-4 py-10 text-center text-muted">
                    Tidak ada kegiatan yang cocok.
                  </td>
                </tr>
              ) : (
                initialData.map((k) => (
                  <tr key={k.id} className="border-t border-app hover:bg-slate-50">
                    <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 border-r border-app px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {new Date(k.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{k.namaKegiatan}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-muted max-w-[200px] truncate">{k.perihalSurat || '-'}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-muted max-w-[180px] truncate">{k.nomorSurat || '-'}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-muted max-w-[120px] truncate">{k.dresscode || '-'}</td>
                    <td className="px-4 py-3 text-muted text-xs">{k.tempat}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{k.pejabat}</td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-muted">{k.picNoHp || '-'}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-muted">{k.leadingSectorNama}</td>
                    <td className="hidden sm:table-cell px-4 py-3">
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
                    <td className="hidden md:table-cell px-4 py-3 text-muted">{allCrewSummary(k.allCrewProtokol, k.petugasProtokolNama)}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-muted">{allCrewSummary(k.allCrewLiputan, k.petugasLiputanNama)}</td>
                    <td className="hidden md:table-cell px-4 py-3">
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
                    <td className="hidden md:table-cell px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${JENIS_PENUGASAN_BADGE_CLASS[k.jenisPenugasan]}`}>
                        {JENIS_PENUGASAN_LABEL[k.jenisPenugasan]}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
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
