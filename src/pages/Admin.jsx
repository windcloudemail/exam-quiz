import { useState, useEffect } from 'react'
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion, loginAdmin, reorderQuestions } from '../lib/api.js'
import { parseDocument } from '../lib/fileParser.js'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Tesseract from 'tesseract.js';

function SortableQuestionRow({ q, displayIndex, selectedIds, toggleSelect, handleEdit, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface border border-slate-700 rounded-xl p-4 flex gap-3 relative z-10">
      <div
        {...attributes}
        {...listeners}
        className="pt-1.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-500 hover:text-white"
        title="拖曳排序"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </div>

      <div className="pt-1.5 shrink-0">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-600 bg-base text-accent cursor-pointer"
          checked={selectedIds.has(q.id)}
          onChange={() => toggleSelect(q.id)}
        />
      </div>
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-1 flex-wrap items-center">
            <span className="text-xs font-bold bg-accent text-black px-2 py-0.5 rounded-md">Q{displayIndex}</span>
            <span className="text-xs bg-primary text-blue-200 px-2 py-0.5 rounded-md">{q.category}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">{q.question}</p>
          {q.question_part2 && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-1 mt-1 border-t border-slate-700/50 pt-1">
              {q.question_part2}
            </p>
          )}
          <p className="text-xs text-green-400 mt-1">答案：選項 {q.answer}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => handleEdit(q)}
            className="px-3 py-1.5 text-xs border border-slate-600 text-slate-300 rounded-lg hover:border-accent hover:text-accent transition-all z-20">
            編輯
          </button>
          <button onClick={() => handleDelete(q.id)}
            className="px-3 py-1.5 text-xs border border-red-800 text-red-400 rounded-lg hover:bg-red-950 transition-all z-20">
            刪除
          </button>
        </div>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  category: '外幣保險',
  difficulty: 'medium',
  question: '',
  question_part2: '',
  option_1: '', option_2: '', option_3: '', option_4: '',
  answer: 1,
  explanation: '',
}

