export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <a href="/" className="text-sm text-zinc-300 hover:text-white">
            ← User site
          </a>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
