'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Search, ShoppingCart, X } from 'lucide-react';
import api from '@/lib/axios';
import { BookType, OrderType, UserType } from '@/types';
import { formatDateTime, formatPrice, translateApiMessage, translateOrderStatus } from '@/lib/utils';

const nextStatuses: Record<string, string[]> = {
  PENDING: ['PROCESSING'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

type CreateOrderDraft = {
  user_id: string;
  recipient_name: string;
  phone: string;
  address: string;
  items: { book_id: string; quantity: number }[];
};

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function statusStyle(status: string) {
  if (status === 'DELIVERED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700';
  if (status === 'SHIPPED') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-800';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [books, setBooks] = useState<BookType[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState<CreateOrderDraft>({ user_id: '', recipient_name: '', phone: '', address: '', items: [] });

  async function loadOrders() {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/admin/all');
      setOrders(response.data.data);
      setError('');
    } catch {
      setError('Bạn cần quyền quản trị để xem đơn hàng.');
    } finally {
      setIsLoading(false);
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
      setError(translateApiMessage(responseMessage, 'Không thể cập nhật trạng thái đơn hàng.'));
    } finally {
      setUpdatingId(null);
    }
  }

  async function openCreateForm() {
    setIsCreateOpen(true);
    setIsLoadingOptions(true);
    setFormError('');
    try {
      const [usersResponse, booksResponse] = await Promise.all([api.get('/users'), api.get('/books')]);
      const activeCustomers: UserType[] = usersResponse.data.data.filter((user: UserType & { is_active?: boolean }) => user.is_active !== false);
      const availableBooks: BookType[] = booksResponse.data.data.filter((book: BookType) => book.stock > 0);
      setCustomers(activeCustomers);
      setBooks(availableBooks);
      setDraft({
        user_id: activeCustomers[0]?.id || '',
        recipient_name: activeCustomers[0]?.full_name || '',
        phone: '',
        address: '',
        items: availableBooks[0] ? [{ book_id: availableBooks[0].id, quantity: 1 }] : [],
      });
      if (!activeCustomers.length || !availableBooks.length) {
        setFormError('Cần có khách hàng đang hoạt động và sách còn hàng để tạo đơn.');
      }
    } catch (requestError) {
      setFormError(translateApiMessage((requestError as { response?: { data?: { message?: string } } }).response?.data?.message, 'Không thể tải dữ liệu tạo đơn.'));
    } finally {
      setIsLoadingOptions(false);
    }
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsCreating(true);
    try {
      await api.post('/orders/admin', {
        ...draft,
        items: draft.items.map((item) => ({ ...item, quantity: Number(item.quantity) })),
      });
      setIsCreateOpen(false);
      setError('');
      await loadOrders();
    } catch (requestError) {
      setFormError(translateApiMessage((requestError as { response?: { data?: { message?: string } } }).response?.data?.message, 'Không thể tạo đơn hàng. Vui lòng kiểm tra tồn kho và thông tin giao hàng.'));
    } finally {
      setIsCreating(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const customer = `${order.user?.full_name || order.recipient_name} ${order.user?.email || ''} ${order.phone || ''}`.toLocaleLowerCase('vi');
    return customer.includes(search.trim().toLocaleLowerCase('vi')) && (statusFilter === 'ALL' || order.status === statusFilter);
  });

  const itemCount = (order: OrderType) => order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#586ce0] px-5 py-5 text-white shadow-sm sm:px-7">
        <div>
          <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
          <p className="mt-1 text-xs text-white/75">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        <button type="button" onClick={() => void openCreateForm()} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
          <Plus size={15} /> Tạo đơn hàng mới
        </button>
      </header>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 className="font-medium text-slate-800">Danh sách đơn hàng</h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label className="relative min-w-48 flex-1 sm:flex-none">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên khách hàng" className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-blue-400" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc theo trạng thái" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-blue-400">
              <option value="ALL">Tất cả trạng thái</option>
              {statusOptions.map((status) => <option key={status} value={status}>{translateOrderStatus(status)}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left">
            <colgroup>
              <col className="w-[14%]" /><col className="w-[15%]" /><col className="w-[17%]" /><col className="w-[8%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[12%]" /><col className="w-[10%]" />
            </colgroup>
            <thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Mã đơn</th>
                <th className="px-3 py-3">Khách hàng</th>
                <th className="px-3 py-3">Sản phẩm</th>
                <th className="px-3 py-3">Số lượng</th>
                <th className="px-3 py-3">Tổng tiền</th>
                <th className="px-3 py-3">Ngày đặt</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="truncate px-3 py-3 font-semibold text-slate-900" title={order.id}>#{order.id.slice(0, 12)}</td>
                  <td className="truncate px-3 py-3" title={order.user?.email || order.recipient_name}>
                    <span className="block truncate font-medium">{order.user?.full_name || order.recipient_name}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">{order.user?.email || order.phone}</span>
                    {order.cancellation_reason && <span className="mt-1 block truncate text-[10px] text-rose-700" title={order.cancellation_reason}>Lý do hủy: {order.cancellation_reason}</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className="block truncate" title={order.items?.map((item) => item.title).join(', ')}>{order.items?.[0]?.title || '—'}</span>
                    {(order.items?.length || 0) > 1 && <span className="text-[10px] text-slate-500">+{(order.items?.length || 0) - 1} sản phẩm khác</span>}
                  </td>
                  <td className="px-3 py-3">{itemCount(order)}</td>
                  <td className="px-3 py-3 font-semibold text-blue-700">{formatPrice(order.total_amount)}</td>
                  <td className="px-3 py-3 text-[10px] text-slate-600">{order.created_at ? formatDateTime(order.created_at) : '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex whitespace-nowrap rounded px-2 py-1 text-[9px] font-bold ${statusStyle(order.status)}`}>{translateOrderStatus(order.status)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Cập nhật trạng thái" aria-label={`Cập nhật trạng thái đơn ${order.id}`} disabled={updatingId === order.id || !nextStatuses[order.status]?.length} onClick={() => { setEditingOrder(order); setNewStatus(nextStatuses[order.status]?.[0] || order.status); }} className="rounded-md bg-cyan-500 p-1.5 text-white hover:bg-cyan-600 disabled:opacity-40">
                        <Pencil size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredOrders.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">{orders.length ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}</td></tr>}
              {isLoading && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">Đang tải đơn hàng...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setEditingOrder(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="status-dialog-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="status-dialog-title" className="text-lg font-bold text-slate-900">Cập nhật trạng thái đơn</h2>
              <button type="button" aria-label="Đóng" onClick={() => setEditingOrder(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm text-slate-600">Đơn #{editingOrder.id.slice(0, 8)} · {editingOrder.user?.full_name || editingOrder.recipient_name}</p>
            <label className="block text-sm font-medium text-slate-700">Trạng thái mới
              <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3">
                {nextStatuses[editingOrder.status]?.map((status) => <option key={status} value={status}>{translateOrderStatus(status)}</option>)}
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingOrder(null)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Đóng</button>
              <button type="button" disabled={updatingId === editingOrder.id} onClick={async () => { await updateStatus(editingOrder.id, newStatus); setEditingOrder(null); }} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Check size={15} /> Lưu trạng thái</button>
            </div>
          </section>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setIsCreateOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-order-title" onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2"><ShoppingCart size={18} className="text-blue-600" /><h2 id="create-order-title" className="text-lg font-bold text-slate-900">Tạo đơn hàng mới</h2></div>
              <button type="button" aria-label="Đóng" onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {isLoadingOptions ? <p className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</p> : (
              <form onSubmit={createOrder} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Tài khoản khách hàng
                  <select required value={draft.user_id} onChange={(event) => { const user = customers.find((customer) => customer.id === event.target.value); setDraft({ ...draft, user_id: event.target.value, recipient_name: user?.full_name || '' }); }} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3">
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name} · {customer.email}</option>)}
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">Tên người nhận
                    <input required value={draft.recipient_name} onChange={(event) => setDraft({ ...draft, recipient_name: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">Số điện thoại
                    <input required type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-slate-700">Địa chỉ giao hàng
                  <textarea required rows={2} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2" />
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Sản phẩm</h3><button type="button" onClick={() => setDraft({ ...draft, items: [...draft.items, { book_id: books[0]?.id || '', quantity: 1 }] })} disabled={!books.length} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 disabled:opacity-50"><Plus size={14} /> Thêm sản phẩm</button></div>
                  {draft.items.map((item, index) => (
                    <div key={`${index}-${item.book_id}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_100px_34px]">
                      <select required value={item.book_id} onChange={(event) => setDraft({ ...draft, items: draft.items.map((current, itemIndex) => itemIndex === index ? { ...current, book_id: event.target.value } : current) })} className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm">
                        {books.map((book) => <option key={book.id} value={book.id}>{book.title} · còn {book.stock} · {formatPrice(book.price)}</option>)}
                      </select>
                      <input required type="number" min={1} max={99} value={item.quantity} onChange={(event) => setDraft({ ...draft, items: draft.items.map((current, itemIndex) => itemIndex === index ? { ...current, quantity: Number(event.target.value) } : current) })} aria-label={`Số lượng sản phẩm ${index + 1}`} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
                      <button type="button" disabled={draft.items.length === 1} aria-label="Xóa sản phẩm" onClick={() => setDraft({ ...draft, items: draft.items.filter((_, itemIndex) => itemIndex !== index) })} className="flex h-10 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-30"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Hủy</button>
                  <button type="submit" disabled={isCreating || isLoadingOptions || !customers.length || !books.length} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{isCreating ? 'Đang tạo...' : 'Tạo đơn hàng'}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
