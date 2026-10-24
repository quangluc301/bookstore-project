'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { OrderType } from '@/types';

const nextStatuses: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    try {
      const response = await api.get('/orders/admin/all');
      setOrders(response.data.data);
      setError('');
    } catch {
      setError('Admin access is required to view orders.');
    }
  }

  useEffect(() => { void loadOrders(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await loadOrders();
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(responseMessage || 'Could not update the order status.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Orders management</h1>
      {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}

      <div className="overflow-x-auto rounded border border-slate-200 bg-white p-6">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="py-3">Order / items</th>
              <th>Customer / delivery</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-3">
                  <p className="font-medium">{order.id.slice(0, 8)}</p>
                  {order.items?.map((item) => <p key={item.id} className="text-sm text-slate-500">{item.title} × {item.quantity}</p>)}
                </td>
                <td>
                  <p>{order.user?.full_name || order.recipient_name}</p>
                  <p className="text-sm text-slate-500">{order.user?.email}</p>
                  <p className="max-w-xs text-sm text-slate-500">{order.phone} · {order.address}</p>
                </td>
                <td>{order.total_amount.toLocaleString()}₫</td>
                <td>
                  <select
                    aria-label={`Update status for order ${order.id}`}
                    value={order.status}
                    disabled={updatingId === order.id || !nextStatuses[order.status]?.length}
                    onChange={(event) => void updateStatus(order.id, event.target.value)}
                    className="rounded border border-slate-200 bg-white px-2 py-2 text-sm"
                  >
                    <option value={order.status}>{order.status}</option>
                    {nextStatuses[order.status]?.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td className="py-5 text-slate-500" colSpan={4}>No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
