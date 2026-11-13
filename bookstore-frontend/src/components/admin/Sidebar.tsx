'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, PackageCheck, UsersRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const links = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/books', label: 'Quản lý sách', icon: BookOpen },
  { href: '/admin/users', label: 'Tài khoản', icon: UsersRound },
  { href: '/admin/orders', label: 'Đơn hàng', icon: PackageCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="z-20 w-full shrink-0 border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-col lg:border-b-0 lg:border-r">
      <Link href="/" className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><BookOpen size={19} /></span>
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Nhà sách</span>
          <span className="block text-lg font-black leading-tight text-slate-900">Bookly</span>
        </span>
      </Link>

      <nav aria-label="Điều hướng quản trị" className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-3 border-t border-slate-200 p-4 lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {(user?.full_name || 'A').charAt(0).toLocaleUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{user?.full_name || 'Quản trị viên'}</span>
          <span className="block text-xs text-slate-500">Quản trị viên</span>
        </span>
        <button
          type="button"
          aria-label="Đăng xuất"
          title="Đăng xuất"
          onClick={() => { logout(); router.replace('/login'); }}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
