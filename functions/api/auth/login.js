export async function onRequestPost({ request, env }) {
    try {
        const { password } = await request.json()
        // 簡單固定密碼，符合 V1 需求
        const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'admin123'

        if (password === ADMIN_PASSWORD) {
            // Return a simple static token for V1 (or could be dynamic)
            return Response.json({ success: true, token: 'v1-admin-token-secure' })
        } else {
            return Response.json({ success: false, error: '密碼錯誤' }, { status: 401 })
        }
    } catch (e) {
        return Response.json({ success: false, error: 'Invalid request' }, { status: 400 })
    }
}
