import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRandomQuestions } from '../lib/api.js'
import QuestionCard from '../components/QuestionCard.jsx'
import OptionButton from '../components/OptionButton.jsx'
import ExplanationBox from '../components/ExplanationBox.jsx'

export default function Quiz() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const count = state?.count ?? 20
  const category = state?.category ?? ''

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getRandomQuestions(count, category === '全部' ? '' : category)
      .then(data => { setQuestions(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">載入題目中…</p>
    </div>
  )

  if (error) return (
    <div className="text-center py-16 fadeIn">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-slate-300 mb-6">{error}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
        返回首頁
      </button>
    </div>
  )

  if (questions.length === 0) return (
    <div className="text-center py-16 fadeIn">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-slate-300 mb-6">此分類尚無題目</p>
      <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
        返回首頁
      </button>
    </div>
  )

  const q = questions[current]
  const opts = [q.option_1, q.option_2, q.option_3, q.option_4]
  const correctIdx = q.answer - 1
  const isCorrect = selected === correctIdx

  const handleSelect = (idx) => {
    if (revealed) return
    setSelected(idx)
  }

  const handleReveal = () => {
    if (selected === null) return
    setRevealed(true)
    setAnswers(prev => [...prev, { questionId: q.id, selected, correct: correctIdx }])
  }

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      navigate('/result', { state: { questions, answers: [...answers] } })
    }
  }

  const getOptionState = (idx) => {
    if (!revealed) return selected === idx ? 'selected' : 'default'
    if (idx === correctIdx) return 'correct'
    if (idx === selected && !isCorrect) return 'wrong'
    return 'disabled'
  }

  const progress = Math.round(((current) / questions.length) * 100)
  const isLast = current + 1 === questions.length

  return (
    <div className="fadeIn">
      {/* 頂部進度區 */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/')}
          className="shrink-0 w-9 h-9 rounded-xl bg-surface border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center"
          title="回首頁"
        >
          ✕
        </button>
        <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-slate-400 text-xs font-semibold">{current}/{questions.length}</span>
      </div>

      {/* 題目 */}
      <QuestionCard
        current={current + 1}
        total={questions.length}
        question={q.question}
        question_part2={q.question_part2}
      />

      {/* 選項 */}
      <div className="flex flex-col gap-2.5 mb-4">
        {opts.map((opt, idx) => (
          <OptionButton
            key={idx}
            index={idx}
            text={opt}
            state={getOptionState(idx)}
            onClick={() => handleSelect(idx)}
          />
        ))}
      </div>

      {/* 解說 */}
      {revealed && (
        <ExplanationBox isCorrect={isCorrect} explanation={q.explanation} />
      )}

      {/* 操作按鈕 */}
      <div className="mt-5">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${selected !== null
                ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30 active:scale-[0.98]'
                : 'bg-surface text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
          >
            確認答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-primary text-white font-bold text-base rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLast ? (
              <>查看結果 <span className="text-accent">🏁</span></>
            ) : (
              <>下一題
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* 題號快速導覽 */}
      <div className="flex flex-wrap gap-1.5 mt-6 justify-center">
        {questions.map((_, i) => {
          const ans = answers[i]
          const isDone = i < current
          const ok = ans && ans.selected === ans.correct

          return (
            <div
              key={i}
              className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-bold transition-all ${i === current
                  ? 'bg-primary text-white shadow-md shadow-primary/40 scale-110'
                  : isDone
                    ? ok
                      ? 'bg-correct/20 text-correct border border-correct/30'
                      : 'bg-wrong/20 text-wrong border border-wrong/30'
                    : 'bg-surface text-slate-600 border border-white/5'
                }`}
            >
              {i + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}
