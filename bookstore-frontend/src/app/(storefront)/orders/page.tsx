'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { OrderType } from '@/types';

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get('/orders')
      .then((response) => setOrders(response.data.data))
      .catch(() => setError('Could not load your orders. Please sign in again.'));
  }, [token]);

  if (!token) {
    return <div className="container py-16 text-center"><h1 className="text-3xl font-bold">Sign in to view your orders</h1><Link href="/login" className="mt-6 inline-flex rounded bg-slate-900 px-5 py-3 font-semibold text-white">Sign in</Link></div>;
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p><h1 className="mt-2 text-3xl font-bold">Your orders</h1></div>
        <Link href="/books" className="text-sm font-semibold text-slate-700 underline">Continue shopping</Link>
      </div>
      {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}
      {!error && orders.length === 0 ? <p className="rounded border bg-white p-8 text-center text-slate-600">No orders yet.</p> : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border-b border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold">Order {order.id.slice(0, 8)}</p><p className="mt-1 text-sm text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</p></div>
                <div className="text-right"><p className="font-bold">{order.total_amount.toLocaleString()}₫</p><p className="mt-1 text-sm text-slate-600">{order.status}</p></div>
              </div>
              <ul className="mt-4 divide-y text-sm text-slate-600">
                {order.items?.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2"><span>{item.title} × {item.quantity}</span><span>{(item.unit_price * item.quantity).toLocaleString()}₫</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}