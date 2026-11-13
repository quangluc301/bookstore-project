 'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BookOpen, Eye, EyeOff, Pencil, Plus, Search, X } from 'lucide-react';
import api from '@/lib/axios';
import { BookType } from '@/types';
import { formatPrice, translateApiMessage } from '@/lib/utils';
import { BookCover } from '@/components/store/BookCover';

type BookDraft = {
  title: string;
  author: string;
  category: string;
  format: string;
  publisher: string;
  publication_year: string;
  description: string;
  image_urls: string;
  price: string;
  stock: string;
};
const emptyDraft: BookDraft = {
  title: '', author: '', category: '', format: '', publisher: '', publication_year: '',
  description: '', image_urls: '', price: '', stock: '',
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [draft, setDraft] = useState<BookDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingBookId, setPendingBookId] = useState<string | null>(null);

  async function loadBooks() {
    setIsLoading(true);
    try {
      const response = await api.get('/books/admin/all');
      setBooks(response.data.data);
      setError('');
    } catch {
      setError('Bạn cần quyền quản trị để quản lý sách.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadBooks(); }, []);

  async function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    const payload = {
      ...draft,
      image_urls: draft.image_urls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
      publication_year: draft.publication_year ? Number(draft.publication_year) : null,
      price: Number(draft.price),
      stock: Number(draft.stock),
    };
    try {
      if (editingId) await api.put(`/books/${editingId}`, payload);
      else await api.post('/books', payload);
      setDraft(emptyDraft);
      setEditingId(null);
      setIsFormOpen(false);
      await loadBooks();
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setFormError(translateApiMessage(responseMessage, 'Không thể lưu thông tin sách.'));
    } finally {
      setLoading(false);
    }
  }

  function editBook(book: BookType) {
    setEditingId(book.id);
    setIsCustomCategory(false);
    setDraft({
      title: book.title,
      author: book.author,
      category: book.category || '',
      format: book.format || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year ? String(book.publication_year) : '',
      description: book.description || '',
      image_urls: book.images?.map((image) => image.url).join('\n') || '',
      price: String(book.price),
      stock: String(book.stock),
    });
    setFormError('');
    setIsFormOpen(true);
  }

  function openCreateForm() {
    setEditingId(null);
    setIsCustomCategory(false);
    setDraft(emptyDraft);
    setFormError('');
    setIsFormOpen(true);
  }

  async function toggleBookVisibility(book: BookType) {
    const shouldActivate = book.is_active === false;
    if (!window.confirm(shouldActivate ? 'Hiện lại sách này trên cửa hàng?' : 'Ẩn sách này khỏi cửa hàng?')) return;
    setPendingBookId(book.id);
    setError('');
    try {
      if (shouldActivate) await api.put(`/books/${book.id}`, { is_active: true });
      else await api.delete(`/books/${book.id}`);
      await loadBooks();
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(translateApiMessage(responseMessage, 'Không thể cập nhật sách.'));
    } finally {
      setPendingBookId(null);
    }
  }

  const filteredBooks = books.filter((book) => `${book.title} ${book.author} ${book.category || ''}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const availableCategories = Array.from(new Set(books.map((book) => book.category?.trim()).filter((category): category is string => Boolean(category)))).sort((first, second) => first.localeCompare(second, 'vi'));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#586ce0] px-5 py-5 text-white shadow-sm sm:px-7">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho sách</h1>
          <p className="mt-1 text-xs text-white/75">Hệ thống quản trị nội bộ dành cho Admin</p>
        </div>
        <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
          <Plus size={15} /> Thêm sách mới
        </button>
      </header>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-blue-600" />
            <h2 className="font-medium text-slate-800">Danh sách sản phẩm</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{filteredBooks.length}</span>
          </div>
          <label className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sách..." className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-blue-400" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left">
            <colgroup>
              <col className="w-[9%]" /><col className="w-[28%]" /><col className="w-[20%]" /><col className="w-[11%]" /><col className="w-[17%]" /><col className="w-[8%]" /><col className="w-[7%]" />
            </colgroup>
            <thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Ảnh</th>
                <th className="px-3 py-3">Tên sách</th>
                <th className="px-3 py-3">Tác giả</th>
                <th className="px-3 py-3">Giá</th>
                <th className="px-3 py-3">Danh mục</th>
                <th className="px-3 py-3">Số lượng</th>
                <th className="px-3 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className={`hover:bg-slate-50/70 ${book.is_active === false ? 'bg-slate-50/60' : ''}`}>
                  <td className="px-3 py-2.5"><BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="h-11 w-8 rounded-sm" /></td>
                  <td className="truncate px-3 py-2.5 font-semibold text-slate-900" title={book.title}>
                    {book.title}
                    {book.is_active === false && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">Đang ẩn</span>}
                  </td>
                  <td className="truncate px-3 py-2.5" title={book.author}>{book.author}</td>
                  <td className="px-3 py-2.5 font-semibold text-blue-700">{formatPrice(book.price)}</td>
                  <td className="truncate px-3 py-2.5">
                    {book.category ? <span className="rounded bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">{book.category}</span> : <span className="text-slate-400">Chưa phân loại</span>}
                  </td>
                  <td className="px-3 py-2.5">{book.stock}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Sửa sách" aria-label={`Sửa ${book.title}`} onClick={() => editBook(book)} className="rounded-md bg-cyan-500 p-1.5 text-white hover:bg-cyan-600"><Pencil size={13} /></button>
                      <button type="button" title={book.is_active === false ? 'Hiện sách' : 'Ẩn sách'} aria-label={book.is_active === false ? `Hiện ${book.title}` : `Ẩn ${book.title}`} disabled={pendingBookId === book.id} onClick={() => void toggleBookVisibility(book)} className={`rounded-md p-1.5 text-white disabled:opacity-50 ${book.is_active === false ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'}`}>
                        {book.is_active === false ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredBooks.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">{books.length ? 'Không tìm thấy sách phù hợp.' : 'Chưa có sản phẩm nào.'}</td></tr>}
              {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">Đang tải danh sách sách...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setIsFormOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="book-form-title" onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2"><BookOpen size={18} className="text-blue-600" /><h2 id="book-form-title" className="text-lg font-bold text-slate-900">{editingId ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2></div>
              <button type="button" aria-label="Đóng" onClick={() => setIsFormOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={saveBook} className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Tên sách" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <input required placeholder="Tác giả" value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <label className="block text-sm font-medium text-slate-700">
                Thể loại
                {isCustomCategory ? (
                  <div className="mt-1 flex gap-2">
                    <input autoFocus maxLength={191} placeholder="Nhập tên thể loại mới" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm" />
                    <button type="button" onClick={() => { setIsCustomCategory(false); setDraft({ ...draft, category: '' }); }} className="shrink-0 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">Chọn có sẵn</button>
                  </div>
                ) : (
                  <select value={draft.category} onChange={(event) => {
                    if (event.target.value === '__create_new__') {
                      setIsCustomCategory(true);
                      setDraft({ ...draft, category: '' });
                    } else {
                      setDraft({ ...draft, category: event.target.value });
                    }
                  }} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option value="">Chọn thể loại</option>
                    {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    <option value="__create_new__">+ Tạo thể loại mới</option>
                  </select>
                )}
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Định dạng
                <select
                  value={draft.format}
                  onChange={(event) => setDraft({ ...draft, format: event.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Chọn định dạng</option>
                  <option value="Bìa cứng">Bìa cứng</option>
                  <option value="Bìa mềm">Bìa mềm</option>
                </select>
              </label>
              <input placeholder="Nhà xuất bản" value={draft.publisher} onChange={(event) => setDraft({ ...draft, publisher: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <input min="0" type="number" placeholder="Năm xuất bản" value={draft.publication_year} onChange={(event) => setDraft({ ...draft, publication_year: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <input required min="0" type="number" placeholder="Giá bán (₫)" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <input required min="0" type="number" placeholder="Số lượng tồn kho" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
              <textarea placeholder="Mô tả sách" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="min-h-20 rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
              <textarea placeholder="Đường dẫn ảnh (mỗi dòng một ảnh, tối đa 4 ảnh)" value={draft.image_urls} onChange={(event) => setDraft({ ...draft, image_urls: event.target.value })} className="min-h-20 rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
              {formError && <p className="text-sm text-rose-700 sm:col-span-2" role="alert">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Hủy</button>
                <button disabled={loading} type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo sách'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
