import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTests, fetchUserCompletedTests, fetchLeaderboard, fetchUserRank } from '../firebase/services'

// ── Difficulty colour ─────────────────────────────────────
const diffStyle = d => d === 'Advanced'
  ? { color: '#dc2626' }
  : d === 'Intermediate'
    ? { color: '#059669' }
    : { color: '#d97706' }

// ── Avatar colours for leaderboard ───────────────────────
const AV_COLORS = ['#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
                   '#059669','#be185d','#0ea5e9','#65a30d','#7c3aed']

const PER_PAGE = 12

export default function HomePage({ onAuthClick, showToast }) {
  const { user }          = useAuth()
  const navigate          = useNavigate()
  const [params]          = useSearchParams()

  const [allTests,   setAllTests]   = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [completed,  setCompleted]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [lbEntries,  setLbEntries]  = useState([])
  const [userRank,   setUserRank]   = useState(null)
  const [cat,        setCat]        = useState(params.get('cat') || 'all')
  const [search,     setSearch]     = useState('')
  const [diff,       setDiff]       = useState('')
  const [status,     setStatus]     = useState('')
  const [page,       setPage]       = useState(1)

  // ── Load tests from Firestore ───────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchTests()
      .then(data => {
        setAllTests(data)
        setFiltered(data)
      })
      .catch(() => setAllTests([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Load leaderboard ────────────────────────────────────
  useEffect(() => {
    fetchLeaderboard()
      .then(setLbEntries)
      .catch(() => {})
  }, [])

  // ── Load user rank + completed tests ────────────────────
  useEffect(() => {
    if (!user) { setCompleted([]); setUserRank(null); return }
    fetchUserCompletedTests(user.uid).then(setCompleted).catch(() => {})
    fetchUserRank(user.uid).then(setUserRank).catch(() => {})
  }, [user])

  // ── Sync cat from URL ───────────────────────────────────
  useEffect(() => {
    setCat(params.get('cat') || 'all')
  }, [params])

  // ── Filter tests ────────────────────────────────────────
  useEffect(() => {
    let list = [...allTests]
    if (cat !== 'all') list = list.filter(t => t.category === cat)
    if (search)        list = list.filter(t =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.topic?.toLowerCase().includes(search.toLowerCase())
    )
    if (diff)   list = list.filter(t => t.difficulty === diff)
    if (status === 'free')      list = list.filter(t => t.isFree)
    if (status === 'completed') list = list.filter(t => completed.includes(t.id))
    setFiltered(list)
    setPage(1)
  }, [cat, search, diff, status, allTests, completed])

  function handleTestClick(test) {
    if (!test.isFree && !user) {
      showToast('Sign up free to unlock all 100 tests', 'error')
      onAuthClick('signup')
      return
    }
    navigate(`/test/${test.docId}`)
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const counts = {
    all:      allTests.length,
    academic: allTests.filter(t => t.category === 'academic').length,
    general:  allTests.filter(t => t.category === 'general').length,
  }

  const catLabel = cat === 'academic' ? 'Academic Tests'
    : cat === 'general' ? 'General Training Tests' : 'All Tests'

  // ── Progress ring ───────────────────────────────────────
  const done   = completed.length
  const pct    = Math.round((done / Math.max(allTests.length, 1)) * 100)
  const R      = 28
  const C      = 2 * Math.PI * R
  const offset = C - (C * pct / 100)

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        padding: '48px 28px 42px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: 'rgba(255,255,255,.85)', borderRadius: 20, padding: '4px 14px',
            fontSize: 11.5, fontWeight: 500, marginBottom: 14
          }}>
            ✦ 100 Full-Length Practice Tests
          </div>
          <h1 style={{
            fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 600,
            color: '#fff', lineHeight: 1.2, marginBottom: 8
          }}>
            Master IELTS Listening
          </h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, marginBottom: 22 }}>
            Authentic recordings · Real exam questions · Instant band score results
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 30, flexWrap: 'wrap' }}>
            {[['100','Tests Available'],['4,000+','Questions'],['9.0','Max Band']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Lora,serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '24px 20px',
        display: 'grid', gridTemplateColumns: '1fr 288px', gap: 20, alignItems: 'start'
      }}>

        {/* LEFT — test list */}
        <div>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { id: 'all',      label: 'All Tests',        icon: '📋' },
              { id: 'academic', label: 'Academic',         icon: '📚' },
              { id: 'general',  label: 'General Training', icon: '📺' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8, fontSize: 12.5,
                  fontWeight: 600, cursor: 'pointer', transition: 'all .16s',
                  border: cat === c.id ? 'none' : '1.5px solid #e2e8f0',
                  background: cat === c.id
                    ? c.id === 'academic' ? '#7c3aed'
                      : c.id === 'general' ? '#0891b2' : '#2563eb'
                    : '#fff',
                  color: cat === c.id ? '#fff' : '#64748b',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {c.icon} {c.label}
                <span style={{
                  background: cat === c.id ? 'rgba(255,255,255,.22)' : '#f1f5f9',
                  color: cat === c.id ? '#fff' : '#94a3b8',
                  borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700
                }}>
                  {counts[c.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Search + filter row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              style={{
                flex: 1, minWidth: 160, background: '#fff',
                border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '9px 14px', fontSize: 13, outline: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#0f172a',
                boxShadow: '0 1px 3px rgba(15,23,42,.07)'
              }}
              placeholder="🔍  Search by topic or test name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              style={{
                background: '#fff', border: '1px solid #e2e8f0', color: '#475569',
                borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 1px 3px rgba(15,23,42,.07)'
              }}
              value={diff} onChange={e => setDiff(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option>Intermediate</option>
              <option>Upper-Intermediate</option>
              <option>Advanced</option>
            </select>
            <select
              style={{
                background: '#fff', border: '1px solid #e2e8f0', color: '#475569',
                borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 1px 3px rgba(15,23,42,.07)'
              }}
              value={status} onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="free">Free Only</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Section label */}
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {catLabel} — {filtered.length} available
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Test grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 11 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: 140, background: '#fff', borderRadius: 12,
                  border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite'
                }} />
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              No tests found matching your search.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
              gap: 11, marginBottom: 20
            }}>
              {slice.map(test => (
                <TestCard
                  key={test.docId || test.id}
                  test={test}
                  isDone={completed.includes(test.id)}
                  isLocked={!test.isFree && !user}
                  onClick={() => handleTestClick(test)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              <PgnBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PgnBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '…'
                    ? <span key={`d${i}`} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>…</span>
                    : <PgnBtn key={n} active={page === n} onClick={() => { setPage(n); window.scrollTo({ top: 200, behavior: 'smooth' }) }}>{n}</PgnBtn>
                )}
              <PgnBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</PgnBtn>
            </div>
          )}
        </div>

        {/* RIGHT — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

          {/* Leaderboard */}
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(15,23,42,.07)'
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12 }}>
              🏆 Global Leaderboard
            </div>
            {lbEntries.length === 0 ? (
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
                No results yet — be first! 🎯
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lbEntries.map((e, i) => (
                  <div key={e.userId || i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 9px', borderRadius: 8,
                    background: i === 0 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8fafc',
                    border: `1px solid ${user && e.userId === user.uid ? '#93c5fd' : i === 0 ? '#fde68a' : 'transparent'}`,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, minWidth: 18, textAlign: 'center', color: '#94a3b8' }}>
                      {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: AV_COLORS[i % AV_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>
                      {(e.userName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.userName}
                        {user && e.userId === user.uid && <span style={{ color: '#2563eb', fontSize: 10 }}> (you)</span>}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{e.testsCompleted} tests</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{e.avgBand}</div>
                      <div style={{ fontSize: 9, color: '#94a3b8' }}>avg band</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 10, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
              Top 10 · All-time · Ranked by avg band score
            </div>
          </div>

          {/* Progress / Signup wall */}
          {!user ? (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 16, textAlign: 'center',
              boxShadow: '0 1px 3px rgba(15,23,42,.07)'
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>🔓</div>
              <h3 style={{ fontFamily: 'Lora,serif', fontSize: '.95rem', fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>
                Unlock All 100 Tests
              </h3>
              <p style={{ color: '#475569', fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>
                Sign up free to access the full test library, track your progress, and appear on the global leaderboard.
              </p>
              <button
                onClick={() => onAuthClick('signup')}
                style={{
                  width: '100%', padding: '9px', borderRadius: 7,
                  background: '#2563eb', color: '#fff', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', border: 'none',
                  marginBottom: 7, fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}
              >
                Create Free Account
              </button>
              <button
                onClick={() => onAuthClick('login')}
                style={{
                  width: '100%', padding: '9px', borderRadius: 7,
                  background: 'transparent', color: '#475569', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid #cbd5e1',
                  fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}
              >
                I already have an account
              </button>
              <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6 }}>No credit card required</p>
            </div>
          ) : (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 16,
              boxShadow: '0 1px 3px rgba(15,23,42,.07)'
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12 }}>
                📊 Your Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <svg width="72" height="72" style={{ flexShrink: 0 }}>
                  <circle cx="36" cy="36" r={R} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="36" cy="36" r={R} fill="none"
                    stroke="url(#pg)" strokeWidth="6" strokeLinecap="round"
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
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 2 }}>Completed</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {done}<span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> / {allTests.length}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 8, marginBottom: 2 }}>Your Rank</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#d97706' }}>
                    {userRank ? `#${userRank.rank}` : '—'}
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8', marginBottom: 4 }}>
                <span>Overall Progress</span><span>{done}/{allTests.length}</span>
              </div>
              <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: 3, transition: 'width .7s' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── TEST CARD ─────────────────────────────────────────────
function TestCard({ test, isDone, isLocked, onClick }) {
  const isAcad  = test.category === 'academic'
  const stripeColor = isAcad
    ? 'linear-gradient(90deg,#7c3aed,#a78bfa)'
    : 'linear-gradient(90deg,#0891b2,#22d3ee)'

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1px solid ${isDone ? '#bbf7d0' : isAcad ? '#e9d5ff' : '#a5f3fc'}`,
        borderRadius: 12, padding: '16px 17px', cursor: 'pointer',
        transition: 'all .2s', position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15,23,42,.07)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,.07)'
      }}
    >
      {/* Colour stripe at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: stripeColor
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Test #{test.id}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: isDone ? '#ecfdf5' : test.isFree ? '#ecfdf5' : '#eff4ff',
          color: isDone ? '#059669' : test.isFree ? '#059669' : '#2563eb',
          border: `1px solid ${isDone ? 'rgba(5,150,105,.18)' : test.isFree ? 'rgba(5,150,105,.18)' : 'rgba(37,99,235,.18)'}`,
        }}>
          {isDone ? '✓ Done' : test.isFree ? 'Free' : '🔒 Members'}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>
        {test.topic}
      </div>
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 10 }}>{test.title}</div>

      {/* Meta pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill>⏱ {test.duration || 30}m</Pill>
        <Pill>📝 {test.totalQuestions || 40} Qs</Pill>
        <span style={{ ...diffStyle(test.difficulty), fontSize: 10.5, background: '#f8fafc', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
          {test.difficulty}
        </span>
        <span style={{
          fontSize: 10.5, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
          background: isAcad ? '#f5f3ff' : '#ecfeff',
          color: isAcad ? '#7c3aed' : '#0891b2',
          border: `1px solid ${isAcad ? 'rgba(124,58,237,.18)' : 'rgba(8,145,178,.18)'}`,
        }}>
          {isAcad ? '📚 Academic' : '📺 General'}
        </span>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: 'rgba(248,250,252,.85)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity .18s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
        >
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            padding: '8px 14px', borderRadius: 8, fontSize: 12,
            color: '#475569', boxShadow: '0 4px 16px rgba(15,23,42,.1)',
          }}>
            🔒 Sign up free to unlock
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ children }) {
  return (
    <span style={{
      background: '#f1f5f9', padding: '2px 8px',
      borderRadius: 20, fontSize: 10.5, color: '#475569'
    }}>
      {children}
    </span>
  )
}

function PgnBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34, height: 34, borderRadius: 7,
        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#475569',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13, fontWeight: active ? 700 : 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? .35 : 1,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        boxShadow: '0 1px 3px rgba(15,23,42,.07)',
        transition: 'all .16s',
      }}
    >
      {children}
    </button>
  )
}
