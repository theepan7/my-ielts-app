// src/pages/ResultPage.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect }                from 'react'
import AudioPlayer                  from '../components/AudioPlayer'
import QuestionRenderer             from '../components/QuestionRenderer'

export default function ResultPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  useEffect(() => {
    if (!state) navigate('/')
  }, [])

  if (!state) return null

  const { testTitle, correct, total, band, elapsed, partScores, answers, test } = state
  const pct   = Math.round((correct / total) * 100)
  const em    = Math.floor(elapsed / 60)
  const es    = (elapsed % 60).toString().padStart(2, '0')
  const wrong = total - correct

  const bandColor = parseFloat(band) >= 7.0
    ? 'text-green-300' : parseFloat(band) >= 5.5
      ? 'text-amber-300' : 'text-red-300'

  // Official IELTS Listening band score conversion table
  const BAND_TABLE = [
    { b: '9.0',  r: '39–40', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { b: '8.5',  r: '37–38', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { b: '8.0',  r: '35–36', c: 'bg-teal-50    text-teal-700    border-teal-200'    },
    { b: '7.5',  r: '32–34', c: 'bg-teal-50    text-teal-700    border-teal-200'    },
    { b: '7.0',  r: '30–31', c: 'bg-blue-50    text-blue-700    border-blue-200'    },
    { b: '6.5',  r: '26–29', c: 'bg-blue-50    text-blue-700    border-blue-200'    },
    { b: '6.0',  r: '23–25', c: 'bg-amber-50   text-amber-700   border-amber-200'   },
    { b: '5.5',  r: '18–22', c: 'bg-amber-50   text-amber-700   border-amber-200'   },
    { b: '5.0',  r: '16–17', c: 'bg-orange-50  text-orange-700  border-orange-200'  },
    { b: '4.5',  r: '13–15', c: 'bg-red-50     text-red-700     border-red-200'     },
    { b: '4.0',  r: '11–12', c: 'bg-red-50     text-red-700     border-red-200'     },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Result hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 to-violet-700 p-8 text-center mb-5 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_0%,rgba(255,255,255,.07),transparent_55%)]" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-2">Your Result</p>
          <div className={`font-serif text-6xl font-semibold leading-none mb-1 ${bandColor}`}>
            {band}
          </div>
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

      {/* ── Band score reference ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 shadow-sm">
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Band Score Reference
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {BAND_TABLE.map(item => (
            <div
              key={item.b}
              className={`text-center p-1.5 rounded-lg border text-[10px] font-semibold ${item.c}
                ${item.b === band ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : ''}`}
            >
              <div className="font-bold">{item.b}</div>
              <div className="opacity-70 text-[9px]">{item.r}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Part breakdown ── */}
      {partScores && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 shadow-sm">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Part Breakdown
          </p>
          <div className="space-y-2.5">
            {Object.entries(partScores).map(([partNo, sc]) => {
              const pPct = Math.round((sc.correct / sc.total) * 100)
              return (
                <div key={partNo} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 w-16 flex-shrink-0">
                    Part {partNo}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pPct >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : pPct >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-16 text-right flex-shrink-0">
                    {sc.correct}/{sc.total}
                  </span>
                  <span
                    className="text-xs font-bold w-10 flex-shrink-0 text-right"
                    style={{ color: pPct >= 70 ? '#059669' : pPct >= 50 ? '#d97706' : '#dc2626' }}
                  >
                    {pPct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Full answer review ── */}
      {test && answers && (
        <div className="mb-5">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Full Answer Review
            <span className="h-px flex-1 bg-slate-200 block" />
          </p>

          {(test.parts || []).map(part => (
            <div key={part.id} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-serif font-semibold text-slate-700 text-sm">
                  {part.title || `Part ${part.partNo}`}
                </h3>
                <div className="flex-1 h-px bg-slate-200" />
                {partScores?.[part.partNo] && (
                  <span className="text-xs font-bold text-blue-600">
                    {partScores[part.partNo].correct}/{partScores[part.partNo].total}
                  </span>
                )}
              </div>

              {part.audioUrl && (
                <AudioPlayer
                  key={`review-${part.id}`}
                  audioUrl={part.audioUrl}
                  partTitle={part.title || `Part ${part.partNo}`}
                />
              )}

              {(part.sections || []).map(section => (
                <QuestionRenderer
                  key={section.id}
                  section={section}
                  answers={answers}
                  onChange={() => {}}
                  reviewMode={true}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          ← Back to Tests
        </button>
        <button
          onClick={() => navigate(`/test/${state.testDocId}`)}
          className="btn-ghost px-6 py-2.5 text-sm"
        >
          Retry This Test
        </button>
      </div>
    </div>
  )
}
