'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { Trash2, Pencil, X, Search, Eye, EyeOff } from 'lucide-react';
import { createUser, updateUser, deleteUser, resetAllStaffPassword } from '@/app/actions/users';
import ConfirmDialog from '@/components/confirm-dialog';
import { useRouter } from 'next/navigation';
import { useModalScrollLock } from '@/hooks/use-modal-scroll-lock';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Staf Protokom', KEPALA_BAGIAN: 'Kepala Bagian' };
type UserRow = { id: string; username: string; nama: string; role: string };

export default function UsersClient({ users: initialUsers, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', nama: ''})
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', role: 'STAFF' as 'ADMIN' | 'STAFF' | 'KEPALA_BAGIAN', password: '', confirmPassword: '' });
  const [editError, setEditError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  // Lock scroll saat modal edit atau reset password terbuka
  useModalScrollLock(Boolean(editingUser));
  useModalScrollLock(resetAllOpen);

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
    if (form.password !== form.confirmPassword) { setError('Konfirmasi kata sandi tidak cocok'); return; }
    setError('');
    startTransition(async () => {
      const res = await createUser({ username: form.username.trim(), password: form.password, nama: form.nama.trim(), role: 'STAFF' });
      if (res.ok) {
        setUsers((prev) => [...prev, { id: 'temp-' + Date.now(), username: form.username.trim(), nama: form.nama.trim(), role: 'STAFF' }]);
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else { setError(res.error || 'Gagal menambah pengguna.'); }
    });
  };

  const openEdit = (u: UserRow) => {
    setEditingUser(u);
    setEditForm({ nama: u.nama, role: u.role as 'ADMIN' | 'STAFF' | 'KEPALA_BAGIAN', password: '', confirmPassword: '' });
    setEditError('');
    setShowEditPassword(false);
    setShowConfirmPassword(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.nama.trim()) { setEditError('Nama wajib diisi.'); return; }
    if (editForm.password && editForm.password.length < 6) { setEditError('Kata sandi minimal 6 karakter.'); return; }
    if (editForm.password && editForm.password !== editForm.confirmPassword) { setEditError('Konfirmasi kata sandi tidak cocok'); return; }
    setEditError('');
    const isEditingSelf = editingUser.id === currentUserId;
    startTransition(async () => {
      const res = await updateUser(editingUser.id, {
        nama: editForm.nama.trim(),
        role: editForm.role,
        password: editForm.password || undefined,
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, nama: editForm.nama.trim(), role: editForm.role } : u)));
        if (isEditingSelf) {
          router.refresh(); // NEW: refresh session agar nama terupdate di header
        }
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

  const submitResetAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 6) { setResetError('Kata sandi minimal 6 karakter.' ); return; }
    setResetError('');
    startTransition(async () => {
      const res = await resetAllStaffPassword(resetPassword);
      if (res.ok) {
        setResetAllOpen(false);
        setResetPassword('');
        setResetSuccess('Password semua staf berhasil direset.');
      } else {
        setResetError(res.error || 'Gagal mereset password staf.');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Form Tambah - di atas untuk semua ukuran layar */}
        <div className="bg-white rounded-2xl border border-app p-5">
          <h3 className="font-display text-base font-semibold text-navy mb-4">Tambah Pengguna</h3>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Nama Lengkap" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
              <input placeholder="Nama Pengguna" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-app text-sm" />
              <div className="relative">
                <input placeholder="Kata sandi"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gry-400 hover:text-navy"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input placeholder="Konfirmasi kata sandi"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value = {form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" disabled={isPending} className="btn-primary py-2.5 rounded-lg text-sm font-medium">{isPending ? 'Menyimpan' : 'Tambah Pengguna'}</button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-2xl border border-app overflow-hidden">
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
            <button type="button"
              onClick={() => { setResetAllOpen(true); setResetPassword(''); setResetError(''); setResetSuccess(''); }}
              className="px-3 py-1.5 rounded-lg border border-app text-sm hover:bg-app whitespace-nowrap"
            >
              Reset Password Semua Staf
            </button>
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

        {deleteError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>
        )}

        {resetSuccess && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{resetSuccess}</p>
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
                <label className='block text-sm font-medium mb-1.5'>Kata sandi baru (opsional)</label>
                <div className='relative'>
                  <input 
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder='Kosongkan jika tidak diganti'
                    value={editForm.password}
                    onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                    className='w-full px-3 py-2 rounded-lg border border-app text-sm pr-10'
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy'
                    aria-label={showEditPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showEditPassword ?<EyeOff size={16} /> :<Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1.5'>Konfimasi kata sandi baru</label>
                <div className='relative'>
                  <input 
                    type={showEditConfirmPassword ? 'text' : 'password'}
                    placeholder='Konfirmasi kata sandi baru'
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className='w-full px-3 py-2 rounded-lg border border-app text-sm pr-10' 
                  />
                  <button
                    type='button'
                    onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy'
                    aria-label={showEditConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showEditConfirmPassword ?<EyeOff size={16} /> :<Eye size={16} />}
                  </button>
                </div>
              </div>

              {editError && <p className="text-xs text-red-600">{editError}</p>}
              <div className="flex gap-2 pt-4 border-t border-app">
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setShowEditPassword(false); setShowEditConfirmPassword(false); }}
                  className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium"
                >
                  Batal
                </button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium">
                  { isPending ? 'Menyimpan...' : 'Simpan' }
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
        {resetAllOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
            onClick={() => setResetAllOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby='reset-all-title'
          >
            <div className="bg-white rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-app">
                <h3 id="reset-all-title" className="font-display text-lg font-semibold text-navy">Reset Password Semua Staff</h3>
                <button onClick={() => setResetAllOpen(false)} aria-label="Tutup" className="p-1 rounded-md hover:bg-app"><X size={18} /></button>
              </div>
              <form onSubmit={submitResetAll} className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kata sandi baru untuk semua staf</label>
                  <input type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Minimal 6 Karakter"
                    className="w-full px-3 py-2 rounded-lg border border-app text-sm" 
                  />
                  <p className="text-xs text-muted mt-1.5">Semua staf akan memakai kata sandi yang sama ini. Beri tahu mereka setelah direset.</p>
                </div>
                {resetError && <p className="text-xs text-red-600">{resetError}</p>}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" onClick={() => { setEditingUser(null); setShowEditPassword(false); setShowEditConfirmPassword(false); }} 
                    className='flex-1 py-2.5 rounded-lg border border-app text-sm font-medium'
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-lg text-sm font-medium">
                    {isPending ? 'Mereset...' : 'Reset Semua'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}