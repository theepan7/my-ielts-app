export default function TestCard({ test, isCompleted, onClick }) {
  const isLocked  = !test.isFree && !onClick.isLoggedIn
  const diffColor = test.difficulty === 'Advanced'
    ? 'text-red-500' : test.difficulty === 'Intermediate'
    ? 'text-green-600' : 'text-amber-500'
  const stripeClass = test.category === 'academic'
    ? 'from-violet-500 to-purple-400'
    : 'from-teal-500 to-cyan-400'
  const hoverBorder = test.category === 'academic'
    ? 'hover:border-violet-300' : 'hover:border-teal-300'

  return (
    <div
      onClick={() => onClick(test)}
      className={`card relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${hoverBorder} group`}
    >
      {/* Top stripe */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stripeClass}`} />

      <div className="p-4 pt-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test #{test.id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isCompleted
              ? 'bg-green-50 text-green-600 border-green-200'
              : test.isFree
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            {isCompleted ? '✓ Done' : test.isFree ? 'Free' : '🔒 Members'}
          </span>
        </div>

        <p className="font-semibold text-slate-800 text-[13.5px] leading-tight mb-1">{test.topic}</p>
        <p className="text-[11.5px] text-slate-400 mb-3">{test.title}</p>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">⏱ {test.duration}m</span>
          <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">📝 {test.questions} Qs</span>
          <span className={`text-[11px] bg-slate-100 px-2 py-0.5 rounded-full font-medium ${diffColor}`}>{test.difficulty}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
            test.category === 'academic'
              ? 'bg-violet-50 text-violet-600 border-violet-200'
              : 'bg-teal-50 text-teal-600 border-teal-200'
          }`}>
            {test.category === 'academic' ? '📚 Academic' : '📺 General'}
          </span>
        </div>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white border border-slate-200 shadow-md rounded-lg px-4 py-2 text-xs text-slate-600 font-medium text-center">
            🔒 Sign up free to unlock all tests
          </div>
        </div>
      )}
    </div>
  )
}
