// src/components/Leaderboard.jsx
import { useEffect, useState } from 'react'
import { useAuth }             from '../context/AuthContext'
import { fetchLeaderboard, fetchUserRank } from '../firebase/services'

const AV_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
  '#059669','#be185d','#0ea5e9','#65a30d','#7c3aed'
]

export default function Leaderboard({ onAuthClick }) {
  const { user }                = useAuth()
  const [entries,  setEntries]  = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading,  setLoading]  = useState(true)

  async function load() {
    try {
      const [lb, ur] = await Promise.all([
        fetchLeaderboard(),
        user ? fetchUserRank(user.uid) : Promise.resolve(null),
      ])
      setEntries(lb)
      setUserRank(ur)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [user])

  const rankIcon = r => r === 1 ? '👑' : r === 2 ? '🥈' : r === 3 ? '🥉' : r
  const userInTop10 = user && entries.some(e => e.userId === user.uid)

  function LeaderboardRow({ e, i, isMe }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 9px', borderRadius: 8,
        background: isMe
          ? '#eff4ff'
          : i === 0
            ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
            : '#f8fafc',
        border: `1px solid ${isMe ? '#93c5fd' : i === 0 ? '#fde68a' : 'transparent'}`,
        transition: 'all .16s',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          minWidth: 18, textAlign: 'center',
          color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#92400e' : '#94a3b8',
        }}>
          {rankIcon(e.rank)}
        </span>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: AV_COLORS[i % AV_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#fff',
        }}>
          {(e.userName || 'U').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: '#0f172a',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {e.userName}
            {isMe && (
              <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 500, marginLeft: 4 }}>
                (you)
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
            {e.avgBand || '—'}
          </div>
          <div style={{ fontSize: 9, color: '#94a3b8' }}>avg band</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(15,23,42,.07)',
      position: 'relative', overflow: 'hidden',   // needed for overlay
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.07em', color: '#94a3b8',
        }}>
          🏆 Global Leaderboard
        </span>
        <button
          onClick={load}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: '#2563eb', fontWeight: 600,
            fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '2px 6px',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Entries (always rendered, blurred when logged out) ── */}
      <div style={{
        filter: !user ? 'blur(4px)' : 'none',
        pointerEvents: !user ? 'none' : 'auto',
        userSelect: !user ? 'none' : 'auto',
        transition: 'filter .3s',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 42, background: '#f1f5f9', borderRadius: 8,
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
            No scores yet — complete a test to be first! 🎯
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {entries.map((e, i) => (
              <LeaderboardRow
                key={e.userId || i}
                e={e} i={i}
                isMe={user && e.userId === user.uid}
              />
            ))}
            {user && !userInTop10 && userRank && (
              <>
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: '2px 0' }}>
                  · · ·
                </div>
                <LeaderboardRow e={userRank} i={userRank.rank - 1} isMe={true} />
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 10,
          textAlign: 'center', fontSize: 10, color: '#94a3b8',
        }}>
          Top 10 · Ranked by average band score · Updates after each test
        </div>
      </div>

      {/* ── Sign-up overlay — shown only when logged out ── */}
      {!user && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, padding: '24px 20px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(2px)',
          borderRadius: 12,
          textAlign: 'center',
        }}>
         
          <div>
            <div style={{
              fontFamily: 'Lora, serif', fontWeight: 600,
              fontSize: 14, color: '#0f172a', marginBottom: 6,
            }}>
              Sign up to see how you rank globally, track your progress <br />and compete on the global leaderboard.
            </div>
            </div>
       
        </div>
      )}

    </div>
  )
}
