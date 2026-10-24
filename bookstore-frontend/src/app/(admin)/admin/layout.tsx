import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/books', label: 'Books' },
  { href: '/admin/orders', label: 'Orders' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-72 bg-slate-900 p-6 text-white">
        <h1 className="text-2xl font-bold">Bookstore Admin</h1>
        <nav className="mt-8 space-y-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded px-3 py-2 hover:bg-slate-800">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Administration</h2>
          <Link href="/" className="rounded bg-slate-900 px-4 py-2 text-white">View storefront</Link>
        </div>
        {children}
      </main>
    </div>
  );
}
