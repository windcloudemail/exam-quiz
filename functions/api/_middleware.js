// CORS 與統一錯誤處理

export async function onRequest(context) {
  // OPTIONS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const response = await context.next()
    const newRes = new Response(response.body, response)
    newRes.headers.set('Access-Control-Allow-Origin', '*')
    return newRes
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
