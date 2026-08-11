'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { Trash2, Pencil, X, Search } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '@/app/actions/users';
import ConfirmDialog from '@/components/confirm-dialog';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Staf Protokom', KEPALA_BAGIAN: 'Kepala Bagian' };
type UserRow = { id: string; username: string; nama: string; role: string };

export default function UsersClient({ users: initialUsers, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ username: '', password: '', nama: ''});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', role: 'STAFF' as 'ADMIN' | 'STAFF' | 'KEPALA_BAGIAN', password: '' });
  const [editError, setEditError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchSearch = !q || u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter])

  useEffect(() => {
    if (!editingUser) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) setEditingUser(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [editingUser, isPending]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim() || !form.nama.trim()) { setError('Semua kolom wajib diisi'); return; }
    setError('');
    startTransition(async () => {
      const res = await createUser({ username: form.username.trim(), password: form.password, nama: form.nama.trim(), role: 'STAFF' });
      if (res.ok) {
        setUsers((prev) => [...prev, { id: 'temp-' + Date.now(), username: form.username.trim(), nama: form.nama.trim(), role: 'STAFF' }]);
        setForm({ username: '', password: '', nama: ''});
      } else { setError(res.error || 'Gagal menambah pengguna.'); }
    });
  };

  const openEdit = (u: UserRow) => {
    setEditingUser(u);
    setEditForm({ nama: u.nama, role: u.role as 'ADMIN' | 'STAFF' | 'KEPALA_BAGIAN', password: '' });
    setEditError('');
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.nama.trim()) { setEditError('Nama wajib diisi.'); return; }
    if (editForm.password && editForm.password.length < 6) { setEditError('Kata sandi minimal 6 karakter.'); return; }
    setEditError('');
    startTransition(async () => {
      const res = await updateUser(editingUser.id, {
        nama: editForm.nama.trim(),
        role: editForm.role,
        password: editForm.password || undefined,
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, nama: editForm.nama.trim(), role: editForm.role } : u)));
        setEditingUser(null);
      } else { setEditError(res.error || 'Gagal menyimpan.'); }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    setConfirmDelete({ id, nama });
    setDeleteError('');
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const res = await deleteUser(confirmDelete.id);
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
        setConfirmDelete(null);
      } else {
        setDeleteError(res.error || 'Gagal menghapus pengguna.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 order-2 lg:order-1 bg-white rounded-2xl border border-app overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-app">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / nama pengguna..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-app text-sm" 
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter Peran" className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-app text-sm">
            <option value="ALL">Semua Peran</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staf Protokom</option>
            <option value="KEPALA_BAGIAN">Kepala Bagian</option>
          </select>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Nama Pengguna</th>
              <th className="px-4 py-3 font-medium">Peran</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-app">
                <td className="px-4 py-3 font-medium">{u.nama}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => openEdit(u)} aria-label="Edit pengguna" className="p-1.5 rounded-md hover:bg-app text-navy">
                      <Pencil size={14} />
                    </button>
                    {u.id !== currentUserId && (
                      <button onClick={() => handleDelete(u.id, u.nama)} aria-label="Hapus pengguna" className="p-1.5 rounded-md hover:bg-red-50 text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400">
                    Tidak ada pengguna yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      <div className="order-1 lg:order-2 bg-white rounded-2xl border border-app p-5 self-start">
        <h3 className="font-display text-base font-semibold text-navy mb-4">Tambah Pengguna</h3>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
          <input placeholder="Nama pengguna" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
          <input placeholder="Kata sandi" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium">{isPending ? 'Menyimpan...' : 'Tambah'}</button>
        </form>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Hapus pengguna ini?"
        message={confirmDelete ? `Pengguna "${confirmDelete.nama}" akan dihapus permanen.` : ''}
        confirmLabel="Hapus"
        loading={isPending}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {editingUser && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setEditingUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-edit-title"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-app">
              <h3 id="user-edit-title" className="font-display text-lg font-semibold text-navy">Edit Pengguna</h3>
              <button onClick={() => setEditingUser(null)} aria-label="Tutup" className="p-1 rounded-md hover:bg-app"><X size={18} /></button>
            </div>
            <form onSubmit={submitEdit} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama lengkap</label>
                <input value={editForm.nama} onChange={(e) => setEditForm((f) => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Peran</label>
                <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'STAFF' | 'KEPALA_BAGIAN' }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm">
                  <option value="STAFF">Staf Protokom</option>
                  <option value="KEPALA_BAGIAN">Kepala Bagian</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kata sandi baru (opsional)</label>
                <input type="password" placeholder="Kosongkan jika tidak diganti" value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
              </div>
              {editError && <p className="text-xs text-red-600">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium">Batal</button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium">{isPending ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}