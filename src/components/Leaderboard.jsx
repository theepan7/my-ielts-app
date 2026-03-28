import { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../firebase/services'

const AVATAR_COLORS = ['#7c3aed','#2563eb','#0891b2','#d97706','#dc2626','#059669','#be185d','#0891b2','#65a30d','#7c3aed']

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const rankLabel = r => r === 1 ? '👑' : r === 2 ? '🥈' : r === 3 ? '🥉' : r

  return (
    <div className="card p-4">
      <h3 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">🏆 Global Leaderboard</h3>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e, i) => (
            <div key={e.docId || i} className={`flex items-center gap-2 px-2 py-2 rounded-lg border transition-all
              ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
              <span className="text-xs font-bold min-w-[18px] text-center text-slate-400">{rankLabel(e.rank)}</span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {(e.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{e.name}</p>
                <p className="text-[10px] text-slate-400">{e.testsCount} tests</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-blue-600">{e.avgScore}</p>
                <p className="text-[9px] text-slate-400">avg</p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No results yet — be first!</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center mt-3 pt-3 border-t border-slate-100">
        Top 10 · All-time · Updated daily
      </p>
    </div>
  )
}