export default function Admin() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)   // null = 新增模式
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoggingIn(true)
    setError('')
    try {
      const res = await loginAdmin(password)
      if (res.token) {
        localStorage.setItem('admin_token', res.token)
        setToken(res.token)
        setPassword('')
      }
    } catch (err) {
      setError(err.message || '登入失敗')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken('')
    setQuestions([])
  }

  const load = () => {
    if (!token) return
    setLoading(true)
    getAllQuestions()
      .then(data => { setQuestions(data); setLoading(false) })
      .catch(e => {
        if (e.message.includes('登入') || e.status === 401) handleLogout()
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [token])

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500) }

  const handleEdit = (q) => {
    setForm({
      category: q.category, difficulty: q.difficulty,
      question: q.question, question_part2: q.question_part2 || '',
      option_1: q.option_1, option_2: q.option_2,
      option_3: q.option_3, option_4: q.option_4,
      answer: q.answer, explanation: q.explanation,
    })
    setEditId(q.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNew = () => {
    setForm({
      ...EMPTY_FORM,
      category: selectedCategory || '外幣保險'
    })
    setEditId(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Bind the form's category to changes in the filter dropdown if adding a new question
  useEffect(() => {
    if (showForm && !editId && selectedCategory) {
      setForm(f => ({ ...f, category: selectedCategory }));
    }
  }, [selectedCategory, showForm, editId]);

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這題嗎？')) return
    await deleteQuestion(id)
    flash('已刪除')
    load()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`確定要刪除選取的 ${selectedIds.size} 題嗎？`)) return

    setLoading(true)
    let errCount = 0
    for (const id of selectedIds) {
      try {
        await deleteQuestion(id)
      } catch (err) {
        errCount++
      }
    }

    if (errCount > 0) flash(`刪除完成，但有 ${errCount} 題發生錯誤`)
    else flash(`已成功刪除 ${selectedIds.size} 題`)

    setSelectedIds(new Set())
    load()
  }

  const toggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const uniqueCategories = Array.from(new Set(questions.map(q => q.category))).filter(Boolean)
  const filteredQuestions = selectedCategory ? questions.filter(q => q.category === selectedCategory) : questions

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);

      const newArr = arrayMove(questions, oldIndex, newIndex);
      setQuestions([...newArr]);

      // Only reorder the sequence of the currently filtered items on the backend
      const categoryArr = newArr.filter(q => q.category === selectedCategory || (!selectedCategory));
      const orderedIds = categoryArr.map(q => q.id);

      try {
        await reorderQuestions(orderedIds);
      } catch (err) {
        if (err.message.includes('登入')) handleLogout();
        flash(`排序儲存失敗: ${err.message}`);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    await processFile(file);
    e.target.value = '' // reset
  }

  const processFile = async (file) => {
    setUploading(true)
    try {
      const defaultCategory = file.name.replace(/\.[^/.]+$/, "");
      const qList = await parseDocument(file)
      if (qList.length === 0) {
        flash('沒有解析出任何題目，請檢查檔案格式是否正確。')
        return
      }

      // 將所解析出的題目分類標上檔案名稱
      qList.forEach(q => {
        if (q.category === '題庫匯入' || !q.category) {
          q.category = defaultCategory;
        }
      });

      if (!confirm(`已依據「${defaultCategory}」解析出 ${qList.length} 題，確定要匯入嗎？`)) return

      flash(`正在匯入 ${qList.length} 題...`)

      let successCount = 0
      for (const q of qList) {
        try {
          await createQuestion(q)
          successCount++
        } catch (err) {
          console.error("匯入單題錯誤", err, q)
        }
      }

      flash(`成功匯入 ${successCount} 題`)
      load()
    } catch (err) {
      flash(`解析檔案失敗：${err.message}`)
      if (err.message.includes('登入')) handleLogout()
    } finally {
      setUploading(false)
    }
  }

  // Handle global global Ctrl+V pasting of an image for bulk import 
  useEffect(() => {
    if (!token || showForm) return;

    const handleGlobalPaste = async (e) => {
      // Don't intercept if user is typing in an input/textarea somewhere else
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      let imageItem = null;
      for (let item of items) {
        if (item.type.indexOf("image") === 0) {
          imageItem = item;
          break;
        }
      }

      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        const newFile = new File([file], "剪貼簿圖片題庫", { type: file.type });

        // Instead of calling processFile directly which enforces strict regex,
        // let's try the strict regex first, but if it yields 0, fallback to raw OCR injection:
        setUploading(true);
        try {
          const qList = await parseDocument(newFile);
          if (qList.length > 0) {
            // It found structured questions, so run the standard bulk importer
            qList.forEach(q => {
              q.category = selectedCategory || '外幣保險';
            });
            if (confirm(`解析出 ${qList.length} 題，確定要匯入嗎？`)) {
              flash(`正在匯入 ${qList.length} 題...`);
              let successCount = 0;
              for (const q of qList) {
                try { await createQuestion(q); successCount++; } catch (err) { }
              }
              flash(`成功匯入 ${successCount} 題`);
              load();
            }
          } else {
            // Regex failed to find options. Just OCR it and open the Add form:
            flash('找不到完整選擇題結構，為您將文字匯入新增表單...');
            const { data: { text } } = await Tesseract.recognize(newFile, 'chi_tra');

            let cleaned = text.replace(/[\r\n]+/g, '');
            cleaned = cleaned.replace(/\s+/g, (match, offset, str) => {
              const prev = str[offset - 1];
              const next = str[offset + match.length];
              if (prev && next && /[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(next)) return ' ';
              return '';
            }).trim();

            setForm({ ...EMPTY_FORM, category: selectedCategory || '外幣保險', question: cleaned });
            setEditId(null);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (err) {
          flash(`解析失敗：${err.message}`);
        } finally {
          setUploading(false);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [token, showForm, questions, selectedCategory]);

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
      if (err.message.includes('登入')) handleLogout()
    } finally {
      setSaving(false)
    }
  }

  const handlePasteImageOCR = async (e, fieldName) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let imageItem = null;
    for (let item of items) {
      if (item.type.indexOf("image") === 0) {
        imageItem = item;
        break;
      }
    }

    if (!imageItem) return;
    e.preventDefault();

    const file = imageItem.getAsFile();
    setOcrLoading(true);
    flash('🖼️ 正在透過 OCR 解析圖片文字，請稍候...');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'chi_tra', {
        logger: m => console.log(m)
      });

      // Remove all line breaks. Then remove spaces, UNLESS the space is surrounded by english/numbers.
      let cleaned = text.replace(/[\r\n]+/g, '');
      cleaned = cleaned.replace(/\s+/g, (match, offset, str) => {
        const prev = str[offset - 1];
        const next = str[offset + match.length];
        if (prev && next && /[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(next)) {
          return ' '; // preserve space between alphanumeric characters
        }
        return ''; // remove space between asian characters
      }).trim();

      setForm(f => ({ ...f, [fieldName]: f[fieldName] + cleaned }));
      flash('✅ 圖片文字解析成功！');
    } catch (error) {
      console.error(error);
      flash('❌ OCR 解析失敗。');
    } finally {
      setOcrLoading(false);
    }
  };

  const inputClass = "w-full bg-base border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent"
  const labelClass = "block text-xs text-slate-400 mb-1 font-medium"

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-surface border border-slate-600 rounded-2xl p-6">
        <h1 className="text-xl font-black text-white mb-6 text-center">管理員登入</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className={labelClass}>密碼</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="輸入管理員密碼"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-accent text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all"
          >
            {loggingIn ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">題庫管理</h1>
        <div className="flex gap-2">
          <label className={`px-4 py-2 cursor-pointer font-bold text-sm rounded-lg transition-all ${uploading ? 'bg-slate-600 text-slate-400' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
            {uploading ? '解析中...' : '📂 上傳題庫 (PDF/DOCX/圖片)'}
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-accent text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-all"
          >
            ＋ 新增題目
          </button>
          <button onClick={handleLogout} className="px-3 py-2 border border-slate-600 text-slate-300 rounded-lg text-sm hover:border-slate-400">
            登出
          </button>
        </div>
      </div>

      {/* 工具列：分類過濾與批次操作 */}
      {!loading && !error && questions.length > 0 && (
        <div className="fadeIn flex flex-wrap items-center justify-between mb-6 gap-4 bg-surface border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-300">選擇題本：</label>
            <select
              className="bg-base border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent"
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setSelectedIds(new Set()) }}
            >
              <option value="">顯示全部 ({questions.length})</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat} ({questions.filter(q => q.category === cat).length})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer user-select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-base text-accent"
                checked={filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length}
                onChange={toggleSelectAll}
                disabled={filteredQuestions.length === 0}
              />
              全選本頁
            </label>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-bold bg-red-900/50 text-red-400 border border-red-800 rounded-lg hover:bg-red-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批次刪除 ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

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
                list="category-options"
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
              <datalist id="category-options">
                {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <label className={labelClass}>
                題目內容 1 (選項前)
                <span className="ml-2 text-[10px] text-accent bg-accent/10 px-1 py-0.5 rounded">可 Ctrl+V 貼上圖片解析</span>
              </label>
              <textarea
                className={`${inputClass} ${ocrLoading ? 'opacity-50' : ''}`}
                rows={4}
                value={form.question}
                placeholder="在此貼上題目... 或直接使用 Ctrl+V 貼上圖片進行文字辨識"
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                onPaste={e => handlePasteImageOCR(e, 'question')}
                required
                disabled={ocrLoading}
              />
            </div>

            <div className="relative">
              <label className={labelClass}>
                題目內容 2 (選項後 / 選填)
                <span className="ml-2 text-[10px] text-accent bg-accent/10 px-1 py-0.5 rounded">可 Ctrl+V 貼上圖片解析</span>
              </label>
              <textarea
                className={`${inputClass} ${ocrLoading ? 'opacity-50' : ''}`}
                rows={4}
                value={form.question_part2}
                placeholder="選填，若有「內嵌選項」後方的剩餘文字可填入此處..."
                onChange={e => setForm(f => ({ ...f, question_part2: e.target.value }))}
                onPaste={e => handlePasteImageOCR(e, 'question_part2')}
                disabled={ocrLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {[1, 2, 3, 4].map(n => (
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
              {[1, 2, 3, 4].map(n => (
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              {filteredQuestions.map((q, index) => (
                <SortableQuestionRow
                  key={q.id}
                  q={q}
                  displayIndex={index + 1}
                  selectedIds={selectedIds}
                  toggleSelect={toggleSelect}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>

          {filteredQuestions.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              {questions.length === 0 ? '尚無題目，請先新增' : '此分類下沒有題目'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
