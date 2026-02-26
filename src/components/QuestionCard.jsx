export default function QuestionCard({ current, total, question }) {
  return (
    <div className="bg-surface border border-slate-700 rounded-2xl p-6 mb-4">
      <p className="text-xs text-accent font-bold tracking-widest uppercase mb-2">
        第 {current} 題 / 共 {total} 題
      </p>
      <p className="text-slate-100 text-[15px] leading-relaxed whitespace-pre-line">
        {question}
      </p>
    </div>
  )
}
