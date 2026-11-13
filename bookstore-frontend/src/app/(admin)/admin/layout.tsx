import Link from 'next/link';
import { Store } from 'lucide-react';
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f5fb] lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Bookly</p>
            <h1 className="text-lg font-bold text-slate-900">Hệ thống quản trị</h1>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Store size={16} /> Xem cửa hàng
          </Link>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
