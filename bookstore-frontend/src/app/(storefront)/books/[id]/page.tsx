'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, Store, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { BookCover } from '@/components/store/BookCover';
import api from '@/lib/axios';
import { BookType } from '@/types';

type BookDetail = BookType;

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [book, setBook] = useState<BookDetail | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookType[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isBuySheetOpen, setIsBuySheetOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/books/${params.id}`), api.get('/books')])
      .then(([bookResponse, booksResponse]) => {
        if (!active) return;
        setBook({
          ...bookResponse.data.data,
        });
        setSelectedImageIndex(0);
        setRelatedBooks(booksResponse.data.data.filter((item: BookType) => item.id !== params.id).slice(0, 3));
      })
      .catch(() => {
        if (active) setLoadError('This book could not be found.');
      });
    return () => { active = false; };
  }, [params.id]);

  const addCurrentBookToCart = () => {
    if (!book) return;
    addItem({ id: params.id, title: book.title, price: book.price, quantity, imageUrl: book.images?.[0]?.url });
    setIsCartDialogOpen(true);
  };

  const confirmPurchase = () => {
    if (!book) return;
    addCurrentBookToCart();
    router.push('/checkout');
  };

  if (!book) {
    return <div className="container py-16 text-center text-slate-600">{loadError || 'Loading book...'}</div>;
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="rounded-[30px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Home</span>
              <span>/</span>
              <span>Books</span>
              <span>/</span>
              <span className="text-slate-700">{book.title}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-[90px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
                {book.images?.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white ${selectedImageIndex === index ? 'border-slate-900' : 'border-slate-200'}`}
                  >
                    <BookCover title={book.title} imageUrl={image.url} className="h-full w-full" />
                  </button>
                ))}
              </div>

              <div className="order-1 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:order-2">
                <BookCover
                  title={book.title}
                  imageUrl={book.images?.[selectedImageIndex]?.url}
                  className="h-[500px] w-full rounded-[24px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
              <span className="mb-3 inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
              {book.category || 'Books'}
            </span>
            <h1 className="text-3xl font-black text-slate-900 md:text-5xl">{book.title}</h1>
            <p className="mt-3 text-lg text-slate-600">by {book.author}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900">{book.price.toLocaleString()}₫</span>
            </div>

            <div className="mt-5 flex items-center gap-3 text-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-emerald-600">Còn {book.stock} cuốn trong kho</span>
            </div>

            <div className="mt-6 space-y-2 text-base text-slate-600">
              <p>Nhà xuất bản: {book.publisher || 'Chưa cập nhật'}</p>
              <p>Năm xuất bản: {book.publication_year ?? 'Chưa cập nhật'}</p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity" className="h-12 w-12 text-xl font-medium text-slate-600">-</button>
                <span className="w-12 text-center text-base font-semibold text-slate-900">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(book.stock, value + 1))} aria-label="Increase quantity" className="h-12 w-12 text-xl font-medium text-slate-600">+</button>
              </div>

              <button onClick={addCurrentBookToCart} className="rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Add to cart
              </button>
              <button onClick={() => setIsBuySheetOpen(true)} className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                Buy now
              </button>
            </div>
            <div className="mt-8 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Format</p>
                <p className="mt-2 font-semibold text-slate-900">{book.format || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivery</p>
                <p className="mt-2 font-semibold text-slate-900">2-4 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[30px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Product description</h2>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Details
          </span>
        </div>

        <div className="space-y-5 text-base leading-8 text-slate-600">
          <p>
            {book.description?.trim() || 'Chưa có mô tả cho sản phẩm này.'}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">You may also like</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Related books</h2>
          </div>
          <a href="/books" className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline">
            Browse all
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {relatedBooks.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <BookCover title={item.title} imageUrl={item.images?.[0]?.url} className="h-48 rounded-[22px]" />

              <div className="mt-5">
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.author}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">{item.price.toLocaleString()}₫</span>
                  <a href={`/books/${item.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                    View
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {isBuySheetOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 md:items-center md:p-6" onClick={() => setIsBuySheetOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="buy-sheet-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative grid gap-6 p-5 sm:grid-cols-[minmax(180px,265px)_1fr] sm:items-center sm:p-7">
              <button onClick={() => setIsBuySheetOpen(false)} aria-label="Close" className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 transition hover:text-slate-900">
                <X size={24} />
              </button>
              <BookCover title={book.title} imageUrl={book.images?.[0]?.url} className="aspect-square rounded-2xl" />
              <div className="pr-8 sm:pr-6">
                <h2 id="buy-sheet-title" className="text-xl font-bold text-slate-900">{book.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                <div className="mt-5 flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-bold text-rose-600">{book.price.toLocaleString()}₫</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Kho: còn {book.stock} cuốn</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Store size={16} /> Bookly Store</p>
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-5 sm:px-7">
              <p className="mb-3 font-medium text-slate-900">Phiên bản</p>
              <div className="inline-flex items-center gap-3 rounded-lg border border-rose-500 px-3 py-2 text-sm text-rose-600">
                <span className="flex h-10 w-8 items-center justify-center rounded bg-slate-100 font-serif font-bold text-slate-700">{book.title.charAt(0)}</span>
                {book.format}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-5 sm:px-7">
              <span className="text-lg font-medium text-slate-900">Số lượng</span>
              <div className="flex h-11 items-center overflow-hidden rounded-lg border border-slate-200">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity" className="h-full w-11 text-slate-500 hover:bg-slate-50"><Minus size={16} className="mx-auto" /></button>
                <span className="flex h-full w-12 items-center justify-center border-x border-slate-200 text-rose-600">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(book.stock, value + 1))} aria-label="Increase quantity" className="h-full w-11 text-slate-500 hover:bg-slate-50"><Plus size={16} className="mx-auto" /></button>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 sm:px-7 sm:pb-6">
              <button onClick={confirmPurchase} className="w-full rounded-xl bg-[#ef4b2d] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#dc3f24]">
                Mua ngay
              </button>
            </div>
          </section>
        </div>
      )}

      {isCartDialogOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={() => setIsCartDialogOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-confirmation-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl sm:p-9"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setIsCartDialogOpen(false)}
              aria-label="Close confirmation"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <Check size={30} strokeWidth={2.5} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Đã thêm vào giỏ hàng</p>
            <h2 id="cart-confirmation-title" className="mt-2 text-2xl font-bold text-slate-900">Thêm thành công!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {quantity} cuốn <span className="font-semibold text-slate-700">{book.title}</span> đã được thêm vào giỏ hàng.
            </p>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <span className="text-slate-500">Thành tiền</span>
              <span className="font-bold text-slate-900">{(book.price * quantity).toLocaleString()}₫</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setIsCartDialogOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Xem giỏ hàng
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
