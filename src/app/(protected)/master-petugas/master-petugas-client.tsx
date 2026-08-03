'use client';

import { useState, useEffect, useTransition } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { createPetugas, updatePetugas, deletePetugas, type PetugasInput } from '@/app/actions/petugas';
import ConfirmDialog from '@/components/confirm-dialog';

export type PetugasRow = {
  id: string;
  nama: string;
  jabatan: string | null;
  noHp: string | null;
  statusAktif: boolean;
};

const emptyForm: PetugasInput = { nama: '', jabatan: '', noHp: '', statusAktif: true };

export default function MasterPetugasClient({ initialData, canEdit }: { initialData: PetugasRow[]; canEdit: boolean }) {
  const [items, setItems] = useState<PetugasRow[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PetugasRow | null>(null);
  const [form, setForm] = useState<PetugasInput>(emptyForm);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) setModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, isPending]);

  const openAdd = () => { setEditingItem(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: PetugasRow) => {
    setEditingItem(item);
    setForm({ nama: item.nama, jabatan: item.jabatan || '', noHp: item.noHp || '', statusAktif: item.statusAktif });
    setError('');
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { setError('Nama wajib diisi.'); return; }
    startTransition(async () => {
      const res = editingItem ? await updatePetugas(editingItem.id, form) : await createPetugas(form);
      if (res.ok) {
        if (editingItem) {
          setItems((prev) => prev.map((p) => p.id === editingItem.id ? { ...p, ...form } : p));
        } else {
          setItems((prev) => [...prev, {
             id: 'temp-' + Date.now(),
              ...form,
            jabatan: form.jabatan ?? null,
            noHp: form.noHp ?? null }]);
        }
        setModalOpen(false);
      } else { setError(res.error || 'Gagal menyimpan.'); }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    setConfirmDelete({ id, nama });
    setDeleteError('');
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const res = await deletePetugas(confirmDelete.id);
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== confirmDelete.id));
        setConfirmDelete(null);
      } else {
        setDeleteError(res.error || 'Gagal menghapus.');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Petugas di sini akan muncul sebagai pilihan di form Tambah Kegiatan.
        </p>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium">
            <Plus size={15} /> Tambah Petugas
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-app overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Jabatan</th>
              <th className="px-4 py-3 font-medium">Nomor HP</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canEdit && <th className="px-4 py-3 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={canEdit ? 5 : 4} className="px-4 py-10 text-center text-muted">Belum ada data petugas.</td></tr>
            ) : items.map((p) => (
              <tr key={p.id} className="border-t border-app hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{p.nama}</td>
                <td className="px-4 py-3 text-muted">{p.jabatan || '-'}</td>
                <td className="px-4 py-3 text-muted font-mono text-xs">{p.noHp || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.statusAktif ? 'badge-sudah' : 'badge-belum'}`}>
                    {p.statusAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="px-2 py-1 rounded-md hover:bg-app text-navy text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.nama)} aria-label="Hapus" className="p-1.5 rounded-md hover:bg-red-50 text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Hapus petugas ini?"
        message={confirmDelete ? `Petugas "${confirmDelete.nama}" akan dihapus permanen.` : ''}
        confirmLabel="Hapus"
        loading={isPending}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="petugas-edit-title"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-app">
              <h3 id="petugas-edit-title" className="font-display text-lg font-semibold text-navy">{editingItem ? 'Edit Petugas' : 'Tambah Petugas'}</h3>
              <button onClick={() => setModalOpen(false)} aria-label="Tutup" className="p-1 rounded-md hover:bg-app"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama</label>
                <input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" placeholder="Nama lengkap petugas" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Jabatan</label>
                <input value={form.jabatan} onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" placeholder="cth. Staf Protokol" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nomor HP</label>
                <input value={form.noHp} onChange={(e) => setForm((f) => ({ ...f, noHp: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" placeholder="08xxxxxxxxxx" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.statusAktif} onChange={(e) => setForm((f) => ({ ...f, statusAktif: e.target.checked }))} />
                Status aktif (muncul di form kegiatan)
              </label>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium">Batal</button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium">{isPending ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}