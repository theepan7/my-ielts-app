// src/components/Leaderboard.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchLeaderboard,
  fetchCountryLeaderboard,
  fetchUserRank,
} from '../firebase/services'

const AV_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
  '#059669','#be185d','#0ea5e9','#65a30d','#a16207',
]

// ── Single leaderboard row ─────────────────────────────────
function LbRow({ entry, index, isMe, showFlag }) {
  const medal =
    entry.rank === 1 ? '👑' :
    entry.rank === 2 ? '🥈' :
    entry.rank === 3 ? '🥉' :
    entry.rank

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', borderRadius: 8,
      background: isMe
        ? '#eff4ff'
        : entry.rank === 1 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
        : '#f8fafc',
      border: `1px solid ${isMe ? '#93c5fd' : entry.rank === 1 ? '#fde68a' : 'transparent'}`,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: 'center',
        color: entry.rank === 1 ? '#d97706'
          : entry.rank === 2 ? '#64748b'
          : entry.rank === 3 ? '#92400e'
          : '#94a3b8',
      }}>{medal}</span>

      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: AV_COLORS[index % AV_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff',
      }}>
        {(entry.userName || 'U').slice(0, 2).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: '#0f172a',
          display: 'flex', alignItems: 'center', gap: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {showFlag && entry.countryFlag && entry.countryFlag !== '🌍' && (
            <span style={{ fontSize: 13, flexShrink: 0 }}>{entry.countryFlag}</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.userName}
          </span>
          {isMe && (
            <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
              (you)
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
          {entry.avgBand || '—'}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>avg band</div>
      </div>
    </div>
  )
}

// ── Loading skeletons ──────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 42, borderRadius: 8,
          background: '#f1f5f9', opacity: 1 - i * 0.15,
        }} />
      ))}
    </div>
  )
}

// ── Global rank banner ─────────────────────────────────────
function GlobalRankBanner({ globalRank, totalStudents, onClose }) {
  const motivationMsg =
    globalRank <= 10   ? '🏆 Incredible — you are in the global top 10!'  :
    globalRank <= 50   ? '🌟 Amazing — you are in the global top 50!'      :
    globalRank <= 100  ? '⭐ Great — you are in the global top 100!'       :
    globalRank <= 500  ? '🔥 You are in the global top 500 — keep going!' :
    globalRank <= 1000 ? '💪 You are in the top 1,000 worldwide!'          :
    '📈 Complete more tests to climb higher in the global ranks!'

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
      borderRadius: 10, padding: '16px 16px 14px',
      marginTop: 10, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -14, right: -14,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,.07)', pointerEvents: 'none',
      }} />
      <button onClick={onClose} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'rgba(255,255,255,.15)', border: 'none',
        borderRadius: '50%', width: 20, height: 20,
        color: '#fff', cursor: 'pointer', fontSize: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
      <div style={{
        fontSize: 10, color: 'rgba(255,255,255,.65)',
        textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6,
      }}>
        🌍 Your Global Standing
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
        <span style={{
          fontFamily: 'Lora, serif', fontSize: '2rem',
          fontWeight: 700, color: '#fff', lineHeight: 1,
        }}>
          #{globalRank?.toLocaleString() || '—'}
        </span>
        {totalStudents && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>
            out of {totalStudents.toLocaleString()}+ students
          </span>
        )}
      </div>
      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.8)', margin: 0, lineHeight: 1.5 }}>
        {motivationMsg}
      </p>
    </div>
  )
}

