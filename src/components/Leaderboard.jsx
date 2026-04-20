// src/components/Leaderboard.jsx
// Two variants:
//  1. <ResultLeaderboard testId={1} />        — ResultPage right column, full top 10 + user rank
//  2. <HomeLeaderboard />                     — HomePage sidebar, top 5, ranked by avg band

import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchTestLeaderboard,
  fetchUserTestEntry,
  fetchHomeLeaderboard,
  fmtTime,
} from '../firebase/services'

const AV_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
  '#059669','#be185d','#0ea5e9','#65a30d','#a16207',
]

function rankIcon(rank) {
  if (rank === 1) return { icon: '👑', color: '#d97706' }
  if (rank === 2) return { icon: '🥈', color: '#94a3b8' }
  if (rank === 3) return { icon: '🥉', color: '#92400e' }
  return { icon: String(rank), color: '#94a3b8' }
}

function Avatar({ name, index }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: AV_COLORS[index % AV_COLORS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color: '#fff',
    }}>
      {(name || 'U').slice(0, 2).toUpperCase()}
    </div>
  )
}

function SkeletonRows({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ height: 42, borderRadius: 8, background: '#f1f5f9', opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ── Shared row for result page leaderboard ──────────────
function TestLbRow({ entry, index, isMe }) {
  const { icon, color } = rankIcon(entry.rank)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '7px 9px', borderRadius: 8,
      background: isMe
        ? '#eff4ff'
        : entry.rank === 1 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
        : '#f8fafc',
      border: `1px solid ${isMe ? '#93c5fd' : entry.rank === 1 ? '#fde68a' : 'transparent'}`,
    }}>
      <span style={{ fontSize: entry.rank <= 3 ? 13 : 11, fontWeight: 700, minWidth: 20, textAlign: 'center', color }}>
        {icon}
      </span>

      <Avatar name={entry.userName} index={index} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        {entry.countryFlag && <span style={{ fontSize: 12, flexShrink: 0 }}>{entry.countryFlag}</span>}
        <span style={{
          fontSize: 12.5, fontWeight: 600, color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {entry.userName}
          {isMe && <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 400, marginLeft: 3 }}>(you)</span>}
        </span>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb' }}>
          {entry.correct}<span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>/40</span>
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>{entry.band || '—'}</div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 38, paddingLeft: 6, borderLeft: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed' }}>{fmtTime(entry.elapsed)}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>time</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  1. RESULT PAGE LEADERBOARD — full top 10 + user rank
//  FIX: waits 2 seconds before first fetch so Firestore
//  write from saveResult has time to propagate
// ─────────────────────────────────────────────────────────
export function ResultLeaderboard({ testId, testTitle }) {
  const { user }                  = useAuth()
  const [entries,   setEntries]   = useState([])
  const [userEntry, setUserEntry] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [waitMsg,   setWaitMsg]   = useState('Updating leaderboard…')

  const testNum = String(testId || '').padStart(2, '0')

  useEffect(() => {
    if (!testId) return

    // Wait 2 seconds for Firestore write to propagate before reading
    const delay = setTimeout(async () => {
      setWaitMsg('')
      setLoading(true)
      try {
        const [lb, ue] = await Promise.all([
          fetchTestLeaderboard(testId, 10),
          user ? fetchUserTestEntry(testId, user.uid) : Promise.resolve(null),
        ])
        setEntries(lb)
        setUserEntry(ue)
      } catch (err) {
        console.error('HomeLeaderboard error:', err)
      } finally {
        setLoading(false)
      }
    }, 2000)  // 2 second delay

    return () => clearTimeout(delay)
  }, [testId, user?.uid])

  async function refresh() {
    setLoading(true)
    try {
      const [lb, ue] = await Promise.all([
        fetchTestLeaderboard(testId, 10),
        user ? fetchUserTestEntry(testId, user.uid) : Promise.resolve(null),
      ])
      setEntries(lb)
      setUserEntry(ue)
    } catch (_) {} finally { setLoading(false) }
  }

  const userInTop10 = user && entries.some(e => e.userId === user?.uid)

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(15,23,42,.08)', position: 'sticky', top: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 3 }}>
            🏆 Top 10 Students
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Test {testNum}</div>
          {testTitle && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{testTitle}</div>}
        </div>
        <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#2563eb', fontWeight: 600, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Column labels */}
      <div style={{ display: 'flex', gap: 7, padding: '0 9px 7px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
        <span style={{ fontSize: 9.5, color: '#94a3b8', minWidth: 20 }}>#</span>
        <span style={{ fontSize: 9.5, color: '#94a3b8', width: 26, flexShrink: 0 }} />
        <span style={{ fontSize: 9.5, color: '#94a3b8', flex: 1 }}>Student</span>
        <span style={{ fontSize: 9.5, color: '#94a3b8', minWidth: 42, textAlign: 'right' }}>Score</span>
        <span style={{ fontSize: 9.5, color: '#94a3b8', minWidth: 38, textAlign: 'right', paddingLeft: 6 }}>Time ⏱</span>
      </div>

      <div style={{ fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 }}>
        Ties resolved by fastest completion time
      </div>

      {/* Updating notice */}
      {waitMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#eff4ff', borderRadius: 8, marginBottom: 10, fontSize: 12, color: '#2563eb' }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
          {waitMsg}
        </div>
      )}

      {loading ? <SkeletonRows count={5} /> : (
        <>
          {entries.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
              No scores yet for this test — you could be #1! 🎯
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {entries.map((e, i) => (
                <TestLbRow key={e.userId || i} entry={e} index={i} isMe={!!user && e.userId === user?.uid} />
              ))}
              {user && !userInTop10 && userEntry && (
                <>
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>· · ·</div>
                  <TestLbRow entry={userEntry} index={9} isMe={true} />
                </>
              )}
            </div>
          )}

          {/* User rank summary */}
          {user && userEntry && (
            <div style={{ marginTop: 12, background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)', border: '1.5px solid #bfdbfe', borderRadius: 9, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                Your Best on Test {testNum}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                {[
                  { label: 'Rank',  value: `#${userEntry.rank}`,       color: '#7c3aed' },
                  { label: 'Score', value: `${userEntry.correct}/40`,   color: '#2563eb' },
                  { label: 'Band',  value: userEntry.band  || '—',      color: '#d97706' },
                  { label: 'Time',  value: fmtTime(userEntry.elapsed),  color: '#7c3aed' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 10, paddingTop: 9, borderTop: '1px solid #f1f5f9', fontSize: 9.5, color: '#94a3b8', textAlign: 'center' }}>
        Score ties broken by fastest time · Click ↻ to refresh
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  2. HOME PAGE LEADERBOARD — top 5 by avg band
// ─────────────────────────────────────────────────────────
export function HomeLeaderboard() {
  const { user }               = useAuth()
  const [entries, setEntries]  = useState([])
  const [loading, setLoading]  = useState(true)

  async function load() {
    setLoading(true)
    try {
      const lb = await fetchHomeLeaderboard()
      setEntries(lb)
    } catch (_) {} finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(15,23,42,.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 1 }}>
            🏆 Top Students
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Highest avg band · Most tests</div>
        </div>
        <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#2563eb', fontWeight: 600, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>↻</button>
      </div>

      {loading ? <SkeletonRows count={3} /> : (
        entries.length === 0 ? (
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '14px 0' }}>
            No scores yet — be first! 🎯
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.map((e, i) => {
              const { icon, color } = rankIcon(e.rank)
              const isMe = !!user && e.userId === user?.uid
              return (
                <div key={e.userId || i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 9px', borderRadius: 8,
                  background: isMe ? '#eff4ff' : e.rank === 1 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8fafc',
                  border: `1px solid ${isMe ? '#93c5fd' : e.rank === 1 ? '#fde68a' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: e.rank <= 3 ? 13 : 11, fontWeight: 700, minWidth: 20, textAlign: 'center', color }}>{icon}</span>
                  <Avatar name={e.userName} index={i} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.countryFlag && <span style={{ fontSize: 12, flexShrink: 0 }}>{e.countryFlag}</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.userName}
                        {isMe && <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 400, marginLeft: 3 }}>(you)</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{e.testsCompleted || 0} tests</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{e.avgBand || '—'}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>avg band</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 10, paddingTop: 9, textAlign: 'center', fontSize: 9.5, color: '#94a3b8' }}>
        Top 5 · Ranked by avg band score · Real users only
      </div>
    </div>
  )
}

// Default export for backward compatibility
export default HomeLeaderboard
