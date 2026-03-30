// src/pages/TestPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import { fetchTestWithQuestions, saveResult, calcBand } from '../firebase/services'
import QuestionRenderer from '../components/QuestionRenderer'

// ─────────────────────────────────────────────────────────
//  AUDIO PLAYER
// ─────────────────────────────────────────────────────────
function AudioPlayer({ audioUrl }) {
  const audioRef              = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDur]    = useState(0)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setPlaying(false); setCurrent(0); setDur(0); setError(false)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.load() }
  }, [audioUrl])

  function togglePlay() {
    if (!audioRef.current || error) return
    playing ? audioRef.current.pause() : audioRef.current.play().catch(() => setError(true))
    setPlaying(p => !p)
  }
  function skip(sec) {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) + sec)
  }
  function seek(e) {
    if (!audioRef.current || !duration) return
    const r = e.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration
  }
  function fmt(t) {
    if (!t || isNaN(t)) return '0:00'
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1e40af,#1d4ed8)',
      padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 16 }}>🔊</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IcoBtn onClick={() => skip(-10)}>↺</IcoBtn>
          <button onClick={togglePlay} disabled={error} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', border: 'none', color: '#1d4ed8',
            fontWeight: 700, fontSize: 13, cursor: error ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: error ? .4 : 1, flexShrink: 0,
          }}>
            {playing ? '⏸' : '▶'}
          </button>
          <IcoBtn onClick={() => skip(10)}>↻</IcoBtn>
          <div onClick={seek} style={{
            flex: 1, height: 4, background: 'rgba(255,255,255,.25)',
            borderRadius: 2, cursor: 'pointer',
          }}>
            <div style={{
              width: `${duration ? (current / duration) * 100 : 0}%`,
              height: '100%', background: '#fff', borderRadius: 2, transition: 'width .3s',
            }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 10.5, fontFamily: 'monospace', minWidth: 76, textAlign: 'right' }}>
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>
        {error && <p style={{ color: '#fca5a5', fontSize: 10.5, marginTop: 3 }}>⚠ Audio not found — check Firestore audioUrl</p>}
      </div>
      <audio
        ref={audioRef} src={audioUrl}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDur(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); setPlaying(false) }}
      />
    </div>
  )
}
function IcoBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 24, height: 24, borderRadius: '50%', border: 'none', flexShrink: 0,
      background: 'rgba(255,255,255,.18)', color: '#fff', cursor: 'pointer', fontSize: 11,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  )
}

// ─────────────────────────────────────────────────────────
//  QUESTION NUMBER TRACKER
// ─────────────────────────────────────────────────────────
function QuestionTracker({ sections, answers, partIdx, onJump }) {
  const qNos = extractQNos(sections)
  if (!qNos.length) return null

  const answeredCount   = qNos.filter(n => answers[n] !== undefined && answers[n] !== '').length
  const unansweredCount = qNos.length - answeredCount
  const pct             = Math.round((answeredCount / qNos.length) * 100)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '14px 16px', marginTop: 14,
      boxShadow: '0 1px 3px rgba(15,23,42,.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8' }}>
          Part {partIdx + 1} — Question Tracker
        </span>
        <div style={{ display: 'flex', gap: 14 }}>
          <Legend color="#2563eb" label={`Answered (${answeredCount})`} />
          <Legend color="#f1f5f9" border="#cbd5e1" label={`Unanswered (${unansweredCount})`} textColor="#94a3b8" />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {qNos.map(n => {
          const done = answers[n] !== undefined && answers[n] !== ''
          return (
            <div
              key={n}
              onClick={() => onJump(n)}
              title={`Question ${n} — ${done ? 'answered' : 'not answered yet'}`}
              style={{
                width: 34, height: 34, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s',
                background: done ? '#2563eb' : '#f8fafc',
                color:      done ? '#fff'    : '#94a3b8',
                border:     done ? '1.5px solid #1d4ed8' : '1.5px solid #e2e8f0',
                boxShadow:  done ? '0 2px 6px rgba(37,99,235,.22)' : 'none',
              }}
            >
              {n}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2 }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
            borderRadius: 2, transition: 'width .4s',
          }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>
          {pct}% of Part {partIdx + 1} complete
        </div>
      </div>
    </div>
  )
}

