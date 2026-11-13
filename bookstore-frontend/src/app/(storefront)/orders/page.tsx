'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ban, Eye, X } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { OrderType } from '@/types';
import { formatDateTime, formatPrice, translateApiMessage, translateOrderStatus } from '@/lib/utils';
import { BookCover } from '@/components/store/BookCover';

const cancellationReasons = [
  'Cập nhật lại thông tin',
  'Đặt nhầm sản phẩm',
  'Không còn nhu cầu',
  'Muốn đổi sản phẩm',
  'Thời gian giao hàng chưa phù hợp',
];

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [error, setError] = useState('');
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderType | null>(null);
  const [cancellationReason, setCancellationReason] = useState(cancellationReasons[0]);
  const [cancellationError, setCancellationError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get('/orders')
      .then((response) => setOrders(response.data.data))
      .catch(() => setError('Không thể tải đơn hàng. Vui lòng đăng nhập lại.'));
  }, [token]);

  async function cancelOrder() {
    if (!cancellingOrder) return;
    setCancellationError('');
    setIsCancelling(true);
    try {
      const response = await api.patch(`/orders/${cancellingOrder.id}/cancel`, { reason: cancellationReason });
      setOrders((current) => current.map((order) => order.id === cancellingOrder.id ? response.data.data : order));
      setCancellingOrder(null);
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setCancellationError(translateApiMessage(message, 'Không thể hủy đơn hàng. Vui lòng tải lại trang và thử lại.'));
    } finally {
      setIsCancelling(false);
    }
  }

  if (!token) {
    return <div className="container py-16 text-center"><h1 className="text-3xl font-bold">Đăng nhập để xem đơn hàng</h1><Link href="/login" className="mt-6 inline-flex rounded bg-slate-900 px-5 py-3 font-semibold text-white">Đăng nhập</Link></div>;
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tài khoản</p><h1 className="mt-2 text-3xl font-bold">Đơn hàng của tôi</h1></div>
        <Link href="/books" className="text-sm font-semibold text-slate-700 underline">Tiếp tục mua sắm</Link>
      </div>
      {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}
      {!error && orders.length === 0 ? <p className="rounded border bg-white p-8 text-center text-slate-600">Bạn chưa có đơn hàng nào.</p> : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border-b border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold">Đơn hàng {order.id.slice(0, 8)}</p><p className="mt-1 text-sm text-slate-500">{order.created_at ? formatDateTime(order.created_at) : ''}</p></div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.total_amount)}</p>
                  <p className="mt-1 text-sm text-slate-600">{translateOrderStatus(order.status)}</p>
                  {order.cancellation_reason && <p className="mt-1 text-xs text-slate-500">Lý do hủy: {order.cancellation_reason}</p>}
                </div>
              </div>
              <ul className="mt-4 divide-y text-sm text-slate-600">
                {order.items?.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2"><span>{item.title} × {item.quantity}</span><span>{formatPrice(item.unit_price * item.quantity)}</span></li>)}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setViewingOrder(order)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Eye size={15} /> Xem chi tiết
                </button>
                {order.status === 'PENDING' && (
                  <button type="button" onClick={() => { setCancellingOrder(order); setCancellationReason(cancellationReasons[0]); setCancellationError(''); }} className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                    <Ban size={15} /> Hủy đơn hàng
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setViewingOrder(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="order-details-title" onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chi tiết đơn hàng</p>
                <h2 id="order-details-title" className="mt-1 text-xl font-bold text-slate-900">Đơn hàng {viewingOrder.id.slice(0, 8)}</h2>
                <p className="mt-1 text-sm text-slate-500">{viewingOrder.created_at ? formatDateTime(viewingOrder.created_at) : ''}</p>
              </div>
              <button type="button" aria-label="Đóng chi tiết" onClick={() => setViewingOrder(null)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
            </div>

            <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Người nhận</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.recipient_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Số điện thoại</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.phone || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">Địa chỉ giao hàng</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Trạng thái</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{translateOrderStatus(viewingOrder.status)}</p>
              </div>
              {viewingOrder.cancellation_reason && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Lý do hủy</p>
                  <p className="mt-1 text-sm font-medium text-rose-700">{viewingOrder.cancellation_reason}</p>
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Sản phẩm trong đơn</h3>
              <div className="divide-y divide-slate-100 border-y border-slate-200">
                {viewingOrder.items?.map((item) => (
                  <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_90px_120px_120px]">
                    <div className="flex min-w-0 items-center gap-3">
                      <BookCover title={item.title} imageUrl={item.book?.images?.[0]?.url} className="h-14 w-10 shrink-0 rounded-sm" />
                      <span className="min-w-0 font-medium text-slate-800">{item.title}</span>
                    </div>
                    <span className="text-slate-600">× {item.quantity}</span>
                    <span className="text-slate-600">{formatPrice(item.unit_price)} / cuốn</span>
                    <span className="text-right font-semibold text-slate-900">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-700">Tổng cộng</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(viewingOrder.total_amount)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => !isCancelling && setCancellingOrder(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="cancel-order-title" className="text-lg font-bold text-slate-900">Hủy đơn hàng</h2>
              <button type="button" aria-label="Đóng" disabled={isCancelling} onClick={() => setCancellingOrder(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm text-slate-600">Đơn hàng {cancellingOrder.id.slice(0, 8)} đang chờ xác nhận. Sách sẽ được hoàn lại kho sau khi hủy.</p>
            <label className="block text-sm font-medium text-slate-700">Lý do hủy
              <select value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3">
                {cancellationReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
              </select>
            </label>
            {cancellationError && <p className="mt-3 text-sm text-rose-700" role="alert">{cancellationError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={isCancelling} onClick={() => setCancellingOrder(null)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Quay lại</button>
              <button type="button" disabled={isCancelling} onClick={() => void cancelOrder()} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}