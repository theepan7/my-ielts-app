// src/pages/TestPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import { fetchTestWithQuestions, saveResult, calcBand } from '../firebase/services'
import QuestionRenderer from '../components/QuestionRenderer'

// ── AUDIO PLAYER (single file for entire test) ────────────
function AudioPlayer({ audioUrl }) {
  const audioRef              = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDur]    = useState(0)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDur(0)
    setError(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
    }
  }, [audioUrl])

  function togglePlay() {
    if (!audioRef.current || error) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => setError(true))
    }
    setPlaying(p => !p)
  }

  function skip(sec) {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) + sec)
  }

  function seek(e) {
    if (!audioRef.current || !duration) return
    const bar  = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  function fmt(t) {
    if (!t || isNaN(t)) return '0:00'
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`
  }

  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1e40af,#1d4ed8)',
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(255,255,255,.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>🔊</div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Skip back */}
          <button onClick={() => skip(-10)} title="-10s" style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>↺</button>

          {/* Play / Pause */}
          <button onClick={togglePlay} disabled={error} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', border: 'none',
            color: '#1d4ed8', fontWeight: 700, fontSize: 13,
            cursor: error ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: error ? .4 : 1,
          }}>
            {playing ? '⏸' : '▶'}
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} title="+10s" style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>↻</button>

          {/* Progress bar */}
          <div
            onClick={seek}
            style={{
              flex: 1, height: 5, background: 'rgba(255,255,255,.25)',
              borderRadius: 3, cursor: 'pointer',
            }}
          >
            <div style={{
              width: `${progress}%`, height: '100%',
              background: '#fff', borderRadius: 3,
              transition: 'width .3s',
            }} />
          </div>

          {/* Time */}
          <span style={{
            color: 'rgba(255,255,255,.8)', fontSize: 11,
            fontFamily: 'monospace', minWidth: 80, textAlign: 'right',
          }}>
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>

        {error && (
          <p style={{ color: '#fca5a5', fontSize: 10.5, marginTop: 4 }}>
            ⚠ Audio file not found — check your Firebase Storage URL
          </p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDur(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); setPlaying(false) }}
      />
    </div>
  )
}

// ── MAIN TEST PAGE ────────────────────────────────────────
export default function TestPage({ showToast }) {
  const { testId }  = useParams()
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [test,     setTest]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [partIdx,  setPartIdx]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [saving,   setSaving]   = useState(false)

  const timerRef  = useRef(null)
  const startTime = useRef(Date.now())

  // ── Fetch test ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchTestWithQuestions(testId)
      .then(data => { setTest(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [testId])

  // ── Timer ───────────────────────────────────────────────
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

  // ── Score ───────────────────────────────────────────────
  function calculateScore() {
    if (!test) return { correct: 0, total: 0, partScores: {} }
    let totalCorrect = 0, totalQs = 0
    const partScores = {}

    test.parts.forEach(part => {
      let partCorrect = 0, partTotal = 0
      part.sections.forEach(section => {
        const fields = getAllFields(section)
        fields.forEach(({ qNo, answer }) => {
          partTotal++
          const ua = String(answers[qNo] || '').trim().toLowerCase()
          const ca = String(answer || '').trim().toLowerCase()
          if (ua === ca) { partCorrect++; totalCorrect++ }
        })
        totalQs += fields.length
      })
      partScores[part.partNo] = {
        correct: partCorrect,
        total:   partTotal,
        band:    calcBand(Math.round((partCorrect / Math.max(partTotal, 1)) * 40))
      }
    })
    return { correct: totalCorrect, total: totalQs, partScores }
  }

  function getAllFields(section) {
    const fields = []
    if (section.type === 'form')
      (section.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer }))
    else if (section.type === 'table')
      (section.rows || []).forEach(row =>
        (row.cells || []).forEach(cell => { if (cell.qNo) fields.push({ qNo: cell.qNo, answer: cell.answer }) })
      )
    else if (section.type === 'mcq' || section.type === 'fill')
      (section.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
    else if (section.type === 'notes')
      (section.lines || []).forEach(line =>
        (line.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer }))
      )
    else if (section.type === 'map')
      (section.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
    else if (section.type === 'matching')
      (section.items || []).forEach(item => fields.push({ qNo: item.qNo, answer: item.answer }))
    return fields
  }

  // ── Finish ──────────────────────────────────────────────
  async function handleFinish(autoSubmit = false) {
    if (!autoSubmit) {
      const { total } = calculateScore()
      const answered  = Object.keys(answers).length
      if (answered < total) {
        const ok = window.confirm(`You have answered ${answered} of ${total} questions. Submit anyway?`)
        if (!ok) return
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
      } catch (err) {
        console.error(err)
        showToast('Could not save result — check your connection', 'error')
      }
      setSaving(false)
    }

    navigate('/result', {
      state: { testId, testDocId: testId, testTitle: test?.title, correct, total, band, elapsed, partScores, answers, test }
    })
  }

  function exitTest() {
    if (window.confirm('Exit test? Your progress will be lost.')) {
      clearInterval(timerRef.current)
      navigate('/')
    }
  }

  function fmt(t) {
    return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
  }

  // ── LOADING ─────────────────────────────────────────────
  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          height: 100, background: '#fff', borderRadius: 12,
          border: '1px solid #e2e8f0', marginBottom: 12,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Failed to load test</p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{
        marginTop: 24, padding: '10px 24px', borderRadius: 8,
        background: '#2563eb', color: '#fff', border: 'none',
        cursor: 'pointer', fontWeight: 600,
      }}>← Back to Tests</button>
    </div>
  )

  const currentPart = test.parts?.[partIdx]
  const { correct: runCorrect, total: runTotal } = calculateScore()
  const answered = Object.keys(answers).length

  // ── Use test-level audioUrl OR first part's audioUrl ───
  // Store a single audio URL on the test document in Firestore:
  // { audioUrl: "https://..." }  ← one file for the whole test
  const audioUrl = test.audioUrl || currentPart?.audioUrl || ''

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* ════ STICKY HEADER ════════════════════════════════
          position:sticky + top:0 keeps this pinned while
          the questions below scroll freely                */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15,23,42,.08)',
      }}>

        {/* ── Row 1: Test title + timer + exit ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>
              {test.title}
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
              {test.category === 'academic' ? 'Academic' : 'General Training'}
              &nbsp;·&nbsp;4 Parts&nbsp;·&nbsp;{runTotal} Questions
              {answered > 0 && (
                <span style={{ color: '#059669', fontWeight: 600, marginLeft: 8 }}>
                  · {answered} answered
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: timeLeft < 120 ? '#fef2f2' : '#f1f5f9',
              border: `1px solid ${timeLeft < 120 ? '#fca5a5' : '#e2e8f0'}`,
              padding: '6px 14px', borderRadius: 8,
            }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>⏱</span>
              <span style={{
                fontFamily: 'Lora, serif', fontWeight: 700, fontSize: '1.2rem',
                color: timeLeft < 120 ? '#dc2626' : '#2563eb',
                animation: timeLeft < 120 ? 'pulse 1s infinite' : 'none',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmt(timeLeft)}
              </span>
            </div>

            {/* Exit */}
            <button onClick={exitTest} style={{
              padding: '7px 14px', borderRadius: 7,
              background: 'transparent', border: '1px solid #cbd5e1',
              color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              ← Exit
            </button>
          </div>
        </div>

        {/* ── Row 2: Audio player (single for whole test) ── */}
        {audioUrl ? (
          <AudioPlayer audioUrl={audioUrl} />
        ) : (
          <div style={{
            background: '#fef9c3', padding: '8px 20px',
            fontSize: 12, color: '#92400e', borderTop: '1px solid #fde68a',
          }}>
            ⚠ No audio URL set — add <code>audioUrl</code> to this test in Firestore
          </div>
        )}

        {/* ── Row 3: Part tabs ── */}
        <div style={{
          display: 'flex', gap: 0,
          borderTop: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}>
          {(test.parts || []).map((p, i) => (
            <button
              key={p.partNo}
              onClick={() => setPartIdx(i)}
              style={{
                flex: 1, padding: '10px 8px',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all .16s',
                border: 'none',
                borderBottom: i === partIdx ? '3px solid #2563eb' : '3px solid transparent',
                background: i === partIdx ? '#eff4ff' : '#fff',
                color: i === partIdx ? '#2563eb' : '#64748b',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {p.title || `Part ${p.partNo}`}
            </button>
          ))}
        </div>
      </div>

      {/* ════ SCROLLABLE QUESTION AREA ═══════════════════ */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* Part instruction */}
        {currentPart && (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '10px 16px', marginBottom: 14,
            fontSize: 13, color: '#475569',
            boxShadow: '0 1px 3px rgba(15,23,42,.06)',
          }}>
            <strong style={{ color: '#0f172a' }}>{currentPart.title || `Part ${currentPart.partNo}`}</strong>
            &nbsp;— Questions {(partIdx * 10) + 1}–{(partIdx + 1) * 10}
          </div>
        )}

        {/* Questions */}
        <div>
          {(currentPart?.sections || []).map(section => (
            <QuestionRenderer
              key={section.id}
              section={section}
              answers={answers}
              onChange={setAnswer}
              reviewMode={false}
            />
          ))}
        </div>

        {/* ── Bottom action bar ── */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '12px 18px', marginTop: 16,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 10,
          boxShadow: '0 1px 3px rgba(15,23,42,.06)',
        }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            Answered:&nbsp;
            <strong style={{ color: '#2563eb' }}>{answered}</strong>
            &nbsp;/&nbsp;{runTotal}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Previous part */}
            {partIdx > 0 && (
              <button
                onClick={() => setPartIdx(i => i - 1)}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  background: 'transparent', border: '1px solid #cbd5e1',
                  color: '#475569', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                ← Previous
              </button>
            )}

            {/* Next part */}
            {partIdx < (test.parts?.length || 0) - 1 && (
              <button
                onClick={() => { setPartIdx(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  background: 'transparent', border: '1px solid #cbd5e1',
                  color: '#475569', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Next Part →
              </button>
            )}

            {/* Finish */}
            <button
              onClick={() => handleFinish(false)}
              disabled={saving}
              style={{
                padding: '9px 26px', borderRadius: 8, border: 'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 4px 14px rgba(37,99,235,.28)',
                transition: 'all .2s',
              }}
            >
              {saving ? 'Saving…' : 'Finish & See Results →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
