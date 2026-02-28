import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../lib/api.js'

const COUNT_OPTIONS = [10, 20, 30, 40]

export default function Home() {
  const [count, setCount] = useState(20)
  const [category, setCategory] = useState('全部')
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCategories()
      .then(data => { setCategories(['全部', ...data]); setLoadingCats(false) })
      .catch(() => { setCategories(['全部']); setLoadingCats(false) })
  }, [])

  const [customCount, setCustomCount] = useState('')

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
    <div className="py-4">
      {/* 標題 */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest text-accent uppercase mb-2">考前衝刺</p>
        <h1 className="text-3xl font-black text-white">外幣保險練習</h1>
        <p className="text-slate-400 mt-2 text-sm">選擇題數與分類，開始隨機練習</p>
      </div>

      {/* 題數選擇 */}
      <div className="mb-6">
        <p className="text-slate-400 text-sm mb-3 font-medium">題數</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handlePresetCount(n)}
              className={`py-3 rounded-xl font-bold text-base border-2 transition-all ${count === n && !customCount
                ? 'border-accent bg-yellow-950 text-accent'
                : 'border-slate-700 bg-surface text-slate-300 hover:border-slate-500'
                }`}
            >
              {n} 題
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <label className="text-sm text-slate-400 whitespace-nowrap">自訂題數</label>
          <input
            type="number"
            min="1"
            max="999"
            placeholder="輸入任意題數…"
            value={customCount}
            onChange={e => handleCustomCount(e.target.value)}
            className={`flex-1 bg-surface border-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 focus:outline-none transition-all ${customCount ? 'border-accent text-accent bg-yellow-950' : 'border-slate-700 focus:border-slate-500'
              }`}
          />
          {customCount && <span className="text-accent text-sm font-bold whitespace-nowrap">{count} 題</span>}
        </div>
      </div>

      {/* 分類選擇 */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-3 font-medium">分類</p>
        {loadingCats ? (
          <p className="text-slate-500 text-sm text-center py-4">載入分類中…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${category === c
                  ? 'border-accent bg-yellow-950 text-accent'
                  : 'border-slate-700 bg-surface text-slate-300 hover:border-slate-500'
                  }`}
              >
                {c === '全部' ? '🔀 全部分類' : `📂 ${c}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 開始按鈕 */}
      <button
        onClick={start}
        className="w-full py-4 bg-accent text-black font-black text-lg rounded-xl hover:bg-yellow-400 transition-colors"
      >
        開始練習 →
      </button>
    </div>
  )
}
