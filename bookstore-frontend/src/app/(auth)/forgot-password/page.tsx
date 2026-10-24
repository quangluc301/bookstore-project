'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (step === 'request') {
        const response = await api.post('/auth/forgot-password', { email });
        setMessage(response.data.message);
        setStep('reset');
      } else {
        await api.post('/auth/reset-password', { email, code, password });
        router.push('/login?reset=1');
      }
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(responseMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{step === 'request' ? 'Forgot password?' : 'Choose a new password'}</h1>
        <p className="mt-2 text-slate-600">
          {step === 'request' ? 'We will send a reset code to your email.' : `Enter the code sent to ${email} and choose a new password.`}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {step === 'request' ? (
            <input className="w-full rounded border p-3" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          ) : (
            <>
              <input className="w-full rounded border p-3 text-center tracking-[0.3em]" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
              <input className="w-full rounded border p-3" type="password" placeholder="New password (at least 8 characters)" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </>
          )}
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Please wait...' : step === 'request' ? 'Send reset code' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Remember your password? <Link href="/login" className="font-semibold text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}