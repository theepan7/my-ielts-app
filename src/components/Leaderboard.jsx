// src/components/Leaderboard.jsx
// Shows top 10 for a SPECIFIC test.
// Sorted by: correct answers DESC, then time elapsed ASC (faster wins ties)
// Usage: <Leaderboard testId={1} testTitle="IELTS Listening Test 1" />

import React, { useEffect, useState } from 'react'
import { useAuth }  from '../context/AuthContext'
import { fetchTestLeaderboard, fetchUserTestEntry, fmtTime } from '../firebase/services'

const AV_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
  '#059669','#be185d','#0ea5e9','#65a30d','#a16207',
]

// ── Medal / rank display ──────────────────────────────────
function rankDisplay(rank) {
  if (rank === 1) return { icon: '👑', color: '#d97706' }
  if (rank === 2) return { icon: '🥈', color: '#64748b' }
  if (rank === 3) return { icon: '🥉', color: '#92400e' }
  return { icon: String(rank), color: '#94a3b8' }
}

// ── Single row ────────────────────────────────────────────
function LbRow({ entry, index, isMe }) {
  const { icon, color } = rankDisplay(entry.rank)

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

      {/* Rank */}
      <span style={{
        fontSize: entry.rank <= 3 ? 14 : 11,
        fontWeight: 700, minWidth: 22, textAlign: 'center', color,
      }}>
        {icon}
      </span>

      {/* Avatar */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: AV_COLORS[index % AV_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff',
      }}>
        {(entry.userName || 'U').slice(0, 2).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {entry.countryFlag && (
            <span style={{ fontSize: 12, flexShrink: 0 }}>{entry.countryFlag}</span>
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

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
          {entry.correct}/{entry.total || 40}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>correct</div>
      </div>

      {/* Time — tiebreaker indicator */}
      <div style={{
        textAlign: 'right', flexShrink: 0, minWidth: 44,
        paddingLeft: 6, borderLeft: '1px solid #f1f5f9',
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#7c3aed' }}>
          {fmtTime(entry.elapsed)}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>time</div>
      </div>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 44, borderRadius: 8, background: '#f1f5f9',
          opacity: 1 - i * 0.15,
        }} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────
// testId   — the numeric test ID (e.g. 1)
// testTitle — e.g. "IELTS Listening Test 1"
// compact  — if true, shows fewer rows (for sidebar use)

export default function Leaderboard({ testId, testTitle, compact = false }) {
  const { user } = useAuth()

  const [entries,    setEntries]    = useState([])
  const [userEntry,  setUserEntry]  = useState(null)
  const [loading,    setLoading]    = useState(true)

  async function load() {
    if (!testId) return
    setLoading(true)
    try {
      const [lb, ue] = await Promise.all([
        fetchTestLeaderboard(testId),
        user ? fetchUserTestEntry(testId, user.uid) : Promise.resolve(null),
      ])
      setEntries(lb)
      setUserEntry(ue)
    } catch (err) {
      console.error('Leaderboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [testId, user?.uid])

  const userInTop10 = user && entries.some(e => e.userId === user?.uid)
  const showRows    = compact ? entries.slice(0, 5) : entries

  const testNum = String(testId).padStart(2, '0')

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(15,23,42,.07)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{
            fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.07em', color: '#94a3b8', marginBottom: 2,
          }}>
            🏆 Top 10 Students
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Test {testNum}
          </div>
          {testTitle && (
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
              {testTitle}
            </div>
          )}
        </div>
        <button
          onClick={load}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: '#2563eb', fontWeight: 600,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            padding: '2px 6px',
          }}
        >
          ↻
        </button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 10px 6px', gap: 8,
        borderBottom: '1px solid #f1f5f9', marginBottom: 6,
      }}>
        <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 22 }}>#</span>
        <span style={{ fontSize: 10, color: '#94a3b8', width: 26, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>Student</span>
        <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', minWidth: 50 }}>Score</span>
        <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', minWidth: 50, paddingLeft: 6 }}>Time ⏱</span>
      </div>

      {/* Tiebreaker note */}
      <div style={{
        fontSize: 10.5, color: '#94a3b8', marginBottom: 8, fontStyle: 'italic',
      }}>
        Tied scores ranked by fastest completion time
      </div>

      {/* Entries */}
      {loading ? <Skeleton /> : (
        <>
          {entries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '20px 0',
              fontSize: 12.5, color: '#94a3b8',
            }}>
              No scores yet for this test — be the first! 🎯
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {showRows.map((e, i) => (
                <LbRow
                  key={e.userId || i}
                  entry={e}
                  index={i}
                  isMe={!!user && e.userId === user?.uid}
                />
              ))}

              {/* User's own row if outside top 10 */}
              {!compact && user && !userInTop10 && userEntry && (
                <>
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: '2px 0' }}>
                    · · ·
                  </div>
                  <LbRow
                    entry={userEntry}
                    index={9}
                    isMe={true}
                  />
                </>
              )}
            </div>
          )}

          {/* User's rank summary box */}
          {user && userEntry && (
            <div style={{
              marginTop: 12,
              background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)',
              border: '1.5px solid #bfdbfe',
              borderRadius: 9, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                Your Best on Test {testNum}
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Rank</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#7c3aed' }}>
                    #{userEntry.rank}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Score</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>
                    {userEntry.correct}/{userEntry.total || 40}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Band</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#d97706' }}>
                    {userEntry.band || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Time</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#7c3aed' }}>
                    {fmtTime(userEntry.elapsed)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 9,
        textAlign: 'center', fontSize: 10, color: '#94a3b8',
      }}>
        Score ties broken by fastest completion · Updates after each attempt
      </div>
    </div>
  )
}
