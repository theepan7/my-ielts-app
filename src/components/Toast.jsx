export default function Toast({ msg, type = 'success' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-[fadeUp_.25s_ease] max-w-xs
      ${type === 'success'
        ? 'bg-white border-green-300 text-slate-800'
        : 'bg-white border-red-300 text-slate-800'
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
      >
        {type === 'success' ? '✓' : '✕'}
      </div>
      {msg}
    </div>
  )
}
