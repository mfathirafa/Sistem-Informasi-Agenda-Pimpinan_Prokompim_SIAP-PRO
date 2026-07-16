'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { createUser, deleteUser } from '@/app/actions/users';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  STAFF: 'Staf Protokom',
  ATASAN: 'Pimpinan',
};

type UserRow = { id: string; username: string; nama: string; role: string };

export default function UsersClient({
  users: initialUsers,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ username: '', password: '', nama: '', role: 'STAFF' });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim() || !form.nama.trim()) {
      setError('Semua kolom wajib diisi');
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await createUser({
        username: form.username.trim(),
        password: form.password,
        nama: form.nama.trim(),
        role: form.role as 'ADMIN' | 'STAFF' | 'ATASAN',
      });
      if (res.ok) {
        setUsers((prev) => [
          ...prev,
          { id: 'temp-' + Date.now(), username: form.username.trim(), nama: form.nama.trim(), role: form.role },
        ]);
        setForm({ username: '', password: '', nama: '', role: 'STAFF' });
      } else {
        setError(res.error || 'Gagal menambah pengguna.');
      }
    });
  };

  const handleDelete = (id: string, nama: string) => {
    if (!window.confirm(`Hapus pengguna ${nama}?`)) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
      else alert(res.error || 'Gagal menghapus pengguna.');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-app overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Nama Pengguna</th>
              <th className="px-4 py-3 font-medium">Peran</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-app">
                <td className="px-4 py-3 font-medium">{u.nama}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(u.id, u.nama)}
                      aria-label="Hapus pengguna"
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl border border-app p-5 self-start">
        <h3 className="font-display text-base font-semibold text-navy mb-4">Tambah Pengguna</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            placeholder="Nama lengkap"
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-app text-sm"
          />
          <input
            placeholder="Nama pengguna"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-app text-sm"
          />
          <input
            placeholder="Kata sandi"
            type="text"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-app text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-app text-sm"
          >
            <option value="STAFF">Staf Protokom</option>
            <option value="ATASAN">Pimpinan</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium">
            {isPending ? 'Menyimpan...' : 'Tambah'}
          </button>
        </form>
      </div>
    </div>
  );
}
