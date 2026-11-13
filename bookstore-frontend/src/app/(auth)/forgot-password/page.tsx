'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { translateApiMessage } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (step === 'reset' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      if (step === 'request') {
        const normalizedEmail = email.trim().toLowerCase();
        const response = await api.post('/auth/forgot-password', { email: normalizedEmail });
        setEmail(normalizedEmail);
        setMessage(translateApiMessage(response.data.message, 'Nếu email đã đăng ký, mã đặt lại mật khẩu sẽ được gửi.'));
        setStep('reset');
      } else {
        await api.post('/auth/reset-password', { email: email.trim().toLowerCase(), code, password });
        router.push('/login?reset=1');
      }
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(translateApiMessage(responseMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{step === 'request' ? 'Quên mật khẩu?' : 'Tạo mật khẩu mới'}</h1>
        <p className="mt-2 text-slate-600">
          {step === 'request' ? 'Nhập email để nhận mã đặt lại mật khẩu.' : `Nhập mã đã gửi đến ${email} và tạo mật khẩu mới.`}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {step === 'request' ? (
            <input className="w-full rounded border p-3" type="email" placeholder="Địa chỉ email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          ) : (
            <>
              <input className="w-full rounded border p-3 text-center tracking-[0.3em]" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="Mã gồm 6 chữ số" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
              <div className="relative">
                <input
                  className="w-full rounded border p-3 pr-11"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
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
                  placeholder="Xác nhận mật khẩu mới"
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
          )}
          {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Vui lòng chờ...' : step === 'request' ? 'Gửi mã đặt lại' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        {step === 'reset' && (
          <div className="mt-4 flex justify-between gap-4 text-sm">
            <button type="button" onClick={() => { setStep('request'); setCode(''); setMessage(''); setError(''); }} disabled={loading} className="font-semibold text-slate-600 disabled:opacity-60">
              Đổi email
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError('');
                setMessage('');
                setLoading(true);
                try {
                  const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
                  setCode('');
                  setMessage(translateApiMessage(response.data.message, 'Nếu email đã đăng ký, mã đặt lại mật khẩu sẽ được gửi.'));
                } catch (requestError) {
                  const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
                  setError(translateApiMessage(responseMessage, 'Không thể gửi lại mã. Vui lòng thử lại.'));
                } finally {
                  setLoading(false);
                }
              }}
              className="font-semibold text-primary disabled:opacity-60"
            >
              Gửi lại mã
            </button>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Nhớ mật khẩu rồi? <Link href="/login" className="font-semibold text-primary">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
