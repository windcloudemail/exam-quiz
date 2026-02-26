export default function ExplanationBox({ isCorrect, explanation }) {
  return (
    <div className={`fadeIn rounded-xl p-5 border mt-4 ${
      isCorrect
        ? 'bg-green-950/50 border-green-700'
        : 'bg-red-950/50 border-red-700'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{isCorrect ? '🎯' : '📖'}</span>
        <span className={`font-bold text-base ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? '答對了！' : '答錯了，來看解說'}
        </span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{explanation}</p>
    </div>
  )
}
