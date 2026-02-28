export default function QuestionCard({ current, total, question, question_part2, options }) {
  return (
    <div className="bg-card border border-white/8 rounded-2xl p-6 mb-5 shadow-xl shadow-black/20 fadeIn">
      {/* 題號 badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/15 px-3 py-1 rounded-full">
          第 {current} 題
        </span>
        <span className="text-xs text-slate-500 font-medium">
          {current} / {total}
        </span>
      </div>

      {/* 題目 Part 1 */}
      <p className="text-white text-[16px] font-medium leading-relaxed whitespace-pre-line">
        {question}
      </p>

      {/* 若有選項後文字（Part 2）另起一行 */}
      {question_part2 && (
        <p className="text-slate-300 text-[15px] leading-relaxed mt-3 pt-3 border-t border-white/8 whitespace-pre-line">
          {question_part2}
        </p>
      )}
    </div>
  )
}
