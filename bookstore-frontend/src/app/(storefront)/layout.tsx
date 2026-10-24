import Link from 'next/link';
import BookSearch from '@/components/store/BookSearch';
import AccountLink from '@/components/store/AccountLink';
import { ShoppingBag } from 'lucide-react';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f7f3]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="container py-5">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:flex-nowrap">
            <Link href="/" className="shrink-0 font-serif text-3xl font-bold leading-none text-slate-900">
              Bookly
            </Link>

            <div className="hidden min-w-48 max-w-md flex-1 md:block">
              <BookSearch />
            </div>

            <nav className="order-3 flex w-full items-center justify-center gap-7 text-sm font-medium text-slate-700 lg:order-none lg:ml-auto lg:w-auto">
              <Link href="/new-arrivals" className="transition hover:text-rose-600">New arrivals</Link>
              <Link href="/" className="transition hover:text-rose-600">Featured</Link>
              <Link href="/books" className="transition hover:text-rose-600">Books</Link>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-4 lg:ml-0">
              <Link href="/cart" aria-label="Cart" className="relative text-slate-700 transition hover:text-rose-600">
                <ShoppingBag size={20} />
              </Link>
              <AccountLink />
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <BookSearch />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-slate-900 text-slate-200">
        <div className="container grid gap-10 py-12 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900">
                B
              </div>
              <p className="text-lg font-black text-white">Bookly</p>
            </div>
            <p className="max-w-xs text-sm text-slate-400">
              Curated stories and practical reads for lifelong learners.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link href="/new-arrivals" className="hover:text-white">New arrivals</Link></li>
              <li><Link href="/books" className="hover:text-white">Best sellers</Link></li>
              <li><Link href="/books" className="hover:text-white">Featured books</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white">About us</Link></li>
              <li><Link href="/" className="hover:text-white">Contact</Link></li>
              <li><Link href="/" className="hover:text-white">Privacy policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link href="/checkout" className="hover:text-white">Shipping</Link></li>
              <li><Link href="/checkout" className="hover:text-white">Returns</Link></li>
              <li><Link href="/account" className="hover:text-white">Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-2 py-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Bookly. All rights reserved.</p>
            <p>Help readers grow one page at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
