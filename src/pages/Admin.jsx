import { useState, useEffect } from 'react'
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../lib/api.js'

const EMPTY_FORM = {
  category: '外幣保險',
  difficulty: 'medium',
  question: '',
  option_1: '', option_2: '', option_3: '', option_4: '',
  answer: 1,
  explanation: '',
}

export default function Admin() {
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [editId,    setEditId]    = useState(null)   // null = 新增模式
  const [saving,    setSaving]    = useState(false)
  const [showForm,  setShowForm]  = useState(false)
  const [msg,       setMsg]       = useState('')

  const load = () => {
    setLoading(true)
    getAllQuestions()
      .then(data => { setQuestions(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500) }

  const handleEdit = (q) => {
    setForm({
      category: q.category, difficulty: q.difficulty,
      question: q.question,
      option_1: q.option_1, option_2: q.option_2,
      option_3: q.option_3, option_4: q.option_4,
      answer: q.answer, explanation: q.explanation,
    })
    setEditId(q.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNew = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這題嗎？')) return
    await deleteQuestion(id)
    flash('已刪除')
    load()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await updateQuestion(editId, form)
        flash('已更新')
      } else {
        await createQuestion(form)
        flash('已新增')
      }
      setShowForm(false)
      setEditId(null)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      flash(`錯誤：${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-base border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent"
  const labelClass = "block text-xs text-slate-400 mb-1 font-medium"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">題庫管理</h1>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-accent text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-all"
        >
          ＋ 新增題目
        </button>
      </div>

      {/* 訊息提示 */}
      {msg && (
        <div className="fadeIn mb-4 px-4 py-3 bg-green-900 border border-green-600 text-green-300 text-sm rounded-xl">
          {msg}
        </div>
      )}

      {/* 新增 / 編輯表單 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-slate-600 rounded-2xl p-5 mb-6 fadeIn">
          <h2 className="font-bold text-white mb-4">{editId ? '編輯題目' : '新增題目'}</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>分類</label>
              <input className={inputClass} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass}>難度</label>
              <select className={inputClass} value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="easy">簡單</option>
                <option value="medium">中等</option>
                <option value="hard">困難</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className={labelClass}>題目內容</label>
            <textarea className={inputClass} rows={4} value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {[1,2,3,4].map(n => (
              <div key={n}>
                <label className={labelClass}>選項 {n}</label>
                <input className={inputClass} value={form[`option_${n}`]}
                  onChange={e => setForm(f => ({ ...f, [`option_${n}`]: e.target.value }))} required />
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label className={labelClass}>正確答案</label>
            <select className={inputClass} value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: Number(e.target.value) }))}>
              {[1,2,3,4].map(n => (
                <option key={n} value={n}>選項 {n}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={labelClass}>解說</label>
            <textarea className={inputClass} rows={3} value={form.explanation}
              onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-accent text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all">
              {saving ? '儲存中…' : editId ? '更新題目' : '新增題目'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-3 border border-slate-600 text-slate-300 rounded-xl hover:border-slate-400 transition-all">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 題目列表 */}
      {loading ? (
        <p className="text-slate-400 text-center py-8">載入中…</p>
      ) : error ? (
        <p className="text-red-400 text-center py-8">{error}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map(q => (
            <div key={q.id} className="bg-surface border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className="text-xs bg-primary text-blue-200 px-2 py-0.5 rounded-md">{q.category}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md">#{q.id}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">{q.question}</p>
                  <p className="text-xs text-green-400 mt-1">答案：選項 {q.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(q)}
                    className="px-3 py-1.5 text-xs border border-slate-600 text-slate-300 rounded-lg hover:border-accent hover:text-accent transition-all">
                    編輯
                  </button>
                  <button onClick={() => handleDelete(q.id)}
                    className="px-3 py-1.5 text-xs border border-red-800 text-red-400 rounded-lg hover:bg-red-950 transition-all">
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-slate-500 text-center py-8">尚無題目，請先新增</p>
          )}
        </div>
      )}
    </div>
  )
}
