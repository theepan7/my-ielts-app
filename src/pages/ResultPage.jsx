// src/pages/ResultPage.jsx
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AudioPlayer          from '../components/AudioPlayer'
import QuestionRenderer     from '../components/QuestionRenderer'
import { ResultLeaderboard} from '../components/Leaderboard'
import { MIN_ANSWERS_FOR_BAND } from '../firebase/services'

export default function ResultPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  useEffect(() => { if (!state) navigate('/') }, [])
  if (!state) return null

  const { testTitle, correct, total, band, elapsed, partScores, answers, test } = state

  const hasBand  = band !== null && band !== undefined
  const pct      = Math.round((correct / total) * 100)
  const wrong    = total - correct
  const em       = Math.floor(elapsed / 60)
  const es       = (elapsed % 60).toString().padStart(2, '0')

  const bandColor =
    !hasBand             ? '#94a3b8' :
    parseFloat(band) >= 7 ? '#86efac' :
    parseFloat(band) >= 5.5 ? '#fde68a' : '#fca5a5'

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* ── Two-column grid ──────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* ══ LEFT: Result content ══════════════════════ */}
          <div>

            {/* Result hero */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 16, padding: '32px 24px',
              background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
              textAlign: 'center', marginBottom: 16,
              boxShadow: '0 4px 20px rgba(15,23,42,.14)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 0%,rgba(255,255,255,.07),transparent 55%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.55)', marginBottom: 8 }}>
                  Your Result — {testTitle}
                </p>

                {hasBand ? (
                  <>
                    <div style={{ fontFamily: 'Lora,serif', fontSize: '4.5rem', fontWeight: 600, color: bandColor, lineHeight: 1, marginBottom: 4 }}>
                      {band}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12.5, marginBottom: 20 }}>
                      IELTS Listening Band Score
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'Lora,serif', fontSize: '3rem', fontWeight: 600, color: '#94a3b8', lineHeight: 1, marginBottom: 8 }}>
                      {correct}/{total}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)',
                      borderRadius: 8, padding: '7px 14px', marginBottom: 14,
                    }}>
                      <span style={{ fontSize: 13 }}>ℹ️</span>
                      <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12.5, margin: 0 }}>
                        Answer at least <strong style={{ color: '#fff' }}>{MIN_ANSWERS_FOR_BAND}</strong> questions correctly for a band score.
                      </p>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, marginBottom: 14 }}>
                      This attempt does not count toward the leaderboard.
                    </p>
                  </>
                )}

                {/* Stats row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Correct',   value: correct,       color: '#86efac' },
                    { label: 'Incorrect', value: wrong,         color: '#fca5a5' },
                    { label: 'Score',     value: `${pct}%`,     color: '#fff'    },
                    { label: 'Time',      value: `${em}:${es}`, color: '#c4b5fd' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Lora,serif', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* No band notice */}
            {!hasBand && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                display: 'flex', gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📊</span>
                <div>
                  <p style={{ fontWeight: 700, color: '#92400e', fontSize: 13, marginBottom: 2 }}>
                    No band score awarded
                  </p>
                  <p style={{ color: '#92400e', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
                    You answered <strong>{correct}</strong> of {total} correctly.
                    Minimum <strong>{MIN_ANSWERS_FOR_BAND}</strong> correct required for a band score.
                    Review your answers below to improve!
                  </p>
                </div>
              </div>
            )}

            {/* Band reference */}
            {hasBand && (
              <div style={{
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,.06)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 10 }}>
                  Band Score Reference
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 7 }}>
                  {[
                    { b:'9.0',r:'39–40',c:'#059669',bg:'#ecfdf5',bo:'#a7f3d0' },
                    { b:'8.5',r:'37–38',c:'#059669',bg:'#ecfdf5',bo:'#a7f3d0' },
                    { b:'8.0',r:'35–36',c:'#0891b2',bg:'#ecfeff',bo:'#a5f3fc' },
                    { b:'7.5',r:'33–34',c:'#0891b2',bg:'#ecfeff',bo:'#a5f3fc' },
                    { b:'7.0',r:'30–32',c:'#2563eb',bg:'#eff4ff',bo:'#bfdbfe' },
                    { b:'6.5',r:'27–29',c:'#2563eb',bg:'#eff4ff',bo:'#bfdbfe' },
                    { b:'6.0',r:'23–26',c:'#d97706',bg:'#fffbeb',bo:'#fde68a' },
                    { b:'5.5',r:'20–22',c:'#d97706',bg:'#fffbeb',bo:'#fde68a' },
                    { b:'5.0',r:'16–19',c:'#dc2626',bg:'#fef2f2',bo:'#fecaca' },
                    { b:'4.5',r:'13–15',c:'#dc2626',bg:'#fef2f2',bo:'#fecaca' },
                  ].map(item => (
                    <div key={item.b} style={{
                      background: item.bg, border: `1px solid ${item.bo}`,
                      borderRadius: 7, padding: '7px 4px', textAlign: 'center',
                      ...(item.b === band ? { boxShadow: `0 0 0 2px ${item.c}`, transform: 'scale(1.06)' } : {}),
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: item.c }}>{item.b}</div>
                      <div style={{ fontSize: 9.5, color: item.c, opacity: .7, marginTop: 1 }}>{item.r}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part breakdown */}
            {partScores && Object.keys(partScores).length > 0 && (
              <div style={{
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,.06)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', marginBottom: 10 }}>
                  Part Breakdown
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {Object.entries(partScores).map(([partNo, sc]) => {
                    const pp = Math.round((sc.correct / Math.max(sc.total, 1)) * 100)
                    return (
                      <div key={partNo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', minWidth: 48, flexShrink: 0 }}>
                          Part {partNo}
                        </span>
                        <div style={{ flex: 1, height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pp}%`, height: '100%', borderRadius: 4,
                            background: pp >= 70 ? 'linear-gradient(90deg,#059669,#34d399)'
                              : pp >= 50 ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                              : 'linear-gradient(90deg,#dc2626,#f87171)',
                          }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', minWidth: 36, textAlign: 'right', flexShrink: 0 }}>
                          {sc.correct}/{sc.total}
                        </span>
                        {sc.band && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', minWidth: 26, flexShrink: 0 }}>
                            {sc.band}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full answer review */}
            {test && answers && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8' }}>
                    Full Answer Review
                  </p>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>
                {(test.parts || []).map(part => (
                  <div key={part.id || part.partNo} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <h3 style={{ fontFamily: 'Lora,serif', fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
                        {part.title || `Part ${part.partNo}`}
                      </h3>
                      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                      {partScores?.[part.partNo] && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                          {partScores[part.partNo].correct}/{partScores[part.partNo].total}
                        </span>
                      )}
                    </div>
                    {part.audioUrl && (
                      <AudioPlayer audioUrl={part.audioUrl} partTitle={part.title || `Part ${part.partNo}`} />
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '10px 22px', borderRadius: 8, border: 'none',
                  background: '#2563eb', color: '#fff', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                ← Back to Tests
              </button>
              <button
                onClick={() => navigate(`/test/${state.testDocId}`)}
                style={{
                  padding: '10px 22px', borderRadius: 8,
                  border: '1.5px solid #cbd5e1', background: 'transparent',
                  color: '#475569', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {hasBand ? 'Retry This Test' : '↻ Try Again'}
              </button>
            </div>
          </div>

          {/* ══ RIGHT: Per-test leaderboard ═══════════════ */}
          <div>
            <ResultLeaderboard
              testId={test?.id}
              testTitle={testTitle}
              userElapsed={elapsed}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
