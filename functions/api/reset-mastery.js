// POST /api/reset-mastery
// 重置精熟（解除精熟、保留錯題本）：
//   - 設 users.mastery_reset_at = now → 自動精熟（答對≥3）只算此時間之後的答對，等於全部解除
//   - 清 user_question_marks.manual_mastered = 0 → 手動「已會了」全部解除
//   - 不動 user_attempts → 錯題本 / 錯題加強 / 答題統計全部保留
// 需已登入

export async function onRequestPost({ env, data }) {
    const userId = data?.userId
    if (!userId) {
        return Response.json({ success: false, error: '請先登入' }, { status: 401 })
    }

    await env.DB.batch([
        env.DB.prepare("UPDATE users SET mastery_reset_at = datetime('now') WHERE id = ?").bind(userId),
        env.DB.prepare("UPDATE user_question_marks SET manual_mastered = 0 WHERE user_id = ?").bind(userId),
    ])

    return Response.json({ success: true, data: { reset: true } })
}
