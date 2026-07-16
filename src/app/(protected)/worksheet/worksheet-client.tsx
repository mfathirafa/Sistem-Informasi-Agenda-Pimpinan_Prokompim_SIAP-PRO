'use client';

import { useState, useMemo, useTransition } from 'react';
import { Search, Download, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { createKegiatan, updateKegiatan, deleteKegiatan, type KegiatanInput } from '@/app/actions/kegiatan';
import KegiatanModal from './kegiatan-modal';

const PEJABAT_OPTIONS = ['Bupati', 'Wakil Bupati', 'Bupati & Wakil Bupati', 'Lainnya'];

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}
function toDateInput(d: Date | string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export type KegiatanRow = {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  waktu: string | null;
  tempat: string;
  pejabat: string;
  leadingSector: string;
  statusSambutan: 'SUDAH' | 'BELUM';
  petugasProtokol: string | null;
  petugasLiputan: string | null;
  linkUpload: string | null;
  catatan: string | null;
};

export default function WorksheetClient({
  initialData,
  canEdit,
}: {
  initialData: KegiatanRow[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<KegiatanRow[]>(initialData);
  const [search, setSearch] = useState('');
  const [filterBulan, setFilterBulan] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPejabat, setFilterPejabat] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KegiatanRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const bulanOptions = useMemo(() => {
    const set = new Set(
      items.map((k) => {
        const d = new Date(k.tanggal);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      })
    );
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((k) => {
        if (search && !`${k.namaKegiatan} ${k.tempat}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterStatus !== 'Semua' && k.statusSambutan !== filterStatus) return false;
        if (filterPejabat !== 'Semua' && k.pejabat !== filterPejabat) return false;
        if (filterBulan !== 'Semua') {
          const d = new Date(k.tanggal);
          const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
          if (key !== filterBulan) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [items, search, filterStatus, filterPejabat, filterBulan]);

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
      if (editingItem) {
        const res = await updateKegiatan(editingItem.id, data);
        if (res.ok) {
          setItems((prev) =>
            prev.map((k) =>
              k.id === editingItem.id
                ? {
                    ...editingItem,
                    ...data,
                    waktu: data.waktu || null,
                    petugasProtokol: data.petugasProtokol || null,
                    petugasLiputan: data.petugasLiputan || null,
                    linkUpload: data.linkUpload || null,
                    catatan: data.catatan || null,
                  }
                : k
            )
          );
          setModalOpen(false);
        } else {
          alert(res.error || 'Gagal menyimpan.');
        }
      } else {
        const res = await createKegiatan(data);
        if (res.ok) {
          setItems((prev) => [
            ...prev,
            {
              id: 'temp-' + Date.now(),
              ...data,
              waktu: data.waktu || null,
              petugasProtokol: data.petugasProtokol || null,
              petugasLiputan: data.petugasLiputan || null,
              linkUpload: data.linkUpload || null,
              catatan: data.catatan || null,
            },
          ]);
          setModalOpen(false);
        } else {
          alert(res.error || 'Gagal menyimpan.');
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Hapus kegiatan ini?')) return;
    startTransition(async () => {
      const res = await deleteKegiatan(id);
      if (res.ok) setItems((prev) => prev.filter((k) => k.id !== id));
      else alert(res.error || 'Gagal menghapus.');
    });
  };

  const exportCSV = () => {
    const headers = [
      'Tanggal',
      'Nama Kegiatan',
      'Tempat',
      'Pejabat',
      'Leading Sector',
      'Status Sambutan',
      'Petugas Protokol',
      'Petugas Liputan',
      'Link Upload',
      'Catatan',
    ];
    const rows = filtered.map((k) => [
      toDateInput(k.tanggal),
      k.namaKegiatan,
      k.tempat,
      k.pejabat,
      k.leadingSector,
      k.statusSambutan,
      k.petugasProtokol || '',
      k.petugasLiputan || '',
      k.linkUpload || '',
      k.catatan || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet-spj-${toDateInput(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kegiatan atau tempat..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-app text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="SUDAH">Sudah Sambutan</option>
            <option value="BELUM">Belum Sambutan</option>
          </select>
          <select
            value={filterPejabat}
            onChange={(e) => setFilterPejabat(e.target.value)}
            className="px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="Semua">Semua Pejabat</option>
            {PEJABAT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
          >
            <Download size={15} /> CSV
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

      <div className="bg-white rounded-2xl border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Kegiatan</th>
                <th className="px-4 py-3 font-medium">Tempat</th>
                <th className="px-4 py-3 font-medium">Pejabat</th>
                <th className="px-4 py-3 font-medium">Leading Sector</th>
                <th className="px-4 py-3 font-medium">Sambutan</th>
                <th className="px-4 py-3 font-medium">Petugas Protokol</th>
                <th className="px-4 py-3 font-medium">Petugas Liputan</th>
                <th className="px-4 py-3 font-medium">Dokumentasi</th>
                {canEdit && <th className="px-4 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 10 : 9} className="px-4 py-10 text-center text-muted">
                    Tidak ada kegiatan yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((k) => (
                  <tr key={k.id} className="border-t border-app hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {new Date(k.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{k.namaKegiatan}</td>
                    <td className="px-4 py-3 text-muted">{k.tempat}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{k.pejabat}</td>
                    <td className="px-4 py-3 text-muted">{k.leadingSector}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          k.statusSambutan === 'SUDAH' ? 'badge-sudah' : 'badge-belum'
                        }`}
                      >
                        {k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{k.petugasProtokol || '-'}</td>
                    <td className="px-4 py-3 text-muted">{k.petugasLiputan || '-'}</td>
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
                            onClick={() => handleDelete(k.id)}
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

      {modalOpen && (
        <KegiatanModal item={editingItem} onClose={() => setModalOpen(false)} onSave={handleSave} saving={isPending} />
      )}
    </div>
  );
}
