'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookCover } from '@/components/store/BookCover';
import api from '@/lib/axios';
import { BookType } from '@/types';

const priceMarks = Array.from({ length: 10 }, (_, index) => (index + 1) * 50000);

export default function BooksPage({ searchParams }: { searchParams?: { search?: string } }) {
  const urlSearchTerm = searchParams?.search ?? '';
  const [books, setBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  useEffect(() => {
    let active = true;
    api.get('/books').then((response) => {
      if (!active) return;
      const catalog: BookType[] = response.data.data;
      setAvailableCategories(Array.from(new Set(catalog.map((book) => book.category).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, 'vi')));
      setAvailableFormats(Array.from(new Set(catalog.map((book) => book.format).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, 'vi')));
    }).catch(() => {
      if (active) {
        setAvailableCategories([]);
        setAvailableFormats([]);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api.get('/books', {
      params: {
        search: searchTerm || undefined,
        categories: selectedCategories.length ? selectedCategories.join(',') : undefined,
        maxPrice,
        format: selectedFormat === 'All' ? undefined : selectedFormat,
        sort: sortBy === 'price-asc' ? 'price_asc' : sortBy === 'price-desc' ? 'price_desc' : sortBy === 'title-asc' ? 'title_asc' : 'newest',
      },
    }).then((response) => {
      if (active) setBooks(response.data.data);
    }).catch(() => {
      if (active) setBooks([]);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [searchTerm, selectedCategories, maxPrice, selectedFormat, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(500000);
    setSelectedFormat('All');
  };

  return (
    <div className="container py-10 md:py-14">
      <section className="mb-10 overflow-hidden rounded-[30px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Curated collection</p>
            <h1 className="text-3xl font-black md:text-5xl">Find the next book worth your time.</h1>
            <p className="mt-4 max-w-lg text-base text-slate-300">
              Discover practical reads, timeless classics, and fresh releases chosen to inspire your next chapter.
            </p>
          </div>

          <div className="rounded-[24px] bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                {availableCategories.length} thể loại trong cửa hàng
              </span>
            </div>
            <div className="mt-5 rounded-[20px] bg-gradient-to-br from-[#f9dcc0] via-[#f7c77d] to-[#e8b15f] p-4 text-slate-900 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Danh mục sách</p>
              <p className="mt-2 text-2xl font-black">{availableCategories.length}</p>
              <p className="mt-1 text-sm text-slate-700">Thể loại hiện có trong dữ liệu cửa hàng</p>
            </div>
          </div>
        </div>
      </section>


      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">Filter by</h2>
            <button onClick={clearFilters} className="text-xs font-semibold text-rose-600 underline underline-offset-2 hover:text-rose-700">Clear all</button>
          </div>

          <div className="mt-5 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Category</p>
              <div className="space-y-2 text-sm text-slate-700">
                {availableCategories.map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(item)}
                      onChange={() => toggleCategory(item)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Price</p>
                <span className="text-sm font-bold text-slate-900">≤ {maxPrice.toLocaleString()}₫</span>
              </div>
              <input
                type="range"
                min="50000"
                max="500000"
                step="50000"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Maximum book price"
                className="w-full accent-slate-900"
              />
              <div className="mt-2 grid grid-cols-10 text-center text-[9px] leading-none text-slate-500">
                {priceMarks.map((price) => <span key={price}>{price / 1000}k</span>)}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Format</p>
              <div className="space-y-2 text-sm text-slate-700">
                {['All', ...availableFormats].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value={item}
                      checked={selectedFormat === item}
                      onChange={() => setSelectedFormat(item)}
                      className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                      {item === 'All' ? 'All formats' : item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <p aria-live="polite" className="text-sm text-slate-600">
              {searchTerm.trim() ? <>Results for “{searchTerm.trim()}” · </> : null}
              {isLoading ? 'Loading books...' : `Showing ${books.length} product${books.length !== 1 ? 's' : ''}`}
            </p>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Sort by
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100">
                <option value="popular">Most popular</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="title-asc">Title: A to Z</option>
              </select>
            </label>
          </div>

          {!isLoading && books.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-bold text-slate-800">No books found</p>
              <p className="mt-2 text-sm text-slate-500">Try changing the search or filters to see more books.</p>
              <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-rose-600 underline underline-offset-2">Clear filters</button>
            </div>
          ) : isLoading ? (
            <p className="rounded border border-slate-200 bg-white p-8 text-center text-slate-600">Loading catalog...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <article key={book.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
                        {book.category || 'Book'}
                      </span>
                    </div>
                    <BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="mt-3 h-48 w-full rounded-lg" />
                  </div>

                  <div className="mt-5">
                    <h2 className="text-xl font-bold text-slate-900">{book.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                    {book.format && <p className="mt-1 text-xs text-slate-400">{book.format}</p>}
                    {book.description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{book.description}</p>}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-black text-slate-900">{book.price.toLocaleString()}₫</span>
                      <Link href={`/books/${book.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
