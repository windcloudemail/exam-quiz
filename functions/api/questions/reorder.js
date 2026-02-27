// POST /api/questions/reorder
// Accepts an array of question IDs in their new desired order for a specific category.

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json()
        const { orderedIds } = body

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return Response.json({ success: false, error: '缺少 orderedIds 陣列' }, { status: 400 })
        }

        // Prepare a batch of UPDATE statements to assign the new order_index
        // The order_index is simply the index of the ID in the array.
        const statements = orderedIds.map((id, index) => {
            return env.DB.prepare('UPDATE questions SET order_index = ? WHERE id = ?').bind(index, id)
        })

        // Execute the batch sequentially in a single transaction
        await env.DB.batch(statements)

        return Response.json({ success: true, message: '順序已更新' })
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 })
    }
}
