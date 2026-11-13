'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { translateApiMessage } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') setMessage('Email đã được xác minh. Bạn có thể đăng nhập.');
    if (params.get('reset') === '1') setMessage('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.');
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const result = response.data.data;
      login(result.user, result.token);
      router.push(result.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(translateApiMessage(responseMessage, 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-slate-600">Chào mừng bạn quay lại Bookly</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded border p-3" type="email" placeholder="Địa chỉ email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <div className="relative">
            <input
              className="w-full rounded border p-3 pr-11"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-right text-sm">
          <Link href="/forgot-password" className="font-semibold text-primary">Quên mật khẩu?</Link>
        </p>

        <p className="mt-4 text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-primary">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