// ── Main Leaderboard ───────────────────────────────────────
export default function Leaderboard() {
  const { user } = useAuth()

  // Tracks whether the initial load has completed.
  // Background refreshes (interval / manual ↻) must NEVER reset view or showBanner —
  // those are user-controlled state after the first load.
  const initialLoadDone = useRef(false)

  const [view,           setView]           = useState('global')
  const [globalEntries,  setGlobalEntries]  = useState([])
  const [countryEntries, setCountryEntries] = useState([])
  const [userRankData,   setUserRankData]   = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [showBanner,     setShowBanner]     = useState(false)

  const isLoggedIn  = !!user
  const countryCode = userRankData?.countryCode || ''
  const countryName = userRankData?.countryName || ''
  const countryFlag = userRankData?.countryFlag || ''
  const hasCountry  = isLoggedIn && countryCode.length > 0

  async function load(isInitial = false) {
    try {
      // Always refresh the data arrays
      const global = await fetchLeaderboard()
      setGlobalEntries(global)

      if (isLoggedIn) {
        const ur = await fetchUserRank(user.uid)
        setUserRankData(ur)
        if (ur?.countryCode) {
          const countryList = await fetchCountryLeaderboard(ur.countryCode)
          setCountryEntries(countryList)
        }
        // Only set view on initial load — never override user's manual choice
        if (isInitial) {
          setView(ur?.countryCode ? 'country' : 'global')
        }
      } else {
        setUserRankData(null)
        if (isInitial) setView('global')
      }
    } catch (err) {
      console.error('Leaderboard load error:', err)
      if (isInitial) setView('global')
    } finally {
      if (isInitial) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
  }

  useEffect(() => {
    // Reset everything when user changes (login / logout)
    initialLoadDone.current = false
    setLoading(true)
    setShowBanner(false)
    load(true)

    const interval = setInterval(() => load(false), 60_000)
    return () => clearInterval(interval)
  }, [user?.uid])

  const entries     = view === 'country' ? countryEntries : globalEntries
  const userInTop10 = isLoggedIn && entries.some(e => e.userId === user?.uid)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(15,23,42,.07)',
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
          🏆{' '}
          {view === 'country' && hasCountry
            ? `${countryFlag} ${countryName} Ranking`
            : 'Global Leaderboard'}
        </span>
        {/* Manual refresh: data only — never resets view */}
        <button onClick={() => load(false)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, color: '#2563eb', fontWeight: 600,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>↻</button>
      </div>

      {/* ── Content ── */}
      {loading ? <Skeleton /> : (
        <>
          {entries.length === 0 ? (
            <p style={{
              fontSize: 12, color: '#94a3b8',
              textAlign: 'center', padding: '16px 0',
            }}>
              {view === 'country' && hasCountry
                ? `No ${countryName} rankings yet — be the first! 🎯`
                : 'No scores yet — complete a test to appear here! 🎯'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {entries.map((e, i) => (
                <LbRow
                  key={e.userId || i}
                  entry={e}
                  index={i}
                  isMe={isLoggedIn && e.userId === user?.uid}
                  showFlag={view === 'global'}
                />
              ))}

              {/* User's own row if outside top 10 */}
              {isLoggedIn && !userInTop10 && userRankData && (
                <>
                  <div style={{
                    textAlign: 'center', color: '#94a3b8',
                    fontSize: 11, padding: '2px 0',
                  }}>· · ·</div>
                  <LbRow
                    entry={{
                      ...userRankData,
                      rank: view === 'country'
                        ? (userRankData.countryRank || '—')
                        : (userRankData.globalRank  || '—'),
                    }}
                    index={9}
                    isMe={true}
                    showFlag={view === 'global'}
                  />
                </>
              )}
            </div>
          )}

          {/* ── CTA: country → global ── */}
          {isLoggedIn && hasCountry && view === 'country' && (
            <button
              onClick={() => { setView('global'); setShowBanner(true) }}
              style={{
                width: '100%', marginTop: 12, padding: '11px 14px',
                borderRadius: 9, border: '1.5px solid #bfdbfe',
                background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all .18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.background  = '#eff4ff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#bfdbfe'
                e.currentTarget.style.background  = 'linear-gradient(135deg,#eff4ff,#f5f3ff)'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                🌍 Check Your Global Ranking
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                See how you rank among all students worldwide
              </div>
            </button>
          )}

          {/* ── Global view: rank banner + back to country ── */}
          {view === 'global' && (
            <>
              {isLoggedIn && showBanner && userRankData?.globalRank && (
                <GlobalRankBanner
                  globalRank={userRankData.globalRank}
                  totalStudents={userRankData.totalStudents}
                  onClose={() => setShowBanner(false)}
                />
              )}

              {isLoggedIn && hasCountry && (
                <button
                  onClick={() => { setView('country'); setShowBanner(false) }}
                  style={{
                    width: '100%', marginTop: 10, padding: '9px',
                    borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#f8fafc', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#475569',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'all .16s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  {countryFlag} Back to {countryName} Rankings
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 9,
        textAlign: 'center', fontSize: 10, color: '#94a3b8',
      }}>
        {view === 'country' && hasCountry
          ? `Top 10 in ${countryName} · Ranked by average band score`
          : 'Top 10 worldwide · Ranked by average band score · Updates after each test'}
      </div>
    </div>
  )
}
