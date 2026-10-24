 'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { BookType } from '@/types';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadBooks() {
    try {
      const response = await api.get('/books/admin/all');
      setBooks(response.data.data);
      setError('');
    } catch {
      setError('Admin access is required to manage books.');
    }
  }

  useEffect(() => { void loadBooks(); }, []);

  async function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
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
      await loadBooks();
    } catch (requestError) {
      const responseMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(responseMessage || 'Could not save this book.');
    } finally {
      setLoading(false);
    }
  }

  function editBook(book: BookType) {
    setEditingId(book.id);
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
  }

  async function archiveBook(id: string) {
    if (!window.confirm('Hide this book from the storefront?')) return;
    try {
      await api.delete(`/books/${id}`);
      await loadBooks();
    } catch {
      setError('Could not update this book.');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books management</h1>
        <button onClick={() => { setEditingId(null); setDraft(emptyDraft); }} className="rounded bg-primary px-4 py-2 text-white">Add new book</button>
      </div>

      <form onSubmit={saveBook} className="mb-6 grid gap-3 rounded border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input required placeholder="Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="rounded border p-2" />
        <input required placeholder="Author" value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} className="rounded border p-2" />
        <input placeholder="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="rounded border p-2" />
        <input placeholder="Format" value={draft.format} onChange={(event) => setDraft({ ...draft, format: event.target.value })} className="rounded border p-2" />
        <input placeholder="Publisher" value={draft.publisher} onChange={(event) => setDraft({ ...draft, publisher: event.target.value })} className="rounded border p-2" />
        <input min="0" type="number" placeholder="Publication year" value={draft.publication_year} onChange={(event) => setDraft({ ...draft, publication_year: event.target.value })} className="rounded border p-2" />
        <input required min="0" type="number" placeholder="Price" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="rounded border p-2" />
        <input required min="0" type="number" placeholder="Stock" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} className="rounded border p-2" />
        <textarea placeholder="Product description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="min-h-24 rounded border p-2 sm:col-span-2 lg:col-span-3" />
        <textarea placeholder="Image URLs (one per line, up to 4)" value={draft.image_urls} onChange={(event) => setDraft({ ...draft, image_urls: event.target.value })} className="min-h-24 rounded border p-2 sm:col-span-2 lg:col-span-3" />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
          <button disabled={loading} type="submit" className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Saving...' : editingId ? 'Save changes' : 'Create book'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft); }} className="rounded border px-4 py-2">Cancel</button>}
        </div>
      </form>
      {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}

      <div className="overflow-x-auto rounded border border-slate-200 bg-white p-5">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="py-3">Title</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b">
                <td className="py-3">{book.title}</td>
                <td>{book.stock}</td>
                <td>{book.price.toLocaleString()}₫</td>
                <td>{book.is_active === false ? 'Hidden' : 'Active'}</td>
                <td className="space-x-3 py-3">
                  <button onClick={() => editBook(book)} className="font-medium text-blue-700">Edit</button>
                  {book.is_active !== false && <button onClick={() => void archiveBook(book.id)} className="font-medium text-rose-700">Hide</button>}
                </td>
              </tr>
            ))}
            {books.length === 0 && <tr><td className="py-5 text-slate-500" colSpan={5}>No books found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
