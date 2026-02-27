// 所有 API 呼叫集中在這裡，方便維護

const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    headers: { ...headers, ...(options.headers || {}) },
    ...options,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || '發生錯誤')
  return json.data
}

// 隨機抽題
export const getRandomQuestions = (count = 20, category = '') =>
  request(`/questions/random?count=${count}&category=${encodeURIComponent(category)}`)

// 取得所有題目（後台用）
export const getAllQuestions = (page = 1, category = '') =>
  request(`/questions?page=${page}&category=${encodeURIComponent(category)}`)

// 取得所有不重複的分類
export const getCategories = () =>
  request('/questions/categories')


// 取得單一題目
export const getQuestion = (id) =>
  request(`/questions/${id}`)

// 新增題目
export const createQuestion = (data) =>
  request('/questions', { method: 'POST', body: JSON.stringify(data) })

// 更新題目
export const updateQuestion = (id, data) =>
  request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// 刪除題目
export const deleteQuestion = (id) =>
  request(`/questions/${id}`, { method: 'DELETE' })

// 批次更新題目順序
export const reorderQuestions = (orderedIds) =>
  request('/questions/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) })

// 登入
export const loginAdmin = (password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) })
