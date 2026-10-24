'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, PackageCheck, Save, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { OrderType, UserType } from '@/types';

type Profile = Pick<UserType, 'id' | 'email' | 'full_name' | 'role' | 'created_at'>;

function getRequestError(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
}

export default function AccountPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const updateSession = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    void useAuthStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }

    let active = true;
    setIsLoading(true);
    Promise.all([api.get('/auth/me'), api.get('/orders')])
      .then(([profileResponse, ordersResponse]) => {
        if (!active) return;
        const user: Profile = profileResponse.data.data;
        setProfile(user);
        setOrders(ordersResponse.data.data);
        updateSession(user, token);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if ((error as { response?: { status?: number } }).response?.status === 401) {
          logout();
          router.replace('/login');
          return;
        }
        setProfileError(getRequestError(error, 'Không thể tải hồ sơ lúc này.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [hydrated, token, logout, router, updateSession]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setIsSavingProfile(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const response = await api.patch('/auth/me', { full_name: profile.full_name });
      setProfile(response.data.data);
      if (token) updateSession(response.data.data, token);
      setProfileMessage('Đã cập nhật hồ sơ.');
    } catch (error) {
      setProfileError(getRequestError(error, 'Không thể cập nhật hồ sơ.'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch('/auth/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Đã đổi mật khẩu.');
    } catch (error) {
      setPasswordError(getRequestError(error, 'Không thể đổi mật khẩu.'));
    } finally {
      setIsChangingPassword(false);
    }
  }

  function signOut() {
    logout();
    router.replace('/login');
  }

  if (!hydrated || isLoading) {
    return <div className="container py-16 text-center text-slate-600">Đang tải hồ sơ...</div>;
  }

  if (!token || !profile) return null;

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Tài khoản</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Hồ sơ cá nhân</h1>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
          <LogOut size={16} /> Đăng xuất
        </button>
      </header>

      {profileError && <p className="mb-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{profileError}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <div className="space-y-8">
          <section className="border-y border-slate-200 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-800">
                {profile.full_name.charAt(0).toLocaleUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
                <p className="text-sm text-slate-500">Thành viên từ {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'gần đây'}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Họ và tên
                <input required maxLength={191} value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input type="email" readOnly value={profile.email} className="mt-1.5 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-600" />
              </label>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button disabled={isSavingProfile} type="submit" className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                  <Save size={16} /> {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                {profileMessage && <p className="text-sm text-emerald-700" role="status">{profileMessage}</p>}
              </div>
            </form>
          </section>

          <section className="border-y border-slate-200 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck size={22} className="text-slate-700" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Bảo mật</h2>
                <p className="text-sm text-slate-500">Đổi mật khẩu bằng mật khẩu hiện tại.</p>
              </div>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Mật khẩu hiện tại
                <input required minLength={8} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Mật khẩu mới
                <input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu mới
                <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100" />
              </label>
              {passwordError && <p className="text-sm text-rose-700" role="alert">{passwordError}</p>}
              <div className="flex flex-wrap items-center gap-4">
                <button disabled={isChangingPassword} type="submit" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60">
                  {isChangingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
                {passwordMessage && <p className="text-sm text-emerald-700" role="status">{passwordMessage}</p>}
              </div>
            </form>
          </section>
        </div>

        <aside className="h-fit border-y border-slate-200 bg-white p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PackageCheck size={22} className="text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Đơn hàng gần đây</h2>
            </div>
            <Link href="/orders" className="text-sm font-semibold text-rose-700 underline underline-offset-4">Tất cả</Link>
          </div>

          {orders.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {orders.slice(0, 5).map((order) => (
                <li key={order.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Đơn #{order.id.slice(0, 8)}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''} · {order.status}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-900">{order.total_amount.toLocaleString()}₫</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{order.items?.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}