'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, translateApiMessage } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isMounted, setIsMounted] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get('/auth/me')
      .then((response) => {
        if (!active) return;
        const profile = response.data.data;
        setRecipientName((current) => current || profile.full_name || '');
        setPhone((current) => current || profile.phone || '');
        setAddress((current) => current || profile.address || '');
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, [token]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        recipient_name: recipientName,
        phone,
        address,
        items: items.map((item) => ({ book_id: item.id, quantity: item.quantity })),
      });
      clearCart();
      router.push('/orders');
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(translateApiMessage(responseMessage, 'Không thể đặt hàng. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return <div className="container py-16 text-center text-slate-500">Đang tải thông tin...</div>;
  }

  if (!token) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold">Đăng nhập để thanh toán</h1>
        <p className="mt-3 text-slate-600">Giỏ hàng của bạn vẫn được giữ sau khi đăng nhập.</p>
        <Link href="/login" className="mt-6 inline-flex rounded bg-slate-900 px-5 py-3 font-semibold text-white">Đăng nhập</Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold">Giỏ hàng đang trống</h1>
        <Link href="/books" className="mt-6 inline-flex rounded bg-slate-900 px-5 py-3 font-semibold text-white">Khám phá sách</Link>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="rounded-xl border bg-white p-6" onSubmit={placeOrder}>
          <h2 className="mb-4 text-xl font-semibold">Thông tin giao hàng</h2>
          <div className="space-y-4">
            <input className="w-full rounded border p-3" placeholder="Họ và tên người nhận" autoComplete="name" required value={recipientName} onChange={(event) => setRecipientName(event.target.value)} />
            <input className="w-full rounded border p-3" type="tel" placeholder="Số điện thoại" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} />
            <textarea className="w-full rounded border p-3" placeholder="Địa chỉ nhận hàng" autoComplete="street-address" rows={3} required value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>
        </form>

        <div className="h-fit rounded-xl bg-slate-900 p-6 text-white">
          <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
          <div className="mt-6 space-y-3 text-slate-300">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span>{item.title} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-700 pt-3 font-semibold text-white">
              <span>Tổng cộng</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
