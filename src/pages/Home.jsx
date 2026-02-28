import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../lib/api.js'

const COUNT_OPTIONS = [10, 20, 30, 40]

// Tech-style logo SVG: circuit-board checkmark / quiz brain
function TechLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_18px_rgba(0,212,255,0.6)]">
      {/* Outer hexagon glow ring */}
      <path
        d="M36 4L64 20V52L36 68L8 52V20L36 4Z"
        fill="url(#hexGrad)"
        opacity="0.15"
      />
      <path
        d="M36 4L64 20V52L36 68L8 52V20L36 4Z"
        stroke="url(#strokeGrad)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner hexagon */}
      <path
        d="M36 14L56 25V47L36 58L16 47V25L36 14Z"
        fill="url(#innerGrad)"
        opacity="0.5"
      />
      {/* Circuit dots */}
      <circle cx="36" cy="14" r="2.5" fill="#00d4ff" opacity="0.9" />
      <circle cx="56" cy="25" r="2.5" fill="#00d4ff" opacity="0.7" />
      <circle cx="56" cy="47" r="2.5" fill="#00d4ff" opacity="0.7" />
      <circle cx="36" cy="58" r="2.5" fill="#00d4ff" opacity="0.9" />
      <circle cx="16" cy="47" r="2.5" fill="#00d4ff" opacity="0.7" />
      <circle cx="16" cy="25" r="2.5" fill="#00d4ff" opacity="0.7" />
      {/* Central checkmark / quiz icon */}
      <path
        d="M25 36L32 43L47 28"
        stroke="url(#checkGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small circuit lines */}
      <line x1="36" y1="14" x2="36" y2="20" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
      <line x1="36" y1="52" x2="36" y2="58" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
      <line x1="56" y1="25" x2="51" y2="28" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
      <line x1="16" y1="25" x2="21" y2="28" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />

      <defs>
        <linearGradient id="hexGrad" x1="8" y1="4" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="8" y1="4" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="16" y1="14" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0d1a2e" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="checkGrad" x1="25" y1="36" x2="47" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Home() {
  const [count, setCount] = useState(20)
  const [customCount, setCustomCount] = useState('')
  const [category, setCategory] = useState('全部')
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCategories()
      .then(data => { setCategories(['全部', ...data]); setLoadingCats(false) })
      .catch(() => { setCategories(['全部']); setLoadingCats(false) })
  }, [])

  const handleCustomCount = (val) => {
    const n = parseInt(val)
    setCustomCount(val)
    if (!isNaN(n) && n > 0) setCount(n)
  }

  const handlePresetCount = (n) => {
    setCount(n)
    setCustomCount('')
  }

  const start = () => navigate('/quiz', { state: { count, category } })

  return (
    <div className="py-2 fadeIn">
      {/* 頁首 */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-5 pop-in">
          <TechLogo />
        </div>
        <p className="text-xs tracking-[0.3em] text-primary/60 uppercase font-semibold mb-2">考前衝刺</p>
        <h1 className="text-4xl font-black text-white leading-tight">外幣保險練習</h1>
        <p className="text-slate-400 mt-3 text-base">選擇題數與分類，開始隨機練習</p>
      </div>

      {/* 題數 */}
      <div className="mb-7">
        <p className="text-slate-300 text-sm mb-3 font-semibold flex items-center gap-2">
          <span className="text-primary">◈</span> 選擇題數
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handlePresetCount(n)}
              className={`py-3.5 rounded-2xl font-bold text-base border transition-all duration-200 active:scale-95 ${count === n && !customCount
                  ? 'border-primary/60 bg-primary/10 text-primary shadow-[0_0_16px_rgba(0,212,255,0.25)]'
                  : 'border-white/8 bg-surface text-slate-300 hover:border-primary/30 hover:bg-primary/5'
                }`}
            >
              {n}題
            </button>
          ))}
        </div>
        {/* 自訂題數 */}
        <div className="flex items-center gap-3 bg-surface border border-white/8 rounded-2xl px-4 py-3">
          <span className="text-primary text-xs shrink-0 font-mono">自訂</span>
          <input
            type="number"
            min="1" max="999"
            placeholder="輸入任意題數…"
            value={customCount}
            onChange={e => handleCustomCount(e.target.value)}
            className={`flex-1 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-slate-700 transition-all ${customCount ? 'text-primary' : ''}`}
          />
          {customCount && <span className="text-primary text-sm font-bold shrink-0 font-mono">{count}題</span>}
        </div>
      </div>

      {/* 分類 */}
      <div className="mb-8">
        <p className="text-slate-300 text-sm mb-3 font-semibold flex items-center gap-2">
          <span className="text-primary">◈</span> 選擇題本
        </p>
        {loadingCats ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-surface/70 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border transition-all duration-200 text-sm font-medium flex items-center gap-3 active:scale-[0.99] ${category === c
                    ? 'border-primary/50 bg-primary/10 text-white shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                    : 'border-white/6 bg-surface text-slate-400 hover:border-primary/25 hover:bg-primary/5 hover:text-slate-200'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${category === c ? 'bg-primary shadow-[0_0_6px_rgba(0,212,255,0.8)]' : 'bg-slate-700'}`} />
                <span className="flex-1">{c === '全部' ? '全部分類' : c}</span>
                {category === c && <span className="text-primary text-sm">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 開始按鈕 */}
      <button
        onClick={start}
        className="w-full py-4 text-base font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-black"
        style={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #0095b3 100%)',
          boxShadow: '0 4px 24px rgba(0,212,255,0.35)'
        }}
      >
        開始練習
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
