import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
    const { pathname } = useLocation()
    const isAdmin = pathname === '/admin'

    return (
        <div className="min-h-screen bg-base">
            <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 px-4 py-3 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
                            <path d="M36 4L64 20V52L36 68L8 52V20L36 4Z" stroke="url(#navGrad)" strokeWidth="2" fill="url(#navFill)" />
                            <path d="M25 36L32 43L47 28" stroke="#00d4ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="navGrad" x1="8" y1="4" x2="64" y2="68" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#00d4ff" stopOpacity="0.9" />
                                    <stop offset="1" stopColor="#7c3aed" stopOpacity="0.7" />
                                </linearGradient>
                                <linearGradient id="navFill" x1="8" y1="4" x2="64" y2="68" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#00d4ff" stopOpacity="0.08" />
                                    <stop offset="1" stopColor="#7c3aed" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="font-bold text-white text-base tracking-tight group-hover:text-primary transition-colors">QuizBank</span>
                    </Link>
                    <Link
                        to="/admin"
                        className={`text-sm px-4 py-1.5 rounded-xl font-medium transition-all ${isAdmin
                                ? 'text-primary border border-primary/40 bg-primary/10'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        題庫管理
                    </Link>
                </div>
            </nav>
            <main className="max-w-2xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}
