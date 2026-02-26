import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-base">
      {/* 導覽列 */}
      <nav className="bg-surface border-b border-slate-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-accent text-lg tracking-wide">
            📋 外幣保險練習
          </Link>
          <Link
            to="/admin"
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              pathname === '/admin'
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            題庫管理
          </Link>
        </div>
      </nav>

      {/* 頁面內容 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
