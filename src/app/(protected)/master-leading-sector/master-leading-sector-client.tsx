'use client';

import { useState, useEffect, useTransition } from 'react';
import { Trash2, Plus, Pencil, X, EyeOff, Eye } from 'lucide-react';
import { createLeadingSector, updateLeadingSector, deleteLeadingSector } from '@/app/actions/leading-sector';
import { KATEGORI_LEADING_SECTOR_OPTIONS } from '@/lib/constants/kategori-leading-sector';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';

export type LeadingSectorRow = { id: string, nama: string, kategori: string | null };

const PAGE_SIZE = 20;
const FILTER_SEMUA = 'SEMUA';
const FILTER_BELUM = '__BELUM__';

export default function MasterLeadingSectorClient({ initialData, canEdit }: { initialData: LeadingSectorRow[]; canEdit: boolean }) {
  const [items, setItems] = useState<LeadingSectorRow[]>(initialData);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<LeadingSectorRow | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editError, setEditError] = useState('');
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState(FILTER_SEMUA);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!editingItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) setEditingItem(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [editingItem, isPending]);

  useEffect(() => { setPage(1); }, [search, filterKategori]);

  const openEdit = (item: LeadingSectorRow) => {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditKategori(item.kategori ?? '');
    setEditError('');
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editNama.trim()) { setEditError('Nama wajib diisi.'); return; }
    setEditError('');
    startTransition(async () => {
      const res = await updateLeadingSector(editingItem.id, editNama.trim(), editKategori || null);
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, nama: editNama.trim(), kategori: editKategori || null } : i))
            .sort((a, b) => a.nama.localeCompare(b.nama))
        );
        setEditingItem(null);
      } else { setEditError(res.error || 'Gagal menyimpan.'); }
    });
  }; 

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) { setError('Nama wajib diisi.'); return; }
    setError('');
    startTransition(async () => {
      const res = await createLeadingSector(nama.trim(), kategori || null);
      if (res.ok) {
        setItems((prev) => [...prev, { id: 'temp-' + Date.now(), nama: nama.trim(), kategori: kategori || null }].sort((a, b) => a.nama.localeCompare(b.nama)));
        setNama('');
        setKategori('');
      } else { setError(res.error || 'Gagal menambah.'); }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    setConfirmDelete({ id, nama });
    setDeleteError('');
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const res = await deleteLeadingSector(confirmDelete.id);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
        setConfirmDelete(null);
      } else {
        setDeleteError(res.error || 'Gagal menghapus.');
      }
    });
  };


  const searchTerm = search.trim().toLowerCase();
  const filtered = items.filter((i) =>
    i.nama.toLowerCase().includes(searchTerm) &&
      (filterKategori === FILTER_SEMUA ||
        (filterKategori === FILTER_BELUM ? !i.kategori : i.kategori === filterKategori)
      ));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 lg:order-1 bg-white rounded-2xl border border-app overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <input aria-label="Cari nama leading sector"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama leading sector..."
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg border border-app text-sm" 
        />
        <select aria-label="Filter kategori"
          value={filterKategori} 
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-3 py-2 rounded-lg border border-app text-sm bg-white"
          >
            <option value={FILTER_SEMUA}>Semua Kategori</option>
            <option value={FILTER_BELUM}>Belum Dikategorikan</option>
            {KATEGORI_LEADING_SECTOR_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
      </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Nama Leading Sector / Instansi</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              {canEdit && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr><td colSpan={canEdit ? 3 : 2} className="px-4 py-10 text-center text-muted">Belum ada data.</td></tr>
            ) : pagedItems.map((item) => (
              <tr key={item.id} className="border-t border-app">
                <td className="px-4 py-3 font-medium">{item.nama}</td>
                <td className="px-4 py-3">
                  {item.kategori ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-app text-navy">{item.kategori}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                 {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(item)} aria-label="Edit" className="p-1.5 rounded-md hover:bg-app text-navy">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.nama)} aria-label="Hapus" className="p-1.5 rounded-md hover:bg-red-50 text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center py-3">
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {canEdit && (
        <div className="lg:order-2 bg-white rounded-2xl border border-app p-5 self-start">
          <h3 className="font-display text-base font-semibold text-navy mb-4">Tambah Leading Sector</h3>  
          <form onSubmit={submit} className="space-y-3">
            <input placeholder="cth. Dinas Pendidikan" value={nama} onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
              <select value={kategori} onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app text-sm bg-white">
                  <option value="">Belum Dikategorikan</option>
                  {KATEGORI_LEADING_SECTOR_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={isPending} className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium">
              <Plus size={15} /> {isPending ? 'Menyimpan...' : 'Tambah'}  
            </button>
        </form>
      </div>
      )}

      {deleteError && (
        <p className="lg:col-span-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Hapus leading sector ini?"
        message={confirmDelete ? `"${confirmDelete.nama}" akan dihapus permanen.` : ''}
        confirmLabel="Hapus"
        loading={isPending}
        onConfirm={confirmDeleteAction}
        onCancel={() => {setConfirmDelete(null); setDeleteError(''); }}
        error={deleteError}
      />

      {editingItem && (
        <div 
          className='fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50'
          onClick={() => setEditingItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby='sektor-edit-title'
        >
          <div className='bg-white rounded-2xl max-w-sm w-full' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between px-5 py-4 border-b border-app'>
              <h3 id="sektor-edit-title" className='font-display text-lg font-semibold text-navy'>Edit Leading Sector</h3>
              <button onClick={() => setEditingItem(null)} aria-label='Tutup' className='p-1 rounded-md hover:bg-app'>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitEdit} className='px-5 py-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1.5'>Nama</label>
                <input value={editNama} onChange={(e) => setEditNama(e.target.value)} className='w-full px-3 py-2 rounded-lg border border-app text-sm' placeholder='cth. Dinas Pendidikan' />
              </div>
              <div>
            <label className="block text-sm font-medium mb-1.5">Kategori</label>
            <select value={editKategori} onChange={(e) => setEditKategori(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-app text-sm bg-white">
            <option value="">Belum Dikategorikan</option>
            {KATEGORI_LEADING_SECTOR_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
            ))}
            </select>
            </div>
            {editError &&<p className="text-xs text-red-600">{editError}</p>}<div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium">
            Batal</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium">
            {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
            </div></form>
          </div>
        </div>
        )}
    </div>
  );
}
