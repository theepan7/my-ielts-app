// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTests, fetchUserCompletedTests } from '../firebase/services'
import { HomeLeaderboard } from '../components/Leaderboard'
import UserProgress from '../components/UserProgress'

// ── Design tokens ─────────────────────────────────────────
const C = {
  brand:   '#e7155e',
  brandDk: '#c01050',
  brandLt: '#fff0f5',
  ink:     '#0d0d0d',
  slate:   '#4a4a5a',
  muted:   '#9a9aaa',
  line:    '#eaeaf0',
  bg:      '#f7f7fa',
  white:   '#ffffff',
}

const SKILL_META = {
  listening: { emoji: '🎧', label: 'Listening', color: '#2563eb', bg: '#eff4ff', border: '#bfdbfe' },
  reading:   { emoji: '📖', label: 'Reading',   color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  writing:   { emoji: '✍️', label: 'Writing',   color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  speaking:  { emoji: '🎤', label: 'Speaking',  color: '#e7155e', bg: '#fff0f5', border: '#fda4c0' },
}

const PER_PAGE = 12

export default function HomePage({ onAuthClick, showToast }) {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // skill filter passed from Navbar via location.state
  const skillFilter = location.state?.filter || 'all'

  const [allTests,  setAllTests]  = useState([])
  const [completed, setCompleted] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')   // academic | general | all
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)

  // Reset page when filter changes
  useEffect(() => { setPage(1) }, [skillFilter, search, catFilter, status])

  useEffect(() => {
    setLoading(true)
    fetchTests()
      .then(data => setAllTests(data))
      .catch(() => setAllTests([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) { setCompleted([]); return }
    fetchUserCompletedTests(user.uid).then(setCompleted).catch(() => {})
  }, [user])

  // Derived filtered list
  const filtered = allTests.filter(t => {
    if (skillFilter !== 'all') {
      const sk = (t.skillType || t.skill || 'listening').toLowerCase()
      if (sk !== skillFilter) return false
    }
    if (catFilter !== 'all' && t.category !== catFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.title?.toLowerCase().includes(q) && !t.topic?.toLowerCase().includes(q)) return false
    }
    if (status === 'free' && !t.isFree) return false
    if (status === 'completed' && !completed.includes(t.id)) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleTestClick(test) {
    if (!test.isFree && !user) {
      showToast('Sign up free to unlock all tests', 'error')
      onAuthClick('signup')
      return
    }
    navigate(`/test/${test.docId}`)
  }

  const skillLabel =
    skillFilter === 'listening' ? 'Listening Tests' :
    skillFilter === 'reading'   ? 'Reading Tests'   :
    skillFilter === 'writing'   ? 'Writing Tests'   :
    skillFilter === 'speaking'  ? 'Speaking Tests'  : 'All Tests'

  const skillMeta = SKILL_META[skillFilter]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root {
          background: ${C.bg};
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Hero ───────────────────────────────── */
        .hero {
          background: ${C.ink};
          position: relative;
          overflow: hidden;
          padding: 56px 28px 52px;
        }
        .hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .hero-accent {
          position: absolute;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(231,21,94,.22) 0%, transparent 70%);
          top: -160px; right: -100px;
          pointer-events: none;
        }
        .hero-accent2 {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(231,21,94,.1) 0%, transparent 70%);
          bottom: -80px; left: 40px;
          pointer-events: none;
        }
        .hero-inner {
          max-width: 580px;
          margin: 0 auto;
          text-align: center;
          position: relative; z-index: 1;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(231,21,94,.15);
          border: 1px solid rgba(231,21,94,.35);
          color: #ff6b9d;
          border-radius: 30px; padding: 5px 16px;
          font-size: 11.5px; font-weight: 500; letter-spacing: .04em;
          margin-bottom: 20px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.brand}; animation: blink 1.6s ease infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 2.9rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 14px;
          letter-spacing: -.02em;
        }
        .hero-title em {
          font-style: normal;
          color: ${C.brand};
        }
        .hero-sub {
          color: rgba(255,255,255,.52);
          font-size: 14px;
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 400px;
          margin-left: auto; margin-right: auto;
        }
        .hero-stats {
          display: flex; justify-content: center; gap: 0;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; overflow: hidden;
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(8px);
          max-width: 380px; margin: 0 auto;
        }
        .hero-stat {
          flex: 1; padding: 14px 12px; text-align: center;
          border-right: 1px solid rgba(255,255,255,.08);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700; color: #fff;
        }
        .hero-stat-num span { color: ${C.brand}; }
        .hero-stat-label {
          font-size: 10px; color: rgba(255,255,255,.38);
          text-transform: uppercase; letter-spacing: .08em; margin-top: 2px;
        }

        /* ── Skill tabs ─────────────────────────── */
        .skill-tabs-wrap {
          background: ${C.white};
          border-bottom: 1px solid ${C.line};
          padding: 0 28px;
          position: sticky; top: 62px; z-index: 90;
        }
        .skill-tabs {
          max-width: 1240px; margin: 0 auto;
          display: flex; gap: 0; overflow-x: auto;
          scrollbar-width: none;
        }
        .skill-tabs::-webkit-scrollbar { display: none; }
        .skill-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 14px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: ${C.muted}; background: none; border: none;
          border-bottom: 2.5px solid transparent;
          cursor: pointer; white-space: nowrap;
          transition: all .18s; position: relative;
        }
        .skill-tab:hover { color: ${C.ink}; }
        .skill-tab.active {
          color: ${C.brand};
          border-bottom-color: ${C.brand};
          font-weight: 600;
        }
        .skill-tab .soon-tag {
          font-size: 9px; font-weight: 700; padding: 1px 5px;
          border-radius: 4px; background: #f1f5f9; color: ${C.muted};
          text-transform: uppercase; letter-spacing: .06em;
        }

        /* ── Main layout ────────────────────────── */
        .main-wrap {
          max-width: 1240px; margin: 0 auto;
          padding: 24px 20px;
          display: grid;
          grid-template-columns: 1fr 288px;
          gap: 22px; align-items: start;
        }

        /* ── Filter bar ─────────────────────────── */
        .filter-bar {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 16px;
          align-items: center;
        }
        .search-input {
          flex: 1; min-width: 180px;
          background: ${C.white};
          border: 1.5px solid ${C.line};
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: ${C.ink}; outline: none;
          transition: border-color .18s;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
        }
        .search-input:focus { border-color: ${C.brand}; }
        .filter-select {
          background: ${C.white};
          border: 1.5px solid ${C.line};
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12.5px; font-family: 'DM Sans', sans-serif;
          color: ${C.slate}; outline: none;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          cursor: pointer; transition: border-color .18s;
        }
        .filter-select:focus { border-color: ${C.brand}; }

        /* ── Section header ─────────────────────── */
        .section-hd {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .section-hd-label {
          font-size: 10.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .09em;
          color: ${C.muted}; white-space: nowrap;
        }
        .section-hd-pill {
          font-size: 10px; font-weight: 700;
          padding: 2px 9px; border-radius: 20px;
          background: ${C.brandLt}; color: ${C.brand};
          border: 1px solid rgba(231,21,94,.2);
        }
        .section-hd-line {
          flex: 1; height: 1px; background: ${C.line};
        }

        /* ── Test grid ──────────────────────────── */
        .test-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        /* ── Test card ──────────────────────────── */
        .tcard {
          background: ${C.white};
          border: 1.5px solid ${C.line};
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all .2s;
          position: relative; overflow: hidden;
        }
        .tcard:hover {
          border-color: ${C.brand};
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(231,21,94,.12);
        }
        .tcard-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.brand}, #ff6b9d);
        }
        .tcard-done .tcard-stripe {
          background: linear-gradient(90deg, #059669, #34d399);
        }
        .tcard-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 8px; margin-top: 4px;
        }
        .tcard-num {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .07em; color: ${C.muted};
        }
        .tcard-badge {
          font-size: 9.5px; font-weight: 700;
          padding: 2px 8px; border-radius: 20px;
        }
        .tcard-topic {
          font-size: 13.5px; font-weight: 600; color: ${C.ink};
          line-height: 1.3; margin-bottom: 3px;
        }
        .tcard-title {
          font-size: 11px; color: ${C.muted}; margin-bottom: 10px;
        }
        .tcard-pills {
          display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
        }
        .tcard-pill {
          font-size: 10.5px; padding: 2px 8px;
          background: #f4f4f8; color: ${C.slate};
          border-radius: 20px;
        }
        .tcard-lock {
          position: absolute; inset: 0; border-radius: 14px;
          background: rgba(247,247,250,.88);
          backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s;
        }
        .tcard:hover .tcard-lock { opacity: 1; }
        .tcard-lock-inner {
          background: ${C.white}; border: 1px solid ${C.line};
          border-radius: 8px; padding: 8px 14px;
          font-size: 12px; color: ${C.slate};
          box-shadow: 0 4px 16px rgba(0,0,0,.1);
        }

        /* ── Skeleton ───────────────────────────── */
        .skel {
          height: 140px; border-radius: 14px;
          background: linear-gradient(90deg, #f0f0f4 25%, #e8e8ec 50%, #f0f0f4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── Pagination ─────────────────────────── */
        .pgn { display: flex; justify-content: center; gap: 5px; flex-wrap: wrap; }
        .pgn-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1.5px solid ${C.line}; background: ${C.white};
          color: ${C.slate}; font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all .16s;
        }
        .pgn-btn:hover:not(:disabled) { border-color: ${C.brand}; color: ${C.brand}; }
        .pgn-btn.active { background: ${C.brand}; border-color: ${C.brand}; color: #fff; font-weight: 700; }
        .pgn-btn:disabled { opacity: .3; cursor: not-allowed; }

        /* ── Sidebar ────────────────────────────── */
        .sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 112px; }

        /* ── CTA banner ─────────────────────────── */
        .cta-banner {
          background: ${C.ink};
          border-radius: 16px;
          padding: 22px 20px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(231,21,94,.3), transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 700; color: #fff;
          margin-bottom: 6px; position: relative; z-index: 1;
        }
        .cta-sub {
          font-size: 12px; color: rgba(255,255,255,.45);
          margin-bottom: 16px; position: relative; z-index: 1;
          line-height: 1.5;
        }
        .cta-btn {
          display: block; width: 100%;
          padding: 11px; border-radius: 10px;
          background: ${C.brand}; color: #fff;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none; cursor: pointer;
          transition: all .18s;
          position: relative; z-index: 1;
        }
        .cta-btn:hover { background: ${C.brandDk}; box-shadow: 0 6px 20px rgba(231,21,94,.35); }

        /* ── Responsive ─────────────────────────── */
        @media (max-width: 900px) {
          .main-wrap { grid-template-columns: 1fr; }
          .sidebar { position: static; }
        }
      `}</style>

      <div className="hp-root">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <div className="hero">
          <div className="hero-noise" />
          <div className="hero-accent" />
          <div className="hero-accent2" />
          <div className="hero-inner">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Now with Reading, Writing & Speaking
            </div>
            <h1 className="hero-title">
              Ace Your IELTS with<br /><em>IELTSPlanner</em>
            </h1>
            <p className="hero-sub">
              Full-length practice tests across all four modules. Real exam format, instant band scores, global leaderboards.
            </p>
            <div className="hero-stats">
              {[
                ['100+', 'Tests'],
                ['4,000+', 'Questions'],
                ['Band 9', 'Target'],
                ['Free', 'To Start'],
              ].map(([n, l]) => (
                <div className="hero-stat" key={l}>
                  <div className="hero-stat-num">{n.includes('Band') ? <><span>Band</span> 9</> : n.includes('Free') ? <span>Free</span> : n}</div>
                  <div className="hero-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ SKILL TABS ════════════════════════════════════ */}
        <div className="skill-tabs-wrap">
          <div className="skill-tabs">
            {[
              { key: 'all',       emoji: '📋', label: 'All Tests' },
              { key: 'listening', emoji: '🎧', label: 'Listening' },
              { key: 'reading',   emoji: '📖', label: 'Reading' },
              { key: 'writing',   emoji: '✍️', label: 'Writing',  soon: true },
              { key: 'speaking',  emoji: '🎤', label: 'Speaking', soon: true },
            ].map(tab => (
              <button
                key={tab.key}
                className={`skill-tab${skillFilter === tab.key ? ' active' : ''}`}
                onClick={() => {
                  if (!tab.soon) navigate('/', { state: { filter: tab.key } })
                }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {tab.soon && <span className="soon-tag">Soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MAIN CONTENT ══════════════════════════════════ */}
        <div className="main-wrap">

          {/* LEFT — tests */}
          <div>
            {/* Filter bar */}
            <div className="filter-bar">
              <input
                className="search-input"
                placeholder="🔍  Search by topic or test title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="filter-select"
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="general">General Training</option>
              </select>
              <select
                className="filter-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="free">Free Only</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Section header */}
            <div className="section-hd">
              {skillMeta && (
                <span style={{ fontSize: 15 }}>{skillMeta.emoji}</span>
              )}
              <span className="section-hd-label">{skillLabel}</span>
              <span className="section-hd-pill">{filtered.length} available</span>
              <div className="section-hd-line" />
            </div>

            {/* Grid */}
            {loading ? (
              <div className="test-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="skel" />)}
              </div>
            ) : slice.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: C.muted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔎</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.slate }}>No tests found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
              </div>
            ) : (
              <div className="test-grid">
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
              <div className="pgn">
                <button className="pgn-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                    acc.push(n)
                    return acc
                  }, [])
                  .map((n, i) =>
                    n === '…'
                      ? <span key={`d${i}`} style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 13 }}>…</span>
                      : <button
                          key={n}
                          className={`pgn-btn${page === n ? ' active' : ''}`}
                          onClick={() => { setPage(n); window.scrollTo({ top: 300, behavior: 'smooth' }) }}
                        >{n}</button>
                  )}
                <button className="pgn-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <aside className="sidebar">
            {/* CTA for guests */}
            {!user && (
              <div className="cta-banner">
                <div className="cta-title">Start for Free Today</div>
                <div className="cta-sub">Get access to free tests, track your band score progress, and compete on the leaderboard.</div>
                <button className="cta-btn" onClick={() => onAuthClick('signup')}>
                  Create Free Account →
                </button>
              </div>
            )}
            <HomeLeaderboard />
            <UserProgress onAuthClick={onAuthClick} totalTests={allTests.length || 100} />
          </aside>
        </div>
      </div>
    </>
  )
}

// ── Test Card ──────────────────────────────────────────────
function TestCard({ test, isDone, isLocked, onClick }) {
  const skillType  = (test.skillType || test.skill || 'listening').toLowerCase()
  const skillMeta  = SKILL_META[skillType] || SKILL_META.listening

  return (
    <div className={`tcard${isDone ? ' tcard-done' : ''}`} onClick={onClick}>
      <div className="tcard-stripe" />

      <div className="tcard-head">
        <span className="tcard-num">Test #{test.id}</span>
        <span
          className="tcard-badge"
          style={{
            background: isDone ? '#ecfdf5' : test.isFree ? '#ecfdf5' : '#fff0f5',
            color:      isDone ? '#059669' : test.isFree ? '#059669' : '#e7155e',
            border:     `1px solid ${isDone ? 'rgba(5,150,105,.2)' : test.isFree ? 'rgba(5,150,105,.2)' : 'rgba(231,21,94,.2)'}`,
          }}
        >
          {isDone ? '✓ Done' : test.isFree ? 'Free' : '🔒 Members'}
        </span>
      </div>

      <div className="tcard-topic">{test.topic}</div>
      <div className="tcard-title">{test.title}</div>

      <div className="tcard-pills">
        <span className="tcard-pill">⏱ {test.duration || 30}m</span>
        <span className="tcard-pill">📝 {test.totalQuestions || 40} Qs</span>
        <span style={{
          fontSize: 10.5, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
          background: skillMeta.bg, color: skillMeta.color,
          border: `1px solid ${skillMeta.border}`,
        }}>
          {skillMeta.emoji} {skillMeta.label}
        </span>
        {test.category && (
          <span style={{
            fontSize: 10.5, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            background: test.category === 'academic' ? '#f5f3ff' : '#f0fdfa',
            color:      test.category === 'academic' ? '#7c3aed' : '#0d9488',
            border:     `1px solid ${test.category === 'academic' ? '#ddd6fe' : '#99f6e4'}`,
          }}>
            {test.category === 'academic' ? '📚 Academic' : '📺 General'}
          </span>
        )}
      </div>

      {isLocked && (
        <div className="tcard-lock">
          <div className="tcard-lock-inner">🔒 Sign up free to unlock</div>
        </div>
      )}
    </div>
  )
}
