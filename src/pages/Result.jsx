import { useLocation, useNavigate } from 'react-router-dom'

export default function Result() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  if (!state?.questions) {
    navigate('/')
    return null
  }

  const { questions, answers } = state
  const score = answers.filter(a => a.selected === a.correct).length
  const pct   = Math.round((score / questions.length) * 100)

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'
  const msg   = pct >= 80 ? '表現優秀！繼續保持' : pct >= 60 ? '還不錯，再加把勁！' : '多加練習，你可以的！'

  return (
    <div>
      {/* 成績卡 */}
      <div className="bg-surface border border-slate-700 rounded-2xl p-8 text-center mb-6">
        <div className="text-5xl mb-3">{emoji}</div>
        <p className="text-xs tracking-widest text-slate-400 uppercase mb-2">測驗完成</p>
        <div className="text-6xl font-black text-accent leading-none">{score}</div>
        <div className="text-slate-400 mt-1 mb-3">/ {questions.length} 題正確</div>
        <div className={`text-3xl font-bold ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-accent' : 'text-red-400'}`}>
          {pct}%
        </div>
        <p className="text-slate-400 text-sm mt-2">{msg}</p>
      </div>

      {/* 逐題回顧 */}
      <div className="flex flex-col gap-3 mb-6">
        {questions.map((q, i) => {
          const a  = answers[i]
          const ok = a?.selected === a?.correct
          const opts = [q.option_1, q.option_2, q.option_3, q.option_4]
          return (
            <div
              key={i}
              className={`rounded-xl p-4 border ${ok ? 'border-green-800 bg-green-950/30' : 'border-red-800 bg-red-950/30'}`}
            >
              <div className="flex gap-2 items-start mb-2">
                <span>{ok ? '✅' : '❌'}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{q.question.slice(0, 60)}…</p>
              </div>
              {!ok && (
                <p className="text-xs text-red-400 ml-6">
                  你的答案：{a ? opts[a.selected] : '未作答'}
                </p>
              )}
              <p className="text-xs text-green-400 ml-6">
                正確答案：{opts[q.answer - 1]}
              </p>
            </div>
          )
        })}
      </div>

      {/* 按鈕 */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 border-2 border-slate-600 text-slate-300 rounded-xl font-bold hover:border-slate-400 transition-all"
        >
          回首頁
        </button>
        <button
          onClick={() => navigate('/quiz', { state: { count: questions.length, category: '' } })}
          className="flex-1 py-3 bg-accent text-black rounded-xl font-bold hover:bg-yellow-400 transition-all"
        >
          🔄 再練一次
        </button>
      </div>
    </div>
  )
}
