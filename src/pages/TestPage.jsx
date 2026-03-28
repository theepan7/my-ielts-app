import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTestDetail } from '../firebase/services'
import AudioPlayer from '../components/AudioPlayer'
import QuestionBlock from '../components/QuestionBlock'

// Fallback section generator for mock data
function buildMockSections(testId) {
  return Array.from({ length: 4 }, (_, si) => {
    const sid = si + 1
    return {
      id: `sec-${sid}`,
      sectionNo: sid,
      title: `Section ${sid}`,
      audioUrl: `https://your-storage.firebaseapp.com/ielts-audio/test-${testId}-sec-${sid}.mp3`,
      questions: Array.from({ length: 10 }, (_, qi) => {
        const qno = si * 10 + qi + 1
        const isMCQ = qno % 5 !== 0
        return {
          id: `q-${qno}`,
          questionNo: qno,
          type: isMCQ ? 'mcq' : 'fill',
          text: isMCQ
            ? `What does the ${['speaker', 'lecturer', 'presenter', 'interviewer'][si]} state about item ${qno} in the recording?`
            : `Complete the note: The ${['discussion', 'talk', 'lecture', 'interview'][si]} explains that the __________ requires attention. (Q${qno})`,
          options: isMCQ
            ? [
                'A — A key fact mentioned at the start of the recording',
                'B — Information given by the second participant',
                'C — A detail stated clearly near the end',
                'D — An implied point based on context',
              ]
            : null,
          answer: isMCQ ? String(qno % 4) : 'key point',
        }
      }),
    }
  })
}

const TOTAL_SECONDS = 30 * 60

export default function TestPage({ onAuthClick, showToast }) {
  const { testId }   = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [sections,  setSections]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [secIdx,    setSecIdx]    = useState(0)
  const [answers,   setAnswers]   = useState({})
  const [timeLeft,  setTimeLeft]  = useState(TOTAL_SECONDS)
  const startTime   = useRef(Date.now())
  const timerRef    = useRef(null)

  // Load sections from Firestore (or use mock)
  useEffect(() => {
    fetchTestDetail(testId)
      .then(data => {
        setSections(data.length > 0 ? data : buildMockSections(testId))
      })
      .catch(() => setSections(buildMockSections(testId)))
      .finally(() => setLoading(false))
  }, [testId])

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const currentSection = sections[secIdx] || {}
  const allQuestions   = sections.flatMap(s => s.questions || [])
  const answeredCount  = Object.keys(answers).length

  const fmt = t => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`

  function setAnswer(qId, val) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  async function handleSubmit(autoSubmit = false) {
    clearInterval(timerRef.current)
    if (!autoSubmit && answeredCount < allQuestions.length) {
      const go = window.confirm(`You've answered ${answeredCount} of ${allQuestions.length} questions. Submit anyway?`)
      if (!go) return
    }

    // Score calculation
    let correct = 0
    allQuestions.forEach(q => {
      const a = answers[q.id]
      if (q.type === 'mcq' && a === Number(q.answer)) correct++
      if (q.type === 'fill' && typeof a === 'string' &&
          a.trim().toLowerCase() === String(q.answer).toLowerCase()) correct++
    })
    const elapsed = Math.round((Date.now() - startTime.current) / 1000)
    const band    = getBand(correct)

    // Save to localStorage for guest or use Firestore for logged-in user
    if (!user) {
      const done = JSON.parse(localStorage.getItem('ielts_guest_done') || '[]')
      if (!done.includes(Number(testId.replace('test-', '')))) {
        done.push(Number(testId.replace('test-', '')))
        localStorage.setItem('ielts_guest_done', JSON.stringify(done))
      }
    }

    // Navigate to results
    navigate('/result', {
      state: {
        testId,
        correct,
        total: allQuestions.length,
        band,
        elapsed,
        answers,
        questions: allQuestions,
      }
    })
  }

  function getBand(c) {
    if (c >= 39) return '9.0'; if (c >= 37) return '8.5'; if (c >= 35) return '8.0'
    if (c >= 33) return '7.5'; if (c >= 30) return '7.0'; if (c >= 27) return '6.5'
    if (c >= 23) return '6.0'; if (c >= 20) return '5.5'; if (c >= 16) return '5.0'
    return '4.5'
  }

  function exitTest() {
    if (window.confirm('Exit test? Your progress will be lost.')) {
      clearInterval(timerRef.current)
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 screen-enter">
      {/* Top bar */}
      <div className="card flex items-center justify-between flex-wrap gap-3 px-5 py-4 mb-5">
        <div>
          <h2 className="font-serif font-semibold text-slate-800 text-base">
            IELTS Listening Test — {testId}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">4 Sections · 40 Questions · Audio plays once per section</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-lg">
            <span className="text-slate-400 text-xs">⏱</span>
            <span className={`font-serif font-bold text-lg tabular-nums ${timeLeft < 120 ? 'timer-warn' : 'text-blue-600'}`}>
              {fmt(timeLeft)}
            </span>
          </div>
          <button onClick={exitTest} className="btn-ghost text-xs py-1.5 px-3">← Exit</button>
        </div>
      </div>

      {/* Audio player */}
      <AudioPlayer
        audioUrl={currentSection.audioUrl}
        sectionTitle={currentSection.title || `Section ${secIdx + 1}`}
        topic={`Test ${testId}`}
      />

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSecIdx(i)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              i === secIdx
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {s.title || `Section ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {(currentSection.questions || []).map(q => (
          <QuestionBlock
            key={q.id}
            question={q}
            answer={answers[q.id]}
            onChange={val => setAnswer(q.id, val)}
            reviewMode={false}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Answered: <strong className="text-blue-600">{answeredCount}</strong> / {allQuestions.length}
        </p>
        <button
          onClick={() => handleSubmit(false)}
          className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold px-7 py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Submit Test →
        </button>
      </div>
    </div>
  )
}
