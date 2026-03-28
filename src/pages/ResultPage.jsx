import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { saveResult } from '../firebase/services'
import QuestionBlock from '../components/QuestionBlock'

export default function ResultPage({ showToast }) {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  // If no result state, redirect home
  useEffect(() => {
    if (!state) { navigate('/'); return }
    // Save result to Firestore for logged-in users
    if (user && state) {
      saveResult(
        user.uid,
        state.testId,
        state.correct,
        state.band,
        state.answers || {}
      ).catch(() => {})
    }
  }, [])

  if (!state) return null

  const { correct, total, band, elapsed, answers, questions } = state
  const pct     = Math.round((correct / total) * 100)
  const em      = Math.floor(elapsed / 60)
  const es      = (elapsed % 60).toString().padStart(2, '0')
  const wrong   = total - correct

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 screen-enter">

      {/* Result Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 to-violet-700 p-8 text-center mb-6 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_0%,rgba(255,255,255,.07),transparent_55%)]" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-2">Your Result</p>
          <div className="font-serif text-6xl font-semibold text-white leading-none mb-1">{band}</div>
          <p className="text-blue-200 text-sm mb-6">IELTS Listening Band Score</p>
          <div className="flex justify-center gap-10 flex-wrap">
            <div className="text-center">
              <div className="font-serif text-2xl font-bold text-green-300">{correct}</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Correct</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl font-bold text-red-300">{wrong}</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl font-bold text-white">{pct}%</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Score</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl font-bold text-white">{em}:{es}</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Time Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Band guide */}
      <div className="card p-4 mb-5">
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">📊 Band Score Guide</p>
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
          {[
            { band: '9.0', range: '39–40', color: 'bg-green-100 text-green-700 border-green-300' },
            { band: '8.5', range: '37–38', color: 'bg-green-100 text-green-700 border-green-300' },
            { band: '8.0', range: '35–36', color: 'bg-teal-100 text-teal-700 border-teal-300' },
            { band: '7.5', range: '33–34', color: 'bg-teal-100 text-teal-700 border-teal-300' },
            { band: '7.0', range: '30–32', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            { band: '6.5', range: '27–29', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            { band: '6.0', range: '23–26', color: 'bg-amber-100 text-amber-700 border-amber-300' },
            { band: '5.5', range: '20–22', color: 'bg-amber-100 text-amber-700 border-amber-300' },
            { band: '5.0', range: '16–19', color: 'bg-red-100 text-red-700 border-red-300' },
          ].map(b => (
            <div key={b.band} className={`text-center p-1.5 rounded-lg border text-[10px] font-semibold ${b.color} ${b.band === band ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}>
              <div className="font-bold">{b.band}</div>
              <div className="font-normal opacity-70">{b.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer review */}
      <div className="card p-4 mb-5">
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Answer Review ({questions.length} Questions)
        </p>
        <div className="space-y-3">
          {questions.map(q => (
            <QuestionBlock
              key={q.id}
              question={q}
              answer={answers[q.id]}
              onChange={() => {}}
              reviewMode={true}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          ← Back to Tests
        </button>
        <button
          onClick={() => navigate(`/test/${state.testId}`)}
          className="btn-ghost px-6 py-2.5 text-sm"
        >
          Retry This Test
        </button>
      </div>
    </div>
  )
}