function Legend({ color, border, label, textColor }) {
  return (
    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
        background: color, border: border ? `1px solid ${border}` : 'none',
        display: 'inline-block',
      }} />
      <span style={{ color: textColor || '#475569' }}>{label}</span>
    </span>
  )
}

function extractQNos(sections) {
  const qNos = []
  sections.forEach(sec => {
    if (sec.type === 'form')
      (sec.fields || []).forEach(f => qNos.push(f.qNo))
    else if (sec.type === 'table')
      (sec.rows || []).forEach(row => (row.cells || []).forEach(c => { if (c.qNo) qNos.push(c.qNo) }))
    else if (sec.type === 'mcq' || sec.type === 'fill')
      (sec.questions || []).forEach(q => qNos.push(q.qNo))
    else if (sec.type === 'notes')
      (sec.lines || []).forEach(l => (l.fields || []).forEach(f => qNos.push(f.qNo)))
    else if (sec.type === 'map')
      (sec.questions || []).forEach(q => qNos.push(q.qNo))
    else if (sec.type === 'matching')
      (sec.items || []).forEach(i => qNos.push(i.qNo))
  })
  return qNos
}

function extractPartQNos(part) {
  return extractQNos(part.sections || [])
}

// ─────────────────────────────────────────────────────────
//  MAIN TEST PAGE
// ─────────────────────────────────────────────────────────
export default function TestPage({ showToast }) {
  const { testId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [test,     setTest]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [partIdx,  setPartIdx]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [saving,   setSaving]   = useState(false)

  // Track whether the user has scrolled past the title row
  const [scrolled, setScrolled] = useState(false)

  const timerRef     = useRef(null)
  const startTime    = useRef(Date.now())
  const headerRef    = useRef(null)   // ref to the full sticky header
  const titleRowRef  = useRef(null)   // ref to just the title+timer row

  // ── Hide footer while test is open ─────────────────────
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (footer) footer.style.display = 'none'
    return () => { if (footer) footer.style.display = '' }
  }, [])

  // ── Detect scroll to collapse title row ────────────────
  useEffect(() => {
    function onScroll() {
      // Collapse title row once user scrolls more than its height
      const titleHeight = titleRowRef.current?.offsetHeight || 56
      setScrolled(window.scrollY > titleHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Fetch test ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchTestWithQuestions(testId)
      .then(data => { setTest(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [testId])

  // ── Countdown timer ─────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleFinish(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  function setAnswer(qNo, value) {
    setAnswers(prev => ({ ...prev, [qNo]: value }))
  }

  function jumpToQuestion(qNo) {
    const el = document.getElementById(`q-${qNo}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.outline = '2.5px solid #2563eb'
      el.style.outlineOffset = '4px'
      setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = '' }, 1800)
    }
  }

  function calculateScore() {
    if (!test) return { correct: 0, total: 0, partScores: {} }
    let totalCorrect = 0, totalQs = 0
    const partScores = {}
    test.parts.forEach(part => {
      let partCorrect = 0, partTotal = 0
      const fields = getAllFields(part.sections || [])
      fields.forEach(({ qNo, answer }) => {
        partTotal++
        if (String(answers[qNo] || '').trim().toLowerCase() === String(answer || '').trim().toLowerCase()) {
          partCorrect++; totalCorrect++
        }
      })
      totalQs += partTotal
      partScores[part.partNo] = {
        correct: partCorrect, total: partTotal,
        band: calcBand(Math.round((partCorrect / Math.max(partTotal, 1)) * 40))
      }
    })
    return { correct: totalCorrect, total: totalQs, partScores }
  }

  function getAllFields(sections) {
    const fields = []
    sections.forEach(sec => {
      if (sec.type === 'form')
        (sec.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer }))
      else if (sec.type === 'table')
        (sec.rows || []).forEach(row => (row.cells || []).forEach(c => { if (c.qNo) fields.push({ qNo: c.qNo, answer: c.answer }) }))
      else if (sec.type === 'mcq' || sec.type === 'fill')
        (sec.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
      else if (sec.type === 'notes')
        (sec.lines || []).forEach(l => (l.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer })))
      else if (sec.type === 'map')
        (sec.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
      else if (sec.type === 'matching')
        (sec.items || []).forEach(i => fields.push({ qNo: i.qNo, answer: i.answer }))
    })
    return fields
  }

  async function handleFinish(autoSubmit = false) {
    if (!autoSubmit) {
      const { total } = calculateScore()
      const done = Object.keys(answers).length
      if (done < total) {
        if (!window.confirm(`You have answered ${done} of ${total} questions. Submit anyway?`)) return
      }
    }
    clearInterval(timerRef.current)
    const { correct, total, partScores } = calculateScore()
    const band    = calcBand(correct)
    const elapsed = Math.round((Date.now() - startTime.current) / 1000)

    if (user) {
      setSaving(true)
      try {
        await saveResult(user.uid, user.displayName || user.email, testId, test.id, correct, total, band, partScores)
        showToast('Result saved! Leaderboard updated ✓', 'success')
      } catch (e) {
        showToast('Could not save result — check connection', 'error')
      }
      setSaving(false)
    }
    navigate('/result', {
      state: { testId, testDocId: testId, testTitle: test?.title, correct, total, band, elapsed, partScores, answers, test }
    })
  }

  function fmt(t) {
    return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
  }

  // ── States ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ height: 100, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 12 }} />
      ))}
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Failed to load test</p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        ← Back to Tests
      </button>
    </div>
  )

  const currentPart = test.parts?.[partIdx]
  const totalParts  = test.parts?.length || 4
  const isLastPart  = partIdx === totalParts - 1
  const isFirstPart = partIdx === 0
  const { total: runTotal } = calculateScore()
  const answered = Object.keys(answers).length
  const audioUrl = test.audioUrl || ''

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh', paddingBottom: 60 }}>

      {/* ════ STICKY HEADER ════════════════════════════════ */}
      <div
        ref={headerRef}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15,23,42,.08)',
        }}
      >
        {/* ── Row 1: Title + Timer + Exit — hides on scroll ── */}
        <div
          ref={titleRowRef}
          style={{
            overflow: 'hidden',
            maxHeight: scrolled ? 0 : 200,           // collapse to 0 when scrolled
            opacity:   scrolled ? 0 : 1,
            transition: 'max-height .3s ease, opacity .25s ease',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px', flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>
                {test.title}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>
                {test.category === 'academic' ? 'Academic' : 'General Training'}
                &nbsp;·&nbsp; 4 Parts &nbsp;·&nbsp; {runTotal} Questions
                {answered > 0 && (
                  <span style={{ color: '#059669', fontWeight: 600, marginLeft: 8 }}>
                    · {answered} answered
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Timer */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: timeLeft < 120 ? '#fef2f2' : '#f1f5f9',
                border: `1px solid ${timeLeft < 120 ? '#fca5a5' : '#e2e8f0'}`,
                padding: '6px 14px', borderRadius: 8,
              }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>⏱</span>
                <span style={{
                  fontFamily: 'Lora, serif', fontWeight: 700, fontSize: '1.2rem',
                  color: timeLeft < 120 ? '#dc2626' : '#2563eb',
                  fontVariantNumeric: 'tabular-nums',
                  animation: timeLeft < 120 ? 'blink 1s infinite' : 'none',
                }}>
                  {fmt(timeLeft)}
                </span>
              </div>
              {/* Exit */}
              <button onClick={() => { if (window.confirm('Exit test? Your progress will be lost.')) { clearInterval(timerRef.current); navigate('/') } }}
                style={{ padding: '7px 14px', borderRadius: 7, background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ← Exit
              </button>
            </div>
          </div>
        </div>

        {/* ── Row 2: Audio Player — always visible ── */}
        {audioUrl
          ? <AudioPlayer audioUrl={audioUrl} />
          : (
            <div style={{ background: '#fef9c3', padding: '7px 20px', fontSize: 12, color: '#92400e', borderTop: '1px solid #fde68a' }}>
              ⚠ No audio — add <code>audioUrl</code> to this test document in Firestore
            </div>
          )
        }

        {/* ── Row 3: Part tabs + inline part label — always visible ── */}
        <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {(test.parts || []).map((p, i) => {
            const pQNos     = extractPartQNos(p)
            const pAnswered = pQNos.filter(n => answers[n] !== undefined && answers[n] !== '').length
            const allDone   = pQNos.length > 0 && pAnswered === pQNos.length
            const active    = i === partIdx

            return (
              <button
                key={p.partNo}
                onClick={() => { setPartIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  flex: 1, padding: '9px 6px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
                  background: active ? '#eff4ff' : '#fff',
                  color: active ? '#2563eb' : allDone ? '#059669' : '#64748b',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  whiteSpace: 'nowrap', transition: 'all .15s',
                }}
              >
                {p.title || `Part ${p.partNo}`}
                {allDone && <span style={{ marginLeft: 4 }}>✓</span>}
                <div style={{ fontSize: 9.5, marginTop: 1, color: active ? '#93c5fd' : allDone ? '#86efac' : '#e2e8f0' }}>
                  {pAnswered}/{pQNos.length}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Compact part label strip — appears only when scrolled ── */}
        {scrolled && currentPart && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 20px',
            background: '#f8fafc', borderTop: '1px solid #e2e8f0',
            animation: 'slideDown .2s ease',
          }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 12.5 }}>
              {currentPart.title || `Part ${currentPart.partNo}`}
              <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
                Q{partIdx * 10 + 1}–{(partIdx + 1) * 10}
              </span>
            </span>
            {/* Mini timer shown when title row is hidden */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 700,
              color: timeLeft < 120 ? '#dc2626' : '#2563eb',
              animation: timeLeft < 120 ? 'blink 1s infinite' : 'none',
            }}>
              ⏱ {fmt(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* ════ SCROLLABLE QUESTIONS ════════════════════════ */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '18px 20px 0' }}>

        {/* Part label bar — visible only when NOT scrolled (at top of page) */}
        {!scrolled && currentPart && (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '10px 16px', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 1px 3px rgba(15,23,42,.06)',
          }}>
            <div>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>
                {currentPart.title || `Part ${currentPart.partNo}`}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 12.5, marginLeft: 8 }}>
                Questions {partIdx * 10 + 1}–{(partIdx + 1) * 10}
              </span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#64748b',
              background: '#f1f5f9', padding: '3px 10px', borderRadius: 20,
            }}>
              Part {partIdx + 1} of {totalParts}
            </span>
          </div>
        )}

        {/* Questions */}
        {(currentPart?.sections || []).map(section => (
          <div key={section.id}>
            <QuestionRenderer
              section={section}
              answers={answers}
              onChange={setAnswer}
              reviewMode={false}
            />
          </div>
        ))}

        {/* Question Number Tracker */}
        <QuestionTracker
          sections={currentPart?.sections || []}
          answers={answers}
          partIdx={partIdx}
          onJump={jumpToQuestion}
        />

        {/* Navigation Buttons */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '14px 18px', marginTop: 12,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 10,
          boxShadow: '0 1px 3px rgba(15,23,42,.06)',
        }}>
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            Total answered:&nbsp;
            <strong style={{ color: '#2563eb' }}>{answered}</strong>
            <span style={{ color: '#94a3b8' }}> / {runTotal}</span>
          </p>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isFirstPart && (
              <button
                onClick={() => { setPartIdx(i => i - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: 'transparent', border: '1.5px solid #cbd5e1',
                  color: '#475569', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                ← Previous Part
              </button>
            )}
            {!isLastPart && (
              <button
                onClick={() => { setPartIdx(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: '#f0f9ff', border: '1.5px solid #93c5fd',
                  color: '#1d4ed8', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Next Part →
              </button>
            )}
            {isLastPart && (
              <button
                onClick={() => handleFinish(false)}
                disabled={saving}
                style={{
                  padding: '10px 26px', borderRadius: 8, border: 'none',
                  background: saving
                    ? '#94a3b8'
                    : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,.3)',
                  transition: 'all .2s', opacity: saving ? .7 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Finish & See Results →'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
