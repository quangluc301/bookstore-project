'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { translateApiMessage } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (step === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);

    try {
      if (step === 'register') {
        const normalizedEmail = email.trim().toLowerCase();
        const response = await api.post('/auth/register', { full_name: fullName.trim(), email: normalizedEmail, password });
        setEmail(normalizedEmail);
        setStep('verify');
        setMessage(translateApiMessage(response.data.message, 'Mã xác minh đã được gửi.'));
      } else {
        await api.post('/auth/verify-email', { email: email.trim().toLowerCase(), code });
        router.push('/login?verified=1');
      }
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(translateApiMessage(responseMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
      setCode('');
      setMessage(translateApiMessage(response.data.message, 'Mã xác minh đã được gửi.'));
    } catch {
      setError('Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{step === 'register' ? 'Tạo tài khoản' : 'Xác minh email'}</h1>
        <p className="mt-2 text-slate-600">
          {step === 'register' ? 'Tạo tài khoản để bắt đầu khám phá sách hay.' : `Nhập mã gồm 6 chữ số đã gửi đến ${email}.`}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {step === 'register' ? (
            <>
              <input className="w-full rounded border p-3" type="text" placeholder="Họ và tên" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
              <input className="w-full rounded border p-3" type="email" placeholder="Địa chỉ email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <div className="relative">
                <input
                  className="w-full rounded border p-3 pr-11"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu (ít nhất 8 ký tự)"
                  autoComplete="new-password"
                  minLength={8}
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
              <div className="relative">
                <input
                  className="w-full rounded border p-3 pr-11"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          ) : (
            <input className="w-full rounded border p-3 text-center tracking-[0.3em]" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="Mã xác minh gồm 6 chữ số" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          )}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-primary px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Vui lòng chờ...' : step === 'register' ? 'Gửi mã xác minh' : 'Xác minh email'}
          </button>
        </form>

        {step === 'verify' && (
          <div className="mt-4 flex justify-between gap-4 text-sm">
            <button type="button" onClick={() => { setStep('register'); setCode(''); setMessage(''); setError(''); }} disabled={loading} className="font-semibold text-slate-600 disabled:opacity-60">
              Đổi email
            </button>
            <button type="button" onClick={resendCode} disabled={loading} className="font-semibold text-primary disabled:opacity-60">
              Gửi lại mã
            </button>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-primary">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
