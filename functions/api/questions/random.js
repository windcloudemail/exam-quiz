// GET /api/questions/random?count=20&category=xxx

export async function onRequestGet({ request, env }) {
  const url      = new URL(request.url)
  const count    = parseInt(url.searchParams.get('count') || '20', 10)
  const category = url.searchParams.get('category') || ''

  let query  = 'SELECT * FROM questions'
  const args = []

  if (category) {
    query += ' WHERE category = ?'
    args.push(category)
  }

  query += ' ORDER BY RANDOM() LIMIT ?'
  args.push(Math.min(count, 50))  // 最多 50 題

  const { results } = await env.DB.prepare(query).bind(...args).all()

  return Response.json({ success: true, data: results })
}
