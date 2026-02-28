import { useLocation, useNavigate } from 'react-router-dom'

const LABELS = ['A', 'B', 'C', 'D']

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

    const gradeColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#facc15' : '#f43f5e'
    const gradeEmoji = pct >= 80 ? 'trophy' : pct >= 60 ? 'ok' : 'muscle'
    const gradeMsg = pct >= 80 ? 'top' : pct >= 60 ? 'good' : 'try'
    const gradeMsgText = pct >= 80 ? 'excellent' : pct >= 60 ? 'almost' : 'keep_trying'

    const MSGS = { top: '表現優秀！繼續保持', good: '不錯喔，再加把勁！', try: '多練習，你可以的！' }
    const EMOJIS = { trophy: '🏆', ok: '👍', muscle: '💪' }

    const circumference = 2 * Math.PI * 54

    return (
        <div className="fadeIn pb-8">
            <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center relative mb-5">
                    <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="72" cy="72" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle
                            cx="72" cy="72" r="54"
                            fill="none"
                            stroke={gradeColor}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - pct / 100)}
                            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)', filter: 'drop-shadow(0 0 8px ' + gradeColor + '88)' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '28px', marginBottom: '2px' }}>{EMOJIS[gradeEmoji]}</span>
                        <span style={{ fontSize: '36px', fontWeight: 900, color: gradeColor }}>{pct}%</span>
                        <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{score}/{questions.length} 題</span>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-1">測驗完成！</h2>
                <p className="font-semibold" style={{ color: gradeColor }}>{MSGS[gradeMsg]}</p>

                <div className="flex justify-center gap-8 mt-5 py-4 border-y border-white/6">
                    <div className="text-center">
                        <div className="text-2xl font-black text-correct">{score}</div>
                        <div className="text-xs text-slate-500 mt-0.5">答對</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-wrong">{questions.length - score}</div>
                        <div className="text-xs text-slate-500 mt-0.5">答錯</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-300">{questions.length}</div>
                        <div className="text-xs text-slate-500 mt-0.5">總題數</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-slate-200 text-sm">逐題回顧</span>
                <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="flex flex-col gap-2.5 mb-28">
                {questions.map((q, i) => {
                    const a = answers[i]
                    const ok = a?.selected === a?.correct
                    const opts = [q.option_1, q.option_2, q.option_3, q.option_4]

                    return (
                        <div
                            key={i}
                            className={`rounded-2xl p-4 border ${ok ? 'border-correct/20 bg-correct/6' : 'border-wrong/20 bg-wrong/6'}`}
                        >
                            <div className="flex gap-3 items-start">
                                <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${ok ? 'bg-correct text-white' : 'bg-wrong text-white'}`}>
                                    {ok ? '✓' : '✗'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 leading-relaxed line-clamp-2 mb-2">
                                        Q{i + 1}. {q.question}
                                    </p>
                                    {!ok && a && (
                                        <p className="text-xs text-wrong mb-1">
                                            ✗ 你的答案：{LABELS[a.selected]}. {opts[a.selected]}
                                        </p>
                                    )}
                                    <p className="text-xs text-correct font-medium">
                                        ✓ 正確答案：{LABELS[q.answer - 1]}. {opts[q.answer - 1]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-4 bg-gradient-to-t from-base via-base/95 to-transparent">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3.5 border border-white/10 text-slate-300 rounded-2xl font-bold hover:border-white/25 hover:text-white transition-all"
                    >
                        回首頁
                    </button>
                    <button
                        onClick={() => navigate('/quiz', { state: { count: questions.length, category: '' } })}
                        className="flex-1 py-3.5 text-black font-bold rounded-2xl"
                        style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0095b3 100%)', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
                    >
                        再練一次
                    </button>
                </div>
            </div>
        </div>
    )
}
