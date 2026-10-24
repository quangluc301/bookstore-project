export function Sidebar() {
  return (
    <aside className="bg-slate-900 p-6 text-white">
      <h2 className="text-xl font-bold">Admin</h2>
      <nav className="mt-6 space-y-2">
        <div className="rounded bg-slate-800 px-3 py-2">Dashboard</div>
        <div className="rounded px-3 py-2 hover:bg-slate-800">Books</div>
        <div className="rounded px-3 py-2 hover:bg-slate-800">Orders</div>
      </nav>
    </aside>
  );
}
