'use client';

import { useState, useEffect, useTransition } from 'react';
import { Trash2, Plus, Pencil, X } from 'lucide-react';
import { createLeadingSector, updateLeadingSector, deleteLeadingSector } from '@/app/actions/leading-sector';
import { KATEGORI_LEADING_SECTOR_OPTIONS } from '@/lib/constants/kategori-leading-sector';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { useModalScrollLock } from '@/hooks/use-modal-scroll-lock';

export type LeadingSectorRow = { 
  id: string, 
  nama: string, 
  kategori: string | null, 
  noHp?: string | null,
  pejabatNama?: string | null,
  pejabatJabatan?: string | null,
};

const PAGE_SIZE = 20;
const FILTER_SEMUA = 'SEMUA';
const FILTER_BELUM = '__BELUM__';

export default function MasterLeadingSectorClient({ initialData, canEdit }: { initialData: LeadingSectorRow[]; canEdit: boolean }) {
  const [items, setItems] = useState<LeadingSectorRow[]>(initialData);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [noHp, setNoHp] = useState('');
  const [pejabatNama, setPejabatNama] = useState('');
  const [pejabatJabatan, setPejabatJabatan] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<LeadingSectorRow | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editPejabatNama, setEditPejabatNama] = useState('');
  const [editPejabatJabatan, setEditPejabatJabatan] = useState('');
  const [editError, setEditError] = useState('');
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState(FILTER_SEMUA);
  const [page, setPage] = useState(1);

  // 🔒 Lock scroll background untuk kedua modal  
  useModalScrollLock(!!editingItem); // Edit modal

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
    setEditNoHp(item.noHp ?? '');
    setEditPejabatNama(item.pejabatNama ?? '');
    setEditPejabatJabatan(item.pejabatJabatan ?? '');
    setEditError('');
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editNama.trim()) { setEditError('Nama wajib diisi.'); return; }
    setEditError('');
    startTransition(async () => {
      const res = await updateLeadingSector(
        editingItem.id, 
        editNama.trim(), 
        editKategori || null, 
        editNoHp || null,
        editPejabatNama || null,
        editPejabatJabatan || null
      );
     if (res.ok) {
      setItems((prev) => 
        prev.map((i) =>
          i.id === editingItem?.id
          ? {
            ...i,
            nama: editNama.trim(),
            kategori: editKategori || null,
            noHp: editNoHp || null,
            pejabatNama: editPejabatNama || null,
            pejabatJabatan: editPejabatJabatan || null,
          }
        : i
      ).sort((a, b) => a.nama.localeCompare(b.nama))
    );
     setEditingItem(null);
    } else { setEditError(res.error || 'Gagal Menyimpan'); }
});
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) { setError('Nama wajib diisi.'); return; }
    setError('');
    startTransition(async () => {
      const res = await createLeadingSector(
        nama.trim(), 
        kategori || null, 
        noHp || null,
        pejabatNama || null,
        pejabatJabatan || null
      );
      if (res.ok) {
        setItems((prev) => 
          [
            ...prev, 
            { 
              id: 'temp-' + Date.now(),
              nama: nama.trim(), 
              kategori: kategori || null, 
              noHp: noHp || null,
              pejabatNama: pejabatNama || null,
              pejabatJabatan: pejabatJabatan || null,
            },
          ].sort((a, b) => a.nama.localeCompare(b.nama))
        );
        setNama('');
        setKategori('');
        setNoHp('');
        setPejabatNama('');
        setPejabatJabatan('');
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
      <div className="order-2 lg:order-1 lg:col-span-2 bg-white rounded-2xl border border-app overflow-hidden">
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
              <th className="px-4 py-3 font-medium">Pimpinan / Kepala</th>
              <th className="px-4 py-3 font-medium">No. Hp / Kontak</th>
              {canEdit && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr><td colSpan={canEdit ? 5 : 4} className="px-4 py-10 text-center text-muted">Belum ada data.</td></tr>
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
                <td className="px-4 py-3">
                  {item.pejabatNama ? (
                    <div className="space-y-1.5">
                      {item.pejabatNama.split('\n').map((namaPimpinan, idx) => {
                        const jabatanList = (item.pejabatJabatan || '').split('\n');
                        const jabatanPimpinan = jabatanList[idx] || jabatanList[0] || '-';
                        return (
                          <div key={idx} className="leading-tight">
                            <div className="font-medium text-navy">{namaPimpinan.trim()}</div>
                            <div className="text-xs text-muted">{jabatanPimpinan.trim()}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted text-xs whitespace-pre-line">
                  {item.noHp ? (
                    item.noHp.split('\n').map((line, idx) => {
                      const matchNum = line.match(/(\+?\d[\d-]{7,}\d)/);
                      if (matchNum) {
                        const cleanNum = matchNum[0].replace(/\D/g, '');
                        return (
                          <div key={idx} className="leading-relaxed">
                            {line.substring(0, line.indexOf(matchNum[0]))}
                            <a 
                              href={`https://wa.me/${cleanNum.startsWith('0') ? '62' + cleanNum.slice(1) : cleanNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-mono"
                            >
                              {matchNum[0]}
                            </a>
                            {line.substring(line.indexOf(matchNum[0]) + matchNum[0].length)}
                          </div>
                        );
                      }
                      return <div key={idx} className="leading-relaxed">{line}</div>;
                    })
                  ) : (
                    '-'
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
        <div className="order-1 lg:order-2 bg-white rounded-2xl border border-app p-5 self-start">
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
                <textarea
                  placeholder="Nama Pimpinan + Gelar (bisa multi baris jika >1 pimpinan)"
                  value={pejabatNama}
                  rows={2}
                  onChange={(e) => setPejabatNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none"
                />
                <textarea 
                  placeholder="Jabatan Pimpinan (urutkan baris seusai nama di atas)&#10;cth:&#10;Direktur Utama&#10;Direktur"
                  value={pejabatJabatan}
                  rows={2}
                  onChange={(e) => setPejabatJabatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-nones"
                />
                <textarea 
                  placeholder="No. Hp / Kontak Narahubung (opsional)&#10;Bisa multi baris, cth:&#10;ADC Elsalona: 082369646946&#10;ADC Retno: 08562553599" 
                  value={noHp} 
                  rows={3}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none"
                />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={isPending} className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium">
              <Plus size={15} /> {isPending ? 'Menyimpan...' : 'Tambah'}  
            </button>
        </form>
      </div>
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
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingItem(null); }}
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
                <input autoFocus value={editNama} onChange={(e) => setEditNama(e.target.value)} className='w-full px-3 py-2 rounded-lg border border-app text-sm' placeholder='cth. Dinas Pendidikan' />
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
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama Pimpinan / Kepala</label>
              <textarea 
                value={editPejabatNama} 
                rows={2}
                onChange={(e) => setEditPejabatNama(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none" 
                placeholder="Bisa multi-baris jika > 1 pimpinan..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Jabatan Pimpinan</label>
              <textarea 
                value={editPejabatJabatan} 
                rows={2}
                onChange={(e) => setEditPejabatJabatan(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none" 
                placeholder="cth. Kepala Dinas"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">No. HP / WhatsApp</label>
              <textarea 
                value={editNoHp} 
                rows={3}
                onChange={(e) => setEditNoHp(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-app text-sm resize-none" 
                placeholder="Bisa multi-baris..." />
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
