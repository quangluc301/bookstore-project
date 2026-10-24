'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BookCover } from '@/components/store/BookCover';
import api from '@/lib/axios';
import { BookType } from '@/types';

export default function NewArrivalsPage() {
  const [arrivals, setArrivals] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    api.get('/books/new-arrivals')
      .then((response) => setArrivals(response.data.data))
      .catch(() => setArrivals([]))
      .finally(() => setIsLoading(false));
  }, []);

  const featured = arrivals[0];

  if (isLoading) return <div className="container py-16 text-center text-slate-600">Loading new arrivals...</div>;
  if (!featured) return <div className="container py-16 text-center text-slate-600">No new arrivals are available right now.</div>;

  return (
    <div className="bg-[#fbfaf7] text-slate-900">
      <section className="border-b border-[#d9e3dc] bg-[#edf2ee]">
        <div className="container grid gap-10 py-12 md:grid-cols-[1fr_0.8fr] md:items-center md:py-16">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#426c56]">
              <span className="h-2 w-2 rounded-full bg-[#e56b4a]" /> The latest shelf
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.05] md:text-6xl">New reads. New ways of seeing.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Sách mới được thêm gần đây, sắp xếp theo thời điểm cập nhật trong cửa hàng.
            </p>
            <a href="#latest" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#315c45] underline underline-offset-4">
              Meet the latest arrivals <ArrowDownRight size={17} />
            </a>
          </div>

          <div className="relative mx-auto flex min-h-[270px] w-full max-w-md items-center justify-center overflow-hidden rounded-[4px] bg-[#315c45] p-8 text-white md:min-h-[320px]">
            <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full border border-white/20" />
            <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full border border-white/20" />
            <div className="relative flex w-full items-center gap-7">
              <BookCover title={featured.title} imageUrl={featured.images?.[0]?.url} className="h-48 w-32 shrink-0 shadow-2xl" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8e8df]">Mới cập nhật</p>
                <p className="mt-3 font-serif text-3xl">{featured.title}</p>
                <p className="mt-2 text-sm text-white/75">{featured.author}</p>
                <Link href={`/books/${featured.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#f1c59b]">
                  Discover the book <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="latest" className="container py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#bd573b]">Recently added</p>
            <h2 className="mt-2 font-serif text-3xl">Fresh on the shelves</h2>
          </div>
          <p className="text-sm text-slate-500">A short list, updated as new titles arrive.</p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {arrivals.map((book, index) => (
            <article key={book.id} className="grid gap-5 py-6 sm:grid-cols-[56px_100px_minmax(0,1fr)_auto] sm:items-center sm:gap-7">
              <span className="font-serif text-2xl text-[#bd573b]">{String(index + 1).padStart(2, '0')}</span>
              <BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="h-28 w-full max-w-[100px]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#bd573b]">{book.category || 'New arrival'}</p>
                <h3 className="mt-1 font-serif text-2xl">{book.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                {book.publisher && <p className="mt-2 text-sm text-slate-600">Nhà xuất bản: {book.publisher}</p>}
                {book.description && <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{book.description}</p>}
              </div>
              <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                <span className="text-sm font-bold">{book.price.toLocaleString()}₫</span>
                <Link href={`/books/${book.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#315c45] hover:underline">
                  View title <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-l-4 border-[#e56b4a] bg-[#f2eee5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-serif text-xl">Still looking for something else?</p>
            <p className="mt-1 text-sm text-slate-600">Browse the complete catalog by title, author, or category.</p>
          </div>
          <Link href="/books" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-slate-900 underline underline-offset-4">
            Explore all books <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}