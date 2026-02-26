// GET    /api/questions/:id  → 取得單一題目
// PUT    /api/questions/:id  → 更新題目
// DELETE /api/questions/:id  → 刪除題目

export async function onRequestGet({ params, env }) {
  const { id } = params
  const result = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first()

  if (!result) return Response.json({ success: false, error: '題目不存在' }, { status: 404 })

  return Response.json({ success: true, data: result })
}

export async function onRequestPut({ params, request, env }) {
  const { id } = params
  const body = await request.json()
  const { category, difficulty, question, option_1, option_2, option_3, option_4, answer, explanation } = body

  await env.DB.prepare(
    `UPDATE questions
     SET category=?, difficulty=?, question=?, option_1=?, option_2=?, option_3=?, option_4=?, answer=?, explanation=?
     WHERE id=?`
  ).bind(
    category, difficulty, question,
    option_1, option_2, option_3, option_4,
    Number(answer), explanation || '',
    id
  ).run()

  return Response.json({ success: true, data: { id } })
}

export async function onRequestDelete({ params, env }) {
  const { id } = params
  await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(id).run()
  return Response.json({ success: true, data: { id } })
}
