'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookCover } from '@/components/store/BookCover';
import api from '@/lib/axios';
import { BookType } from '@/types';

const features = [
  { title: 'Fast delivery', text: 'Free shipping for orders above 500k' },
  { title: 'Secure payment', text: 'Safe checkout with multiple methods' },
  { title: 'Curated picks', text: 'Books selected by expert editors' },
];

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    api.get('/books', { params: { sort: 'newest' } })
      .then((response) => {
        const books: BookType[] = response.data.data;
        setFeaturedBooks(books.slice(0, 4));
        setCategories(Array.from(new Set(books.map((book) => book.category).filter((category): category is string => Boolean(category)))).sort((a, b) => a.localeCompare(b, 'vi')));
      })
      .catch(() => setFeaturedBooks([]));
  }, []);

  return (
    <div className="bg-[#f9f7f3] text-slate-900">
      <section className="container py-12 md:py-16">
        <div className="grid items-center gap-10 rounded-[32px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
              New arrivals
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Discover books that change your life.
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-300 md:text-lg">
              Explore bestselling novels, thoughtful self-growth titles, and timeless reads chosen for curious minds.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/books"
                className="rounded-full bg-[#f4c77d] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f0b85d]"
              >
                Shop now
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>

          </div>

          <div className="relative flex justify-center">
            {featuredBooks[0] ? (
              <div className="w-full max-w-md bg-white p-5 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between gap-3 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Recently added</span>
                  <span>{featuredBooks[0].category || 'Book'}</span>
                </div>
                <BookCover title={featuredBooks[0].title} imageUrl={featuredBooks[0].images?.[0]?.url} className="h-64 w-full" />
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{featuredBooks[0].author}</p>
                    <h3 className="mt-1 text-2xl font-bold">{featuredBooks[0].title}</h3>
                  </div>
                  <span className="shrink-0 text-lg font-extrabold text-slate-900">{featuredBooks[0].price.toLocaleString()}₫</span>
                </div>
                <Link href={`/books/${featuredBooks[0].id}`} className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4">View book</Link>
              </div>
            ) : (
              <Link href="/books" className="flex min-h-64 w-full max-w-md items-center justify-center border border-white/20 text-sm font-semibold text-white underline underline-offset-4">Browse the catalog</Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Curated selection</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">New on the shelves</h2>
            </div>
            <Link href="/books" className="inline-flex items-center text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
              Browse all books
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredBooks.map((book) => (
              <article key={book.id} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 overflow-hidden rounded-[22px]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
                      {book.category || 'New arrival'}
                    </span>
                  </div>
                  <BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="mt-2 h-48 w-full" />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{book.title}</h3>
                    <p className="text-sm text-slate-500">{book.author}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{book.price.toLocaleString()}₫</span>
                    <Link
                      href={`/books/${book.id}`}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Browse by interest</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Find your next favorite topic</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {categories.map((category, index) => (
            <div
              key={category}
              className="rounded-[22px] border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-amber-200 hover:shadow-md"
              style={{
                background: index % 2 === 0 ? 'linear-gradient(135deg, #fff8ea 0%, #ffffff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f3f6ff 100%)',
              }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                {category.slice(0, 1)}
              </div>
              <p className="text-base font-semibold text-slate-800">{category}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Why readers choose us</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">A better way to shop for books</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[26px] border border-slate-200 bg-[#faf8f4] p-7 text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e7bf] text-xl">✓</div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-[30px] bg-slate-900 px-6 py-10 text-white md:px-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Stay in the loop</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Get weekly book recommendations</h2>
          </div>
          <div className="mt-6 flex w-full max-w-xl gap-3 lg:mt-0">
            <input
              type="email"
              placeholder="Your email address"
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-slate-300 outline-none ring-0"
            />
            <button className="rounded-full bg-[#f4c77d] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f0b85d]">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
