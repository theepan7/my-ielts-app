// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchTests, fetchUserCompletedTests,
} from '../firebase/services'
import { HomeLeaderboard } from '../components/Leaderboard'
import UserProgress from '../components/UserProgress'

const diffStyle = d =>
  d === 'Advanced'    ? { color: '#dc2626' } :
  d === 'Intermediate'? { color: '#059669' } :
                        { color: '#d97706' }

const PER_PAGE = 9

export default function HomePage({ onAuthClick, showToast }) {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [params]    = useSearchParams()
  const catParam    = params.get('cat') || 'all'

  const [allTests,  setAllTests]  = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [completed, setCompleted] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [diff,      setDiff]      = useState('')
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)

  useEffect(() => {
    setLoading(true)
    fetchTests()
      .then(data => { setAllTests(data); setFiltered(data) })
      .catch(() => setAllTests([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) { setCompleted([]); return }
    fetchUserCompletedTests(user.uid).then(setCompleted).catch(() => {})
  }, [user])

  useEffect(() => {
    let list = [...allTests]
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

  const sectionLabel =
    catParam === 'academic' ? 'Academic Tests' :
    catParam === 'general'  ? 'General Training Tests' :
    'All Tests'

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        padding: '44px 28px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 60%,rgba(255,255,255,.06),transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: 'rgba(255,255,255,.85)', borderRadius: 20, padding: '4px 14px',
            fontSize: 11.5, fontWeight: 500, marginBottom: 5,
          }}>
            ✦ 200+ Full-Length Practice Tests
          </div>
          <h1 style={{ fontFamily: 'Lora,serif', fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            Master IELTS Listening
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginBottom: 14 }}>
            Authentic recordings · Real exam questions · Instant band score results
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
            {[['200+','Tests'],['8,000+','Questions'],['9.0','Max Band'],['5K+','Active Students']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Lora,serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '24px 20px',
        display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start',
      }}>

        {/* LEFT — tests */}
        <div>
          {/* Search + filters */}
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
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 1px 3px rgba(15,23,42,.07)' }}
              value={diff} onChange={e => setDiff(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option>Intermediate</option>
              <option>Upper-Intermediate</option>
              <option>Advanced</option>
            </select>
            <select
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 1px 3px rgba(15,23,42,.07)' }}
              value={status} onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="free">Free Only</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Section label */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {sectionLabel} — {filtered.length} available
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Test grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 11 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 140, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No tests found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 11, marginBottom: 18 }}>
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
                  if (idx > 0 && n - arr[idx-1] > 1) acc.push('…')
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
          {/* Top 5 global leaderboard */}
          <HomeLeaderboard />
          {/* User progress or signup */}
          <UserProgress onAuthClick={onAuthClick} totalTests={allTests.length || 100} />
        </aside>
      </div>
    </div>
  )
}

// ── Test Card ─────────────────────────────────────────────
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
        borderRadius: 12, padding: '15px 16px', cursor: 'pointer',
        transition: 'all .2s', position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? '0 4px 16px rgba(15,23,42,.1)' : '0 1px 3px rgba(15,23,42,.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Test #{test.id}
        </span>
        <span style={{
          padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: isDone ? '#ecfdf5' : test.isFree ? '#ecfdf5' : '#eff4ff',
          color: isDone ? '#059669' : test.isFree ? '#059669' : '#2563eb',
          border: `1px solid ${isDone ? 'rgba(5,150,105,.2)' : test.isFree ? 'rgba(5,150,105,.2)' : 'rgba(37,99,235,.2)'}`,
        }}>
          {isDone ? '✓ Done' : test.isFree ? 'Free' : '🔒 Members'}
        </span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>
        {test.topic}
      </div>
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 9 }}>{test.title}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill>⏱ {test.duration || 30}m</Pill>
        <Pill>📝 {test.totalQuestions || 40} Qs</Pill>
        <span style={{ ...diffStyle(test.difficulty), fontSize: 10.5, background: '#f8fafc', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
          {test.difficulty}
        </span>
      </div>
      {isLocked && hovered && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(248,250,252,.87)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 8, fontSize: 12, color: '#475569', boxShadow: '0 4px 16px rgba(15,23,42,.1)' }}>
            🔒 Sign up free to unlock
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ children }) {
  return (
    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontSize: 10.5, color: '#475569' }}>
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
