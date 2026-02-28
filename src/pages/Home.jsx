import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../lib/api.js'

const COUNT_OPTIONS = [10, 20, 30, 40]

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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/40 mb-4 pop-in">
          <span className="text-3xl font-black text-white">Q</span>
        </div>
        <p className="text-xs tracking-[0.25em] text-primary/70 uppercase font-semibold mb-1">考前衝刺</p>
        <h1 className="text-3xl font-black text-white">外幣保險練習</h1>
        <p className="text-slate-400 mt-2 text-sm">選擇題數與分類，開始隨機練習</p>
      </div>

      {/* 題數 */}
      <div className="mb-7">
        <p className="text-slate-300 text-sm mb-3 font-semibold">📝 選擇題數</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handlePresetCount(n)}
              className={`py-3 rounded-2xl font-bold text-base border-2 transition-all duration-200 active:scale-95 ${count === n && !customCount
                  ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20'
                  : 'border-white/10 bg-surface text-slate-300 hover:border-primary/40 hover:bg-primary/10'
                }`}
            >
              {n}題
            </button>
          ))}
        </div>
        {/* 自訂題數 */}
        <div className="flex items-center gap-3 bg-surface border border-white/10 rounded-2xl px-4 py-2.5">
          <span className="text-slate-500 text-sm shrink-0">自訂</span>
          <input
            type="number"
            min="1" max="999"
            placeholder="輸入任意題數…"
            value={customCount}
            onChange={e => handleCustomCount(e.target.value)}
            className={`flex-1 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-slate-600 transition-all ${customCount ? 'text-primary' : ''
              }`}
          />
          {customCount && <span className="text-primary text-sm font-bold shrink-0">{count} 題</span>}
        </div>
      </div>

      {/* 分類 */}
      <div className="mb-8">
        <p className="text-slate-300 text-sm mb-3 font-semibold">📂 選擇題本</p>
        {loadingCats ? (
          <div className="flex gap-2 justify-center py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 w-24 bg-surface/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-sm font-medium flex items-center gap-3 active:scale-[0.98] ${category === c
                    ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/15'
                    : 'border-white/8 bg-surface text-slate-300 hover:border-primary/35 hover:bg-primary/10 hover:text-white'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${category === c ? 'bg-primary' : 'bg-slate-600'}`} />
                {c === '全部' ? '🔀 全部分類' : c}
                {category === c && (
                  <span className="ml-auto text-primary text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 開始按鈕 */}
      <button
        onClick={start}
        className="w-full py-4 bg-primary text-white font-black text-lg rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        開始練習
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
