import { useLocation, useNavigate } from 'react-router-dom'

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.questions) {
    navigate('/')
    return null
  }

  const { questions, answers } = state
  const score = answers.filter(a => a.selected === a.correct).length
  const pct = Math.round((score / questions.length) * 100)

  const grade = pct >= 80 ? { emoji: '🏆', msg: '表現優秀！繼續保持', color: 'text-correct', ring: 'from-correct to-emerald-400' }
    : pct >= 60 ? { emoji: '👍', msg: '不錯喔，再加把勁！', color: 'text-accent', ring: 'from-accent to-yellow-300' }
      : { emoji: '💪', msg: '多練習，你可以的！', color: 'text-wrong', ring: 'from-wrong to-red-400' }

  return (
    <div className="fadeIn pb-8">
      {/* 成績視覺化 */}
      <div className="text-center mb-8 pt-4">
        <div className="inline-flex items-center justify-center relative mb-4">
          {/* 環形圓 */}
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="58"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={pct >= 80 ? '#18b566' : pct >= 60 ? '#ffcd1f' : '#ea4b4b'} />
                <stop offset="100%" stopColor={pct >= 80 ? '#6ee7b7' : pct >= 60 ? '#fde68a' : '#fca5a5'} />
              </linearGradient>
            </defs>
          </svg>
          {/* 中心文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl">{grade.emoji}</span>
            <span className={`text-4xl font-black ${grade.color}`}>{pct}%</span>
            <span className="text-slate-500 text-xs">{score}/{questions.length}</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">測驗完成！</h2>
        <p className={`font-semibold ${grade.color}`}>{grade.msg}</p>

        {/* 統計列 */}
        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center">
            <div className="text-2xl font-black text-correct">{score}</div>
            <div className="text-xs text-slate-500">答對</div>
          </div>
          <div className="w-px bg-white/8" />
          <div className="text-center">
            <div className="text-2xl font-black text-wrong">{questions.length - score}</div>
            <div className="text-xs text-slate-500">答錯</div>
          </div>
          <div className="w-px bg-white/8" />
          <div className="text-center">
            <div className="text-2xl font-black text-slate-300">{questions.length}</div>
            <div className="text-xs text-slate-500">總題數</div>
          </div>
        </div>
      </div>

      {/* 逐題回顧標題 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-slate-200 text-sm">逐題回顧</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* 逐題列表 */}
      <div className="flex flex-col gap-2.5 mb-7">
        {questions.map((q, i) => {
          const a = answers[i]
          const ok = a?.selected === a?.correct
          const opts = [q.option_1, q.option_2, q.option_3, q.option_4]

          return (
            <div
              key={i}
              className={`rounded-2xl p-4 border-2 transition-all ${ok
                  ? 'border-correct/25 bg-correct/8'
                  : 'border-wrong/25 bg-wrong/8'
                }`}
            >
              <div className="flex gap-2.5 items-start">
                <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${ok ? 'bg-correct text-white' : 'bg-wrong text-white'
                  }`}>
                  {ok ? '✓' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-2 mb-2">
                    Q{i + 1}. {q.question}
                  </p>
                  {!ok && a && (
                    <p className="text-xs text-wrong ml-0 mb-1">
                      ❌ 你的答案：{opts[a.selected]}
                    </p>
                  )}
                  <p className={`text-xs font-medium ${ok ? 'text-correct' : 'text-correct'}`}>
                    ✓ 正確答案：{opts[q.answer - 1]}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 按鈕 */}
      <div className="flex gap-3 sticky bottom-0 pb-2 pt-2 bg-gradient-to-t from-base/90 to-transparent">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3.5 border-2 border-white/12 text-slate-300 rounded-2xl font-bold hover:border-white/25 hover:text-white transition-all active:scale-[0.98]"
        >
          回首頁
        </button>
        <button
          onClick={() => navigate('/quiz', { state: { count: questions.length, category: '' } })}
          className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-[0.98]"
        >
          🔄 再練一次
        </button>
      </div>
    </div>
  )
}
