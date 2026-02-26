import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRandomQuestions } from '../lib/api.js'
import QuestionCard   from '../components/QuestionCard.jsx'
import OptionButton   from '../components/OptionButton.jsx'
import ExplanationBox from '../components/ExplanationBox.jsx'

export default function Quiz() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const count     = state?.count    ?? 20
  const category  = state?.category ?? ''

  const [questions, setQuestions] = useState([])
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)   // 選到哪個選項（0-3）
  const [revealed,  setRevealed]  = useState(false)
  const [answers,   setAnswers]   = useState([])      // 每題答案紀錄
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    getRandomQuestions(count, category === '全部' ? '' : category)
      .then(data => { setQuestions(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      載入題目中…
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-400 mb-4">⚠️ {error}</p>
      <button onClick={() => navigate('/')} className="text-accent underline">返回首頁</button>
    </div>
  )

  if (questions.length === 0) return (
    <div className="text-center py-12">
      <p className="text-slate-400 mb-4">此分類尚無題目</p>
      <button onClick={() => navigate('/')} className="text-accent underline">返回首頁</button>
    </div>
  )

  const q        = questions[current]
  const opts     = [q.option_1, q.option_2, q.option_3, q.option_4]
  const correctIdx = q.answer - 1   // DB 存 1-4，轉成 0-3
  const isCorrect  = selected === correctIdx

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
    if (!revealed) {
      return selected === idx ? 'selected' : 'default'
    }
    if (idx === correctIdx)              return 'correct'
    if (idx === selected && !isCorrect)  return 'wrong'
    return 'disabled'
  }

  const progress = Math.round(((current) / questions.length) * 100)

  return (
    <div>
      {/* 進度條 */}
      <div className="bg-slate-700 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 題目 */}
      <QuestionCard
        current={current + 1}
        total={questions.length}
        question={q.question}
      />

      {/* 選項 */}
      <div className="flex flex-col gap-3 mb-4">
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
      <div className="mt-6">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
              selected !== null
                ? 'bg-accent text-black hover:bg-yellow-400'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            確認答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-accent text-black font-bold text-base rounded-xl hover:bg-yellow-400 transition-all"
          >
            {current + 1 === questions.length ? '查看結果 🏁' : '下一題 →'}
          </button>
        )}
      </div>

      {/* 題號快速導覽 */}
      <div className="flex flex-wrap gap-1.5 mt-6 justify-center">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-md text-xs flex items-center justify-center font-bold ${
              i === current      ? 'bg-accent text-black' :
              i < current        ? 'bg-slate-600 text-slate-300' :
              'bg-slate-800 text-slate-500'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
