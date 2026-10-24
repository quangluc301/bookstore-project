'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { BookCover } from '@/components/store/BookCover';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="container py-16">
      <h1 className="mb-8 text-3xl font-bold">Your cart</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Giỏ hàng của bạn đang trống.</p>
          <Link href="/books" className="mt-4 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 items-center gap-4">
                  <BookCover title={item.title} imageUrl={item.imageUrl} className="h-24 w-16 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">Số lượng: {item.quantity}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.price.toLocaleString()}₫ / cuốn</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="whitespace-nowrap font-bold text-slate-900">{(item.quantity * item.price).toLocaleString()}₫</p>
                  <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`} className="rounded p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-xl bg-slate-900 p-6 text-white">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-6 flex items-center justify-between text-slate-300">
              <span>Tạm tính</span>
              <span>{total.toLocaleString()}₫</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-bold">{total.toLocaleString()}₫</span>
            </div>
            <Link href="/checkout" className="mt-8 block w-full rounded bg-white px-4 py-3 text-center font-medium text-slate-900 hover:bg-slate-100">Proceed to checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
