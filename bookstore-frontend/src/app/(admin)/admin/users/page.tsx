'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2, UnlockKeyhole, UsersRound, X } from 'lucide-react';
import api from '@/lib/axios';
import { formatDate, translateApiMessage } from '@/lib/utils';

type ManagedUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  _count: { orders: number };
};

type UserForm = {
  full_name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
};

const emptyForm: UserForm = { full_name: '', email: '', password: '', role: 'USER' };

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  return translateApiMessage(message, fallback);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải danh sách người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = `${user.full_name} ${user.email}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'));
    return matchesSearch && (roleFilter === 'ALL' || user.role === roleFilter);
  });

  function openCreateForm() {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setIsFormOpen(true);
  }

  function openEditForm(user: ManagedUser) {
    setEditingUser(user);
    setForm({ full_name: user.full_name, email: user.email, password: '', role: user.role });
    setError('');
    setIsFormOpen(true);
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
        });
      } else {
        await api.post('/users', form);
      }
      setIsFormOpen(false);
      await loadUsers();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể lưu thông tin người dùng.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleUserStatus(user: ManagedUser) {
    setPendingUserId(user.id);
    setError('');
    try {
      await api.patch(`/users/${user.id}/status`, { is_active: !user.is_active });
      await loadUsers();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể cập nhật trạng thái tài khoản.'));
    } finally {
      setPendingUserId(null);
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Xóa tài khoản ${user.full_name}?`)) return;
    setPendingUserId(user.id);
    setError('');
    try {
      await api.delete(`/users/${user.id}`);
      await loadUsers();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể xóa tài khoản.'));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#586ce0] px-5 py-5 text-white shadow-sm sm:px-7">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="mt-1 text-xs text-white/75">Quản lý tài khoản, vai trò và trạng thái hoạt động.</p>
        </div>
        <button onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
          <Plus size={17} /> Thêm tài khoản mới
        </button>
      </header>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <UsersRound size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Danh sách người dùng</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{filteredUsers.length}</span>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label className="relative min-w-48 flex-1 sm:flex-none">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc email" className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Lọc theo vai trò" className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400">
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="USER">Người dùng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] table-fixed text-left">
            <colgroup>
              <col className="w-[23%]" /><col className="w-[24%]" /><col className="w-[14%]" /><col className="w-[13%]" /><col className="w-[14%]" /><col className="w-[12%]" />
            </colgroup>
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{user.full_name.trim().charAt(0).toLocaleUpperCase('vi')}</span>
                      <span className="truncate font-semibold text-slate-800">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="truncate px-4 py-3 text-slate-600" title={user.email}>{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'ADMIN' ? 'Quản trị' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                      <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" title={user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} aria-label={user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} disabled={pendingUserId === user.id} onClick={() => void toggleUserStatus(user)} className="rounded-md p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                        {user.is_active ? <LockKeyhole size={15} /> : <UnlockKeyhole size={15} />}
                      </button>
                      <button type="button" title="Sửa thông tin" aria-label="Sửa thông tin" disabled={pendingUserId === user.id} onClick={() => openEditForm(user)} className="rounded-md p-2 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"><Pencil size={15} /></button>
                      <button type="button" title="Xóa tài khoản" aria-label="Xóa tài khoản" disabled={pendingUserId === user.id} onClick={() => void deleteUser(user)} className="rounded-md p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Không tìm thấy người dùng phù hợp.</td></tr>}
              {isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Đang tải danh sách...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setIsFormOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingUser ? <ShieldCheck size={19} className="text-blue-600" /> : <UsersRound size={19} className="text-blue-600" />}
                <h2 id="user-form-title" className="text-lg font-bold text-slate-900">{editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setIsFormOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
            </div>
            <form onSubmit={saveUser} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Họ và tên
                <input required maxLength={191} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">Email
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </label>
              {!editingUser && <label className="block text-sm font-medium text-slate-700">Mật khẩu
                <input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </label>}
              <label className="block text-sm font-medium text-slate-700">Vai trò
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserForm['role'] })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-blue-400">
                  <option value="USER">Người dùng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </label>
              {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isSaving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{isSaving ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
