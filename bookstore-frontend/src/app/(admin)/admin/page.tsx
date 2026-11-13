'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock3, PackageCheck, RefreshCw, ShoppingBag, TrendingUp, UsersRound } from 'lucide-react';
import api from '@/lib/axios';
import { BookType, OrderType } from '@/types';
import { formatDateTime, formatPrice, translateOrderStatus } from '@/lib/utils';

type DashboardStats = {
  total_books: number;
  total_orders: number;
  revenue: number;
  total_users: number;
};

type Activity = {
  id: string;
  label: string;
  created_at?: string;
  kind: 'book' | 'order';
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [books, setBooks] = useState<BookType[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (refreshKey > 0) setIsRefreshing(true);
    setError('');
    Promise.all([
      api.get('/orders/admin/stats'),
      api.get('/orders/admin/all'),
      api.get('/books/admin/all'),
    ])
      .then(([statsResponse, ordersResponse, booksResponse]) => {
        if (!active) return;
        setStats(statsResponse.data.data);
        setOrders(ordersResponse.data.data);
        setBooks(booksResponse.data.data);
      })
      .catch(() => {
        if (active) setError('Không thể tải dữ liệu quản trị. Vui lòng kiểm tra quyền truy cập và thử lại.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => { active = false; };
  }, [refreshKey]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const revenueByDate = new Map<string, number>();
  for (const order of orders) {
    if (!order.created_at || order.status !== 'DELIVERED') continue;
    const orderDate = new Date(order.created_at);
    revenueByDate.set(dateKey(orderDate), (revenueByDate.get(dateKey(orderDate)) || 0) + order.total_amount);
  }

  const chartData = Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - rangeDays + index + 1);
    return {
      date,
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: revenueByDate.get(dateKey(date)) || 0,
    };
  });
  const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);
  const chartWidth = 720;
  const chartHeight = 220;
  const plotLeft = 52;
  const plotTop = 12;
  const plotWidth = chartWidth - plotLeft - 8;
  const plotHeight = chartHeight - plotTop - 32;
  const barSlot = plotWidth / chartData.length;
  const barWidth = Math.max(2, Math.min(18, barSlot * 0.6));
  const labelStep = Math.max(1, Math.ceil(rangeDays / 7));

  const activities: Activity[] = [
    ...books.map((book) => ({
      id: `book-${book.id}`,
      label: `Đã thêm sách “${book.title}”`,
      created_at: book.created_at,
      kind: 'book' as const,
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      label: `Phát sinh đơn hàng #${order.id.slice(0, 8).toUpperCase()}`,
      created_at: order.created_at,
      kind: 'order' as const,
    })),
  ]
    .filter((activity) => activity.created_at)
    .sort((first, second) => new Date(second.created_at!).getTime() - new Date(first.created_at!).getTime())
    .slice(0, 6);

  const metrics = [
    { label: 'Tổng đầu sách', value: stats?.total_books, icon: BookOpen, color: 'bg-blue-600' },
    { label: 'Tổng đơn hàng', value: stats?.total_orders, icon: ShoppingBag, color: 'bg-emerald-600' },
    { label: 'Tổng doanh thu', value: stats ? formatPrice(stats.revenue) : undefined, icon: TrendingUp, color: 'bg-cyan-500' },
    { label: 'Tổng người dùng', value: stats?.total_users, icon: UsersRound, color: 'bg-amber-500' },
  ];

  return (
    <div className="-m-4 min-h-[calc(100vh-57px)] md:-m-8">
      <section className="bg-indigo-600 px-4 pb-14 pt-7 text-white md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard hệ thống</h1>
            <p className="mt-1 text-sm text-indigo-100">Tổng quan hoạt động của nhà sách</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-70"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </section>

      <div className="relative -mt-10 space-y-5 px-4 pb-8 md:px-8">
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}

        <section aria-label="Chỉ số tổng quan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <article key={label} className="flex min-w-0 items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
                <p className="mt-1 truncate text-2xl font-bold text-slate-900">{isLoading ? '…' : value ?? '—'}</p>
              </div>
              <span className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${color}`}>
                <Icon size={18} />
              </span>
            </article>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.08)] md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-bold text-slate-900"><TrendingUp size={17} className="text-blue-600" /> Biểu đồ tăng trưởng doanh thu</h2>
              <label className="sr-only" htmlFor="revenue-range">Khoảng thời gian biểu đồ</label>
              <select id="revenue-range" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700">
                <option value={7}>7 ngày</option>
                <option value={30}>30 ngày</option>
                <option value={90}>90 ngày</option>
              </select>
            </div>

            <div className="overflow-hidden">
              <svg role="img" aria-label={`Doanh thu ${rangeDays} ngày gần nhất`} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-56 w-full">
                {[0, 1, 2, 3, 4].map((tick) => {
                  const y = plotTop + (plotHeight * tick) / 4;
                  const value = (maxRevenue * (4 - tick)) / 4;
                  return (
                    <g key={tick}>
                      <line x1={plotLeft} y1={y} x2={chartWidth} y2={y} stroke="#e8edf5" strokeWidth="1" />
                      <text x={plotLeft - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9">{value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}</text>
                    </g>
                  );
                })}
                {chartData.map((item, index) => {
                  const barHeight = (item.revenue / maxRevenue) * plotHeight;
                  const x = plotLeft + index * barSlot + (barSlot - barWidth) / 2;
                  const y = plotTop + plotHeight - barHeight;
                  const showLabel = index % labelStep === 0 || index === chartData.length - 1;
                  return (
                    <g key={dateKey(item.date)}>
                      {item.revenue > 0 && <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="3" fill="#586de1" />}
                      {showLabel && <text x={x + barWidth / 2} y={chartHeight - 8} textAnchor="middle" fill="#94a3b8" fontSize="9">{item.label}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">Doanh thu tính từ đơn chưa bị hủy · VNĐ</p>
          </section>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.08)] md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-bold text-slate-900"><Clock3 size={17} className="text-emerald-600" /> Đơn hàng vừa phát sinh</h2>
              <Link href="/admin/orders" className="shrink-0 text-xs font-semibold text-blue-700 hover:underline">Xem tất cả</Link>
            </div>
            <div>
              <table className="w-full table-fixed text-left text-[11px]">
                <thead className="text-[9px] uppercase tracking-wide text-slate-400">
                  <tr className="border-b border-slate-100">
                    <th className="w-[23%] pb-2 font-semibold">Mã đơn</th>
                    <th className="w-[23%] pb-2 font-semibold">Khách hàng</th>
                    <th className="w-[27%] pb-2 text-right font-semibold">Tổng tiền</th>
                    <th className="w-[27%] pb-2 text-right font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 font-semibold text-slate-800">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="max-w-28 truncate py-3 text-slate-600">{order.user?.full_name || order.recipient_name}</td>
                      <td className="whitespace-nowrap py-3 text-right font-semibold text-slate-800">{formatPrice(order.total_amount)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold ${statusStyles[order.status] || 'bg-slate-100 text-slate-700'}`}>
                          {translateOrderStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-500">{isLoading ? 'Đang tải đơn hàng...' : 'Chưa có đơn hàng.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.08)] md:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><PackageCheck size={17} className="text-amber-500" /> Hoạt động gần đây</h2>
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.kind === 'book' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {activity.kind === 'book' ? <BookOpen size={15} /> : <ShoppingBag size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{activity.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{activity.created_at ? formatDateTime(activity.created_at) : ''}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="py-5 text-sm text-slate-500">{isLoading ? 'Đang tải hoạt động...' : 'Chưa có hoạt động gần đây.'}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}