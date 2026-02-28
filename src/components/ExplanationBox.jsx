export default function ExplanationBox({ isCorrect, explanation }) {
  return (
    <div className={`slideUp rounded-2xl overflow-hidden mt-4 border-l-4 ${isCorrect
        ? 'border-correct bg-correct/10'
        : 'border-wrong bg-wrong/10'
      }`}
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards' }}>
      <div className={`px-5 py-4`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold ${isCorrect ? 'bg-correct/20 text-correct' : 'bg-wrong/20 text-wrong'
            }`}>
            {isCorrect ? '🎯' : '📖'}
          </div>
          <span className={`font-bold text-base ${isCorrect ? 'text-correct' : 'text-wrong'}`}>
            {isCorrect ? '答對了！太棒了' : '答錯了，看看解說吧'}
          </span>
        </div>
        {explanation && (
          <p className="text-slate-300 text-sm leading-relaxed ml-12">
            {explanation}
          </p>
        )}
      </div>
    </div>
  )
}
