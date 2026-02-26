import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['全部', '投資型保險', '管理外匯條例', '外幣保險法規', '保險業辦理外匯業務']
const COUNT_OPTIONS = [10, 20, 30, 40]

export default function Home() {
  const [count, setCount]       = useState(20)
  const [category, setCategory] = useState('全部')
  const navigate = useNavigate()

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
        <div className="grid grid-cols-4 gap-2">
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`py-3 rounded-xl font-bold text-base border-2 transition-all ${
                count === n
                  ? 'border-accent bg-yellow-950 text-accent'
                  : 'border-slate-700 bg-surface text-slate-300 hover:border-slate-500'
              }`}
            >
              {n} 題
            </button>
          ))}
        </div>
      </div>

      {/* 分類選擇 */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-3 font-medium">分類</p>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                category === c
                  ? 'border-accent bg-yellow-950 text-accent'
                  : 'border-slate-700 bg-surface text-slate-300 hover:border-slate-500'
              }`}
            >
              {c === '全部' ? '🔀 全部分類' : `📂 ${c}`}
            </button>
          ))}
        </div>
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
