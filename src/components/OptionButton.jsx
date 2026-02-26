export default function OptionButton({ index, text, state, onClick }) {
  // state: 'default' | 'selected' | 'correct' | 'wrong' | 'disabled'
  const styles = {
    default:  'border-slate-700 bg-surface text-slate-200 hover:border-accent cursor-pointer',
    selected: 'border-accent bg-yellow-950 text-white cursor-pointer',
    correct:  'border-green-500 bg-green-950 text-green-300',
    wrong:    'border-red-500 bg-red-950 text-red-300',
    disabled: 'border-slate-700 bg-surface text-slate-500 cursor-default',
  }

  return (
    <button
      onClick={onClick}
      disabled={state === 'disabled' || state === 'correct' || state === 'wrong'}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-[15px] leading-relaxed transition-all duration-200 flex items-start gap-3 ${styles[state]}`}
    >
      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border ${
        state === 'correct' ? 'border-green-500 text-green-400' :
        state === 'wrong'   ? 'border-red-500 text-red-400' :
        state === 'selected'? 'border-accent text-accent' :
        'border-slate-600 text-slate-400'
      }`}>
        {index + 1}
      </span>
      <span className="mt-0.5">{text}</span>
      {state === 'correct' && <span className="ml-auto shrink-0 text-green-400 text-lg">✓</span>}
      {state === 'wrong'   && <span className="ml-auto shrink-0 text-red-400 text-lg">✗</span>}
    </button>
  )
}
