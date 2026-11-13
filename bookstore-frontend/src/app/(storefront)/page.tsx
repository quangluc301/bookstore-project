'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookCover } from '@/components/store/BookCover';
import api from '@/lib/axios';
import { BookType } from '@/types';
import { formatPrice } from '@/lib/utils';

const features = [
  { title: 'Giao hàng nhanh', text: 'Miễn phí giao hàng cho đơn từ 500.000₫' },
  { title: 'Thanh toán an toàn', text: 'Quy trình thanh toán an toàn, tiện lợi' },
  { title: 'Sách được chọn lọc', text: 'Tựa sách được tuyển chọn kỹ lưỡng' },
];

type BestSellerBook = BookType & { sold_count: number };
type BestSellerGroup = { category: string; books: BestSellerBook[] };

export default function HomePage() {
  const [bestSellerGroups, setBestSellerGroups] = useState<BestSellerGroup[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const featuredBooks = bestSellerGroups.flatMap((group) => group.books);
  const featuredBook = featuredBooks[0];

  useEffect(() => {
    api.get('/books/best-sellers')
      .then((response) => {
        const groups: BestSellerGroup[] = response.data.data;
        setBestSellerGroups(groups);
        setCategories(groups.map((group) => group.category));
      })
      .catch(() => {
        setBestSellerGroups([]);
        setCategories([]);
      });
  }, []);

  return (
    <div className="bg-[#f9f7f3] text-slate-900">
      <section className="container py-12 md:py-16">
        <div className="grid items-center gap-10 rounded-[32px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
              Sách bán chạy
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Những cuốn sách được bạn đọc yêu thích nhất.
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-300 md:text-lg">
              Khám phá sách nổi bật theo từng thể loại, xếp hạng dựa trên số lượng đã bán.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/books"
                className="rounded-full bg-[#f4c77d] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f0b85d]"
              >
                Khám phá sách
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Đăng nhập
              </Link>
            </div>

          </div>

          <div className="relative flex justify-center">
            {featuredBook ? (
              <div className="w-full max-w-md bg-white p-5 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between gap-3 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Bán chạy nhất</span>
                  <span>{featuredBook.category || 'Sách'}</span>
                </div>
                <BookCover title={featuredBook.title} imageUrl={featuredBook.images?.[0]?.url} className="h-64 w-full" />
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{featuredBook.author}</p>
                    <h3 className="mt-1 text-2xl font-bold">{featuredBook.title}</h3>
                  </div>
                  <span className="shrink-0 text-lg font-extrabold text-slate-900">{formatPrice(featuredBook.price)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Đã bán {featuredBook.sold_count} cuốn</p>
                <Link href={`/books/${featuredBook.id}`} className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4">Xem sách</Link>
              </div>
            ) : (
              <Link href="/books" className="flex min-h-64 w-full max-w-md items-center justify-center border border-white/20 text-sm font-semibold text-white underline underline-offset-4">Khám phá danh mục sách</Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Được bạn đọc lựa chọn</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">Bán chạy theo thể loại</h2>
            </div>
            <Link href="/books" className="inline-flex items-center text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
              Khám phá tất cả sách
            </Link>
          </div>

          <div className="space-y-10">
            {bestSellerGroups.map((group) => (
              <section key={group.category} aria-label={`Sách bán chạy thể loại ${group.category}`}>
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <h3 className="text-xl font-bold text-slate-900">{group.category}</h3>
                  <span className="text-sm text-slate-500">Top {group.books.length} sách bán chạy</span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.books.map((book) => (
                    <article key={book.id} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-4 overflow-hidden rounded-[22px]">
                        <BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="mt-3 h-48 w-full" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{book.title}</h4>
                          <p className="text-sm text-slate-500">{book.author}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-slate-900">{formatPrice(book.price)}</span>
                          <Link href={`/books/${book.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                            Xem sách
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            {bestSellerGroups.length === 0 && (
              <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                Chưa có dữ liệu bán hàng để xếp hạng sách theo thể loại.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Khám phá theo sở thích</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Chủ đề bạn yêu thích tiếp theo</h2>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Vì sao bạn đọc chọn Bookly</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Mua sách dễ dàng, chọn sách an tâm</h2>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Đừng bỏ lỡ tin mới</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Nhận gợi ý sách mỗi tuần</h2>
          </div>
          <div className="mt-6 flex w-full max-w-xl gap-3 lg:mt-0">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-slate-300 outline-none ring-0"
            />
            <button className="rounded-full bg-[#f4c77d] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f0b85d]">
              Đăng ký nhận tin
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
