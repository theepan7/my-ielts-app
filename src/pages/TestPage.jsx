// src/pages/TestPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import { fetchTestWithQuestions, saveResult, calcBand } from '../firebase/services'
import QuestionRenderer from '../components/QuestionRenderer'
import AudioPlayer from '../components/AudioPlayer'


// ── Main Test Page ────────────────────────────────────────
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

  // ── Redirect to home if user signs out while on test page ──
  useEffect(() => {
    if (user === null) {
      clearInterval(timerRef.current)
      navigate('/', { replace: true })
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    fetchTestWithQuestions(testId)
      .then(data => { setTest(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [testId])

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
          const ca = String(answer   || '').trim().toLowerCase()
          if (ua === ca) { partCorrect++; totalCorrect++ }
        })
        totalQs += fields.length
      })
      partScores[part.partNo] = {
        correct: partCorrect, total: partTotal,
        band: calcBand(Math.round((partCorrect / Math.max(partTotal, 1)) * 40))
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

  // ── FIX: correct saveResult signature ────────────────────
  // New signature: saveResult(userId, displayName, email, testDocId, testId, correct, total, band, partScores, elapsed)
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
        // ── FIXED call — passes displayName AND email separately,
        //    plus elapsed so time tiebreaker works ──────────────
        await saveResult(
          user.uid,
          user.displayName,   // may be null — services.js handles fallback
          user.email,         // always available
          testId,             // testDocId (string from URL params)
          test.id,            // numeric test id from Firestore doc
          correct,
          total,
          band,
          partScores,
          elapsed             // seconds taken — used for tiebreaker
        )
        if (band) {
          showToast('Result saved! Leaderboard updated ✓', 'success')
        } else {
          showToast(`Score saved: ${correct}/40 — answer at least 11 correctly for a band score`, 'info')
        }
      } catch (err) {
        console.error('saveResult error:', err)
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
      clearInterval(timerRef.current); navigate('/')
    }
  }

  function fmt(t) {
    return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
  }

  if (loading) return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 20px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 100, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 12 }} />
      ))}
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Failed to load test</p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back to Tests</button>
    </div>
  )

  const currentPart = test.parts?.[partIdx]
  const { total: runTotal } = calculateScore()
  const answered = Object.keys(answers).length
  const audioUrl = test.audioUrl || currentPart?.audioUrl || ''

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* ════ STICKY HEADER ════════════════════════════════ */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,.08)' }}>

        {/* Row 1: title + timer + exit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Lora,serif', fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>{test.title}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
              4 Parts · {runTotal} Questions
              {answered > 0 && <span style={{ color: '#059669', fontWeight: 600, marginLeft: 8 }}>· {answered} answered</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: timeLeft < 120 ? '#fef2f2' : '#f1f5f9', border: `1px solid ${timeLeft < 120 ? '#fca5a5' : '#e2e8f0'}`, padding: '6px 14px', borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>⏱</span>
              <span style={{ fontFamily: 'Lora,serif', fontWeight: 700, fontSize: '1.2rem', color: timeLeft < 120 ? '#dc2626' : '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(timeLeft)}
              </span>
            </div>
            <button onClick={exitTest} style={{ padding: '7px 14px', borderRadius: 7, background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
              ← Exit
            </button>
          </div>
        </div>

        {/* Row 2: Audio */}
        {audioUrl ? <AudioPlayer audioUrl={audioUrl} /> : (
          <div style={{ background: '#fef9c3', padding: '8px 20px', fontSize: 12, color: '#92400e', borderTop: '1px solid #fde68a' }}>
            ⚠ No audio URL set — add <code>audioUrl</code> to this test in Firestore
          </div>
        )}

        {/* Row 3: Part tabs */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {(test.parts || []).map((p, i) => (
            <button key={p.partNo} onClick={() => setPartIdx(i)} style={{
              flex: 1, padding: '10px 8px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .16s', border: 'none',
              borderBottom: i === partIdx ? '3px solid #2563eb' : '3px solid transparent',
              background: i === partIdx ? '#eff4ff' : '#fff',
              color: i === partIdx ? '#2563eb' : '#64748b',
              fontFamily: 'Plus Jakarta Sans,sans-serif', whiteSpace: 'nowrap',
            }}>
              {p.title || `Part ${p.partNo}`}
            </button>
          ))}
        </div>
      </div>

      {/* ════ CONTENT: questions left, leaderboard right ═══ */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '20px 20px 40px', display: 'grid', gridTemplateColumns: '1fr', gap: 20, alignItems: 'start' }}>

        {/* Left — questions */}
        <div>
          {currentPart && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#475569', boxShadow: '0 1px 3px rgba(15,23,42,.06)' }}>
              <strong style={{ color: '#0f172a' }}>{currentPart.title || `Part ${currentPart.partNo}`}</strong>
              &nbsp;— Questions {(partIdx * 10) + 1}–{(partIdx + 1) * 10}
            </div>
          )}

          <div>
            {(currentPart?.sections || []).map(section => (
              <QuestionRenderer key={section.id} section={section} answers={answers} onChange={setAnswer} reviewMode={false} />
            ))}
          </div>

          {/* Bottom action bar */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, boxShadow: '0 1px 3px rgba(15,23,42,.06)' }}>
            <p style={{ fontSize: 13, color: '#475569' }}>
              Answered: <strong style={{ color: '#2563eb' }}>{answered}</strong> / {runTotal}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {partIdx > 0 && (
                <button onClick={() => setPartIdx(i => i - 1)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                  ← Previous
                </button>
              )}
              {partIdx < (test.parts?.length || 0) - 1 && (
                <button onClick={() => { setPartIdx(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                  Next Part →
                </button>
              )}
              <button onClick={() => handleFinish(false)} disabled={saving} style={{ padding: '9px 26px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', boxShadow: '0 4px 14px rgba(37,99,235,.28)', transition: 'all .2s' }}>
                {saving ? 'Saving…' : 'Finish & See Results →'}
              </button>
            </div>
          </div>
        </div>
   
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  )
}
