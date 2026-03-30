// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchTests, fetchUserCompletedTests,
  fetchLeaderboard, fetchUserRank
} from '../firebase/services'
import Leaderboard from '../components/Leaderboard'

const diffStyle = d =>
  d === 'Advanced'    ? { color: '#dc2626' } :
  d === 'Intermediate'? { color: '#059669' } :
                        { color: '#d97706' }

const PER_PAGE = 12

export default function HomePage({ onAuthClick, showToast }) {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const catParam      = params.get('cat') || 'all'

  const [allTests,  setAllTests]  = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [completed, setCompleted] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [userRank,  setUserRank]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [diff,      setDiff]      = useState('')
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)

  // ── Load tests ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchTests()
      .then(data => { setAllTests(data); setFiltered(data) })
      .catch(() => setAllTests([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Load user progress ──────────────────────────────────
  useEffect(() => {
    if (!user) { setCompleted([]); setUserRank(null); return }
    fetchUserCompletedTests(user.uid).then(setCompleted).catch(() => {})
    fetchUserRank(user.uid).then(setUserRank).catch(() => {})
  }, [user])

  // ── Filter ──────────────────────────────────────────────
  useEffect(() => {
    let list = [...allTests]
    // Category from URL param (set by navbar dropdown)
    if (catParam !== 'all') list = list.filter(t => t.category === catParam)
    if (search) list = list.filter(t =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.topic?.toLowerCase().includes(search.toLowerCase())
    )
    if (diff)   list = list.filter(t => t.difficulty === diff)
    if (status === 'free')      list = list.filter(t => t.isFree)
    if (status === 'completed') list = list.filter(t => completed.includes(t.id))
    setFiltered(list)
    setPage(1)
  }, [catParam, search, diff, status, allTests, completed])

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

  // Progress ring values
  const done   = completed.length
  const total  = allTests.length || 100
  const pct    = Math.round((done / total) * 100)
  const R = 28, C = 2 * Math.PI * R
  const offset = C - (C * pct / 100)

  // Section label
  const sectionLabel =
    catParam === 'academic' ? 'Academic Tests' :
    catParam === 'general'  ? 'General Training Tests' :
    'All Tests'

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* ── HERO ── */}
  <div style={{
  background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
  padding: '28px 20px 26px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}}>
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 25% 60%,rgba(255,255,255,.05),transparent 60%)'
  }} />

  <div style={{ maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 1 }}>

    {/* Badge */}
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255,255,255,.12)',
      border: '1px solid rgba(255,255,255,.18)',
      color: 'rgba(255,255,255,.85)',
      borderRadius: 20,
      padding: '3px 12px',
      fontSize: 11,
      fontWeight: 500,
      marginBottom: 10,
    }}>
      ✦ Updated for 2026 Exams
    </div>

    {/* Title */}
    <h1 style={{
      fontFamily: 'Lora, serif',
      fontSize: '1.6rem',
      fontWeight: 600,
      color: '#fff',
      lineHeight: 1.25,
      marginBottom: 6,
    }}>
      Master Your IELTS Listening
    </h1>

    {/* Subtitle */}
    <p style={{
      color: 'rgba(255,255,255,.7)',
      fontSize: 13,
      marginBottom: 16,
    }}>
      Practice with real exam simulations and hit Band 8.0+ faster
    </p>

    {/* Stats (more compact) */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 20,
      flexWrap: 'wrap'
    }}>
      {[['120+','Full Tests'],['Free','Access'],['98%','Success Rate']].map(([n, l]) => (
        <div key={l} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Lora,serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#fff'
          }}>
            {n}
          </div>
          <div style={{
            fontSize: 10.5,
            color: 'rgba(255,255,255,.6)',
            marginTop: 1
          }}>
            {l}
          </div>
        </div>
      ))}
    </div>

  </div>
</div>
  

    
      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '24px 20px',
        display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start',
      }}>

        {/* LEFT — test list */}
        <div>

          {/* Search + filter row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              style={{
                flex: 1, minWidth: 160, background: '#fff',
                border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '9px 14px', fontSize: 13, outline: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#0f172a',
                boxShadow: '0 1px 3px rgba(15,23,42,.07)',
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
                boxShadow: '0 1px 3px rgba(15,23,42,.07)',
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
                boxShadow: '0 1px 3px rgba(15,23,42,.07)',
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
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {sectionLabel} — {filtered.length} available
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Test grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 11 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: 140, background: '#fff', borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }} />
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              No tests found.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
              gap: 11, marginBottom: 20,
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
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
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

          {/* Leaderboard */}
          <Leaderboard />

          {/* Progress / Signup wall */}
          {!user ? (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 16, textAlign: 'center',
              boxShadow: '0 1px 3px rgba(15,23,42,.07)',
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>🔓</div>
              <h3 style={{ fontFamily: 'Lora,serif', fontSize: '.95rem', fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>
                Unlock All 100 Tests
              </h3>
              <p style={{ color: '#475569', fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>
                Sign up free to access the full test library, track your progress, and appear on the global leaderboard.
              </p>
              <button onClick={() => onAuthClick('signup')} style={{
                width: '100%', padding: 9, borderRadius: 7,
                background: '#2563eb', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', border: 'none', marginBottom: 7,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Create Free Account
              </button>
              <button onClick={() => onAuthClick('login')} style={{
                width: '100%', padding: 9, borderRadius: 7,
                background: 'transparent', color: '#475569', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid #e2e8f0',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                I already have an account
              </button>
              <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6 }}>No credit card required</p>
            </div>
          ) : (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 16,
              boxShadow: '0 1px 3px rgba(15,23,42,.07)',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12 }}>
                📊 Your Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                {/* Ring */}
                <svg width="72" height="72" style={{ flexShrink: 0 }}>
                  <circle cx="36" cy="36" r={R} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="36" cy="36" r={R} fill="none"
                    stroke="url(#pg)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={C.toFixed(1)} strokeDashoffset={offset.toFixed(1)}
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
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 2 }}>Tests Completed</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {done}<span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> / {total}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 8, marginBottom: 2 }}>Your Rank</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#d97706' }}>
                    {userRank ? `#${userRank.rank}` : '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8', marginBottom: 4 }}>
                <span>Overall Progress</span><span>{done}/{total}</span>
              </div>
              <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
                  borderRadius: 3, transition: 'width .7s',
                }} />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ── TEST CARD ─────────────────────────────────────────────
function TestCard({ test, isDone, isLocked, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${isDone ? '#bbf7d0' : hovered ? '#93c5fd' : '#e2e8f0'}`,
        borderRadius: 12, padding: '16px 17px', cursor: 'pointer',
        transition: 'all .2s', position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? '0 4px 16px rgba(15,23,42,.1)' : '0 1px 3px rgba(15,23,42,.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Top colour stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
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
        <span style={{
          ...diffStyle(test.difficulty),
          fontSize: 10.5, background: '#f8fafc',
          padding: '2px 8px', borderRadius: 20, fontWeight: 600,
        }}>
          {test.difficulty}
        </span>
      </div>

      {/* Lock overlay */}
      {isLocked && hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: 'rgba(248,250,252,.85)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
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
      borderRadius: 20, fontSize: 10.5, color: '#475569',
    }}>
      {children}
    </span>
  )
}

function PgnBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
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
    }}>
      {children}
    </button>
  )
}
