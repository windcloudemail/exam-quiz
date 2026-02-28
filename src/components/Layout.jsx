import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  const isQuiz = pathname === '/quiz' || pathname === '/result'

  return (
    <div className="min-h-screen bg-base">
      {/* 導覽列 */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform">
              Q
            </div>
            <span className="font-bold text-white text-base tracking-tight">QuizBank</span>
          </Link>
          <Link
            to="/admin"
            className={`text-sm px-4 py-1.5 rounded-xl font-medium transition-all ${isAdmin
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            題庫管理
          </Link>
        </div>
      </nav>

      {/* 頁面內容 */}
      <main className={`max-w-2xl mx-auto px-4 ${isQuiz ? 'py-4' : 'py-8'}`}>
        <Outlet />
      </main>
    </div>
  )
}
