const LABELS = ['A', 'B', 'C', 'D']

export default function OptionButton({ index, text, state, onClick }) {
  // state: 'default' | 'selected' | 'correct' | 'wrong' | 'disabled'

  const base = 'w-full text-left px-4 py-4 rounded-2xl border-2 text-[15px] leading-relaxed transition-all duration-200 flex items-center gap-4 font-medium'

  const styles = {
    default: `${base} border-white/10 bg-surface text-slate-200 hover:border-primary/60 hover:bg-primary/10 hover:text-white cursor-pointer active:scale-[0.98]`,
    selected: `${base} border-primary bg-primary/20 text-white cursor-pointer shadow-lg shadow-primary/20`,
    correct: `${base} border-correct bg-correct/15 text-white cursor-default`,
    wrong: `${base} border-wrong bg-wrong/15 text-slate-300 cursor-default`,
    disabled: `${base} border-white/5 bg-surface/50 text-slate-600 cursor-default`,
  }

  const labelStyle = {
    default: 'border-white/20 text-slate-400 bg-transparent',
    selected: 'border-primary bg-primary text-white',
    correct: 'border-correct bg-correct text-white',
    wrong: 'border-wrong bg-wrong text-white',
    disabled: 'border-white/10 text-slate-600 bg-transparent',
  }

  return (
    <button
      onClick={onClick}
      disabled={state === 'disabled' || state === 'correct' || state === 'wrong'}
      className={styles[state]}
    >
      {/* Letter badge */}
      <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${labelStyle[state]}`}>
        {LABELS[index]}
      </span>

      <span className="flex-1">{text}</span>

      {/* Result icon */}
      {state === 'correct' && (
        <span className="shrink-0 w-7 h-7 rounded-full bg-correct flex items-center justify-center text-white text-sm font-bold pop-in">✓</span>
      )}
      {state === 'wrong' && (
        <span className="shrink-0 w-7 h-7 rounded-full bg-wrong flex items-center justify-center text-white text-sm font-bold pop-in">✗</span>
      )}
    </button>
  )
}
