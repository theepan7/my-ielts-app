import { useAuth } from '../context/AuthContext'

export default function UserProgress({ completedIds, onAuthClick }) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="card p-4 text-center">
        <div className="text-3xl mb-2">🔓</div>
        <h3 className="font-serif font-semibold text-slate-800 text-sm mb-1">Unlock All 100 Tests</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Sign up free to access the full test library, track your progress, and appear on the global leaderboard.
        </p>
        <button onClick={() => onAuthClick('signup')} className="btn-primary w-full mb-2 text-xs py-2">
          Create Free Account
        </button>
        <button onClick={() => onAuthClick('login')} className="btn-ghost w-full text-xs py-2">
          I already have an account
        </button>
        <p className="text-[10.5px] text-slate-400 mt-2">No credit card required</p>
      </div>
    )
  }

  const done    = completedIds.length
  const pct     = Math.round((done / 100) * 100)
  const R       = 30
  const C       = 2 * Math.PI * R
  const offset  = C - (C * pct / 100)

  return (
    <div className="card p-4">
      <h3 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">📊 Your Progress</h3>

      <div className="flex items-center gap-3 mb-3">
        {/* Ring */}
        <svg width="72" height="72" className="flex-shrink-0">
          <circle cx="36" cy="36" r={R} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={R}
            fill="none"
            stroke="url(#pg)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px', transition: 'stroke-dashoffset .7s' }}
          />
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <text x="36" y="41" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans">
            {pct}%
          </text>
        </svg>

        <div>
          <p className="text-[10.5px] text-slate-400 mb-0.5">Completed</p>
          <p className="text-lg font-bold text-slate-800">
            {done}<span className="text-sm text-slate-400 font-normal"> / 100</span>
          </p>
          <p className="text-[10.5px] text-slate-400 mt-1 mb-0.5">Best Band</p>
          <p className="text-lg font-bold text-amber-500">{done > 0 ? '7.0' : '—'}</p>
        </div>
      </div>

      {/* Bar */}
      <div>
        <div className="flex justify-between text-[10.5px] text-slate-400 mb-1">
          <span>Overall Progress</span>
          <span>{done}/100</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
