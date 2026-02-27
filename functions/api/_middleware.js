// CORS 與統一錯誤處理

export async function onRequest(context) {
  // OPTIONS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const url = new URL(context.request.url)
    const isQuestionMutation = url.pathname.startsWith('/api/questions') &&
      ['POST', 'PUT', 'DELETE'].includes(context.request.method)

    if (isQuestionMutation) {
      const authHeader = context.request.headers.get('Authorization')
      if (!authHeader || authHeader !== 'Bearer v1-admin-token-secure') {
        return Response.json({ success: false, error: '未經授權的操作，請先登入' }, { status: 401 })
      }
    }

    const response = await context.next()
    const newRes = new Response(response.body, response)
    newRes.headers.set('Access-Control-Allow-Origin', '*')
    return newRes
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
