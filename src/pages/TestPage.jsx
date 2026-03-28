// src/pages/TestPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import { fetchTestWithQuestions, saveResult, calcBand } from '../firebase/services'
import AudioPlayer    from '../components/AudioPlayer'
import QuestionRenderer from '../components/QuestionRenderer'

export default function TestPage({ showToast }) {
  const { testId }  = useParams()
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [test,     setTest]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [partIdx,  setPartIdx]  = useState(0)
  const [answers,  setAnswers]  = useState({})   // { qNo: value }
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [saving,   setSaving]   = useState(false)

  const timerRef    = useRef(null)
  const startTime   = useRef(Date.now())

  // ── Fetch test from Firestore ───────────────────────────
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
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleFinish(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // ── Answer handler ──────────────────────────────────────
  function setAnswer(qNo, value) {
    setAnswers(prev => ({ ...prev, [qNo]: value }))
  }

  // ── Score calculator ────────────────────────────────────
  function calculateScore() {
    if (!test) return { correct: 0, total: 0, partScores: {} }

    let totalCorrect = 0
    let totalQs      = 0
    const partScores = {}

    test.parts.forEach(part => {
      let partCorrect = 0
      let partTotal   = 0

      part.sections.forEach(section => {
        const fields = getAllFields(section)
        fields.forEach(({ qNo, answer }) => {
          partTotal++
          const userAns = String(answers[qNo] || '').trim().toLowerCase()
          const correct = String(answer || '').trim().toLowerCase()
          if (userAns === correct) { partCorrect++; totalCorrect++ }
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

  // Extract all answerable fields from any section type
  function getAllFields(section) {
    const fields = []
    if (section.type === 'form') {
      (section.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer }))
    } else if (section.type === 'table') {
      (section.rows || []).forEach(row =>
        (row.cells || []).forEach(cell => {
          if (cell.qNo) fields.push({ qNo: cell.qNo, answer: cell.answer })
        })
      )
    } else if (section.type === 'mcq') {
      (section.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
    } else if (section.type === 'fill') {
      (section.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
    } else if (section.type === 'notes') {
      (section.lines || []).forEach(line =>
        (line.fields || []).forEach(f => fields.push({ qNo: f.qNo, answer: f.answer }))
      )
    } else if (section.type === 'map') {
      (section.questions || []).forEach(q => fields.push({ qNo: q.qNo, answer: q.answer }))
    } else if (section.type === 'matching') {
      (section.items || []).forEach(item => fields.push({ qNo: item.qNo, answer: item.answer }))
    }
    return fields
  }

  // ── Finish test ─────────────────────────────────────────
  async function handleFinish(autoSubmit = false) {
    if (!autoSubmit) {
      const { total } = calculateScore()
      const answered  = Object.keys(answers).length
      if (answered < total) {
        const ok = window.confirm(
          `You have answered ${answered} of ${total} questions. Submit anyway?`
        )
        if (!ok) return
      }
    }

    clearInterval(timerRef.current)

    const { correct, total, partScores } = calculateScore()
    const band    = calcBand(correct)
    const elapsed = Math.round((Date.now() - startTime.current) / 1000)

    // Save to Firestore if logged in
    if (user) {
      setSaving(true)
      try {
        await saveResult(
          user.uid,
          user.displayName || user.email,
          testId,
          test.id,
          correct,
          total,
          band,
          partScores
        )
        showToast('Result saved! Leaderboard updated ✓', 'success')
      } catch (err) {
        console.error(err)
        showToast('Could not save result — check your connection', 'error')
      }
      setSaving(false)
    }

    navigate('/result', {
      state: {
        testId,
        testDocId: testId,
        testTitle: test?.title,
        correct,
        total,
        band,
        elapsed,
        partScores,
        answers,
        test,
      }
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
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 font-semibold mb-2">Failed to load test</p>
      <p className="text-slate-400 text-sm">{error}</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6 px-6 py-2">
        ← Back to Tests
      </button>
    </div>
  )

  const currentPart   = test.parts?.[partIdx]
  const { correct: runCorrect, total: runTotal } = calculateScore()
  const answered      = Object.keys(answers).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* ── Top bar ── */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif font-semibold text-slate-800 text-base leading-tight">
            {test.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {test.category === 'academic' ? 'Academic' : 'General Training'}
            &nbsp;·&nbsp; 4 Parts &nbsp;·&nbsp; {runTotal} Questions
            {answered > 0 && (
              <span className="text-green-600 font-semibold ml-2">
                · {answered} answered
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Part indicators */}
          <div className="hidden sm:flex gap-1.5">
            {(test.parts || []).map((p, i) => (
              <div
                key={p.partNo}
                className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all ${
                  i === partIdx
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                P{p.partNo}
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className={`font-mono font-bold text-lg px-3.5 py-1.5 rounded-lg border ${
            timeLeft < 120
              ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
              : 'bg-slate-100 border-slate-200 text-blue-700'
          }`}>
            {fmt(timeLeft)}
          </div>

          <button
            onClick={exitTest}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Exit
          </button>
        </div>
      </div>

      {/* ── Part tabs ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(test.parts || []).map((p, i) => (
          <button
            key={p.partNo}
            onClick={() => setPartIdx(i)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all ${
              i === partIdx
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {p.title || `Part ${p.partNo}`}
          </button>
        ))}
      </div>

      {/* ── Audio player ── */}
      {currentPart?.audioUrl && (
        <AudioPlayer
          key={currentPart.id}
          audioUrl={currentPart.audioUrl}
          partTitle={currentPart.title || `Part ${currentPart.partNo}`}
        />
      )}

      {/* ── Questions ── */}
      <div className="space-y-0">
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

      {/* ── Footer ── */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 mt-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          Answered: <strong className="text-blue-600">{answered}</strong> / {runTotal}
        </p>

        <div className="flex gap-2.5">
          {partIdx < (test.parts?.length || 0) - 1 && (
            <button
              onClick={() => setPartIdx(i => i + 1)}
              className="btn-ghost text-sm px-5 py-2"
            >
              Next Part →
            </button>
          )}
          <button
            onClick={() => handleFinish(false)}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold px-7 py-2.5 rounded-lg text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Finish & See Results →'}
          </button>
        </div>
      </div>
    </div>
  )
}
