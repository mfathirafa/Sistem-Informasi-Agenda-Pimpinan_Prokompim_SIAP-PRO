'use client';

import { useState, useTransition } from 'react';
import { Trash2, Plus, Pencil, X } from 'lucide-react';
import { createLeadingSector, updateLeadingSector, deleteLeadingSector } from '@/app/actions/leading-sector';

export type LeadingSectorRow = { id: string; nama: string };

export default function MasterLeadingSectorClient({ initialData, canEdit }: { initialData: LeadingSectorRow[]; canEdit: boolean }) {
  const [items, setItems] = useState<LeadingSectorRow[]>(initialData);
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<LeadingSectorRow | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editError, setEditError] = useState('');

  const openEdit = (item: LeadingSectorRow) => {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditError('');
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editNama.trim()) { setEditError('Nama wajib diisi.'); return; }
    setEditError('');
    startTransition(async () => {
      const res = await updateLeadingSector(editingItem.id, editNama.trim());
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, nama: editNama.trim() } : i))
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
      const res = await createLeadingSector(nama.trim());
      if (res.ok) {
        setItems((prev) => [...prev, { id: 'temp-' + Date.now(), nama: nama.trim() }].sort((a, b) => a.nama.localeCompare(b.nama)));
        setNama('');
      } else { setError(res.error || 'Gagal menambah.'); }
    });
  };

  const handleDelete = (id: string, itemNama: string) => {
    if (!window.confirm(`Hapus "${itemNama}" dari daftar leading sector?`)) return;
    startTransition(async () => {
      const res = await deleteLeadingSector(id);
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
      else alert(res.error || 'Gagal menghapus.');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-app overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Nama Leading Sector / Instansi</th>
              {canEdit && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-10 text-center text-muted">Belum ada data.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-t border-app">
                <td className="px-4 py-3 font-medium">{item.nama}</td>
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
      </div>
                  </form>
          </div>
        </div>
      )}
    </div>
  );