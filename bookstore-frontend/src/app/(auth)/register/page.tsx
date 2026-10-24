'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (step === 'register') {
        await api.post('/auth/register', { full_name: fullName, email, password });
        setStep('verify');
        setMessage('A verification code has been sent to your email.');
      } else {
        await api.post('/auth/verify-email', { email, code });
        router.push('/login?verified=1');
      }
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(responseMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-verification', { email });
      setMessage(response.data.message);
    } catch {
      setError('Could not resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{step === 'register' ? 'Create account' : 'Verify your email'}</h1>
        <p className="mt-2 text-slate-600">
          {step === 'register' ? 'Join Bookstore today' : `Enter the 6-digit code sent to ${email}.`}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {step === 'register' ? (
            <>
              <input className="w-full rounded border p-3" type="text" placeholder="Full name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
              <input className="w-full rounded border p-3" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <input className="w-full rounded border p-3" type="password" placeholder="Password (at least 8 characters)" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </>
          ) : (
            <input className="w-full rounded border p-3 text-center tracking-[0.3em]" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          )}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-primary px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Please wait...' : step === 'register' ? 'Send verification code' : 'Verify email'}
          </button>
        </form>

        {step === 'verify' && (
          <button type="button" onClick={resendCode} disabled={loading} className="mt-4 w-full text-sm font-semibold text-primary disabled:opacity-60">
            Resend code
          </button>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}
