// GET /api/questions/categories → 取得所有不重複的分類名稱

export async function onRequestGet({ env }) {
    const result = await env.DB.prepare(
        `SELECT DISTINCT category FROM questions ORDER BY category ASC`
    ).all()

    const categories = result.results.map(r => r.category).filter(Boolean)
    return Response.json({ success: true, data: categories })
}
