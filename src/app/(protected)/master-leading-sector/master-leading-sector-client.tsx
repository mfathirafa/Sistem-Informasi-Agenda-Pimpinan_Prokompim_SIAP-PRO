'use client';

import { useState, useTransition } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { createLeadingSector, deleteLeadingSector } from '@/app/actions/leading-sector';

export type LeadingSectorRow = { id: string; nama: string };

export default function MasterLeadingSectorClient({
  initialData,
  canEdit,
}: {
  initialData: LeadingSectorRow[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<LeadingSectorRow[]>(initialData);
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await createLeadingSector(nama.trim());
      if (res.ok) {
        setItems((prev) => [...prev, { id: 'temp-' + Date.now(), nama: nama.trim() }].sort((a, b) => a.nama.localeCompare(b.nama)));
        setNama('');
      } else {
        setError(res.error || 'Gagal menambah.');
      }
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
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-muted">
                  Belum ada data.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-app">
                  <td className="px-4 py-3 font-medium">{item.nama}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.nama)}
                        aria-label="Hapus"
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {canEdit && (
        <div className="bg-white rounded-2xl border border-app p-5 self-start">
          <h3 className="font-display text-base font-semibold text-navy mb-4">Tambah Leading Sector</h3>
          <form onSubmit={submit} className="space-y-3">
            <input
              placeholder="cth. Dinas Pendidikan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium"
            >
              <Plus size={15} /> {isPending ? 'Menyimpan...' : 'Tambah'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}