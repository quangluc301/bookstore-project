'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') setMessage('Email verified. You can now sign in.');
    if (params.get('reset') === '1') setMessage('Password reset successfully. You can now sign in.');
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
      setError(responseMessage || 'Could not sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-slate-600">Welcome back to Bookstore</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded border p-3" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="w-full rounded border p-3" type="password" placeholder="Password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-right text-sm">
          <Link href="/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
        </p>

        <p className="mt-4 text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-primary">Register</Link>
        </p>
      </div>
    </div>
  );
}
