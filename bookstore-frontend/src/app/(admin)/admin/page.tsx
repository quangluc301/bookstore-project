'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

type DashboardStats = { total_books: number; total_orders: number; revenue: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/admin/stats')
      .then((response) => setStats(response.data.data))
      .catch(() => setError('Admin access is required to view dashboard statistics.'));
  }, []);

  return (
    <div>
      {error && <p className="mb-5 text-sm text-red-700" role="alert">{error}</p>}
      <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total books</p>
        <h3 className="mt-2 text-3xl font-bold">{stats?.total_books ?? '—'}</h3>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Orders</p>
        <h3 className="mt-2 text-3xl font-bold">{stats?.total_orders ?? '—'}</h3>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Revenue</p>
        <h3 className="mt-2 text-3xl font-bold">{stats ? `${stats.revenue.toLocaleString()}₫` : '—'}</h3>
      </div>
      </div>
    </div>
  );
}
