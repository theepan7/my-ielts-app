// src/pages/BandScorePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Data ─────────────────────────────────────────────────
const BAND_DATA = [
  {
    band: 9.0, rawMin: 39, rawMax: 40,
    label: 'Expert User',
    color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4',
    desc: 'Full operational command of the language. Rare and outstanding performance.',
  },
  {
    band: 8.5, rawMin: 37, rawMax: 38,
    label: 'Very Good User',
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    desc: 'Fully operational command with only occasional unsystematic inaccuracies.',
  },
  {
    band: 8.0, rawMin: 35, rawMax: 36,
    label: 'Very Good User',
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    desc: 'Handles complex language well. Minor misunderstandings in unfamiliar situations.',
  },
  {
    band: 7.5, rawMin: 32, rawMax: 34,
    label: 'Good User',
    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe',
    desc: 'Operational command with occasional inaccuracies. Generally handles complex language.',
  },
  {
    band: 7.0, rawMin: 30, rawMax: 31,
    label: 'Good User',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    desc: 'Good working knowledge. Handles complex language despite occasional errors.',
  },
  {
    band: 6.5, rawMin: 26, rawMax: 29,
    label: 'Competent User',
    color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff',
    desc: 'Effective command in familiar situations. Occasional misunderstandings.',
  },
  {
    band: 6.0, rawMin: 23, rawMax: 25,
    label: 'Competent User',
    color: '#c026d3', bg: '#fdf4ff', border: '#f5d0fe',
    desc: 'Generally effective command despite inaccuracies. Can use and understand complex language.',
  },
  {
    band: 5.5, rawMin: 18, rawMax: 22,
    label: 'Modest User',
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    desc: 'Partial command. Copes with overall meaning in most situations.',
  },
  {
    band: 5.0, rawMin: 16, rawMax: 17,
    label: 'Modest User',
    color: '#e11d48', bg: '#fff1f2', border: '#fecdd3',
    desc: 'Partial command. Likely to make many mistakes. Should handle basic communication.',
  },
  {
    band: 4.5, rawMin: 13, rawMax: 15,
    label: 'Limited User',
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    desc: 'Basic competence limited to familiar situations. Frequent problems in understanding.',
  },
  {
    band: 4.0, rawMin: 10, rawMax: 12,
    label: 'Limited User',
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    desc: 'Basic competence with considerable difficulty in unfamiliar situations.',
  },
  {
    band: 3.5, rawMin: 8,  rawMax: 9,
    label: 'Extremely Limited',
    color: '#92400e', bg: '#fef3c7', border: '#fcd34d',
    desc: 'Conveys and understands only general meaning in familiar situations. Frequent breakdowns.',
  },
  {
    band: 3.0, rawMin: 6,  rawMax: 7,
    label: 'Extremely Limited',
    color: '#78350f', bg: '#fef9c3', border: '#fde047',
    desc: 'Very limited understanding. Great difficulty even in familiar situations.',
  },
]

const TIPS = [
  {
    icon: '🎧',
    title: 'Listen for Keywords',
    body: 'Focus on nouns, verbs and numbers. These are almost always the answer or a clue to it.',
  },
  {
    icon: '📝',
    title: 'Read Ahead',
    body: 'Use every gap to skim the upcoming questions. Knowing what to listen for next is half the battle.',
  },
  {
    icon: '✏️',
    title: 'Write While Listening',
    body: 'Jot down answers immediately — don\'t wait. You can tidy spelling in the transfer time.',
  },
  {
    icon: '🔄',
    title: 'Beware of Distractors',
    body: 'Speakers often correct themselves or change their mind. The final answer is what counts.',
  },
  {
    icon: '🔢',
    title: 'Check Spelling & Numbers',
    body: 'One wrong letter or digit = zero marks. Double-check during the 10-minute transfer time.',
  },
  {
    icon: '📻',
    title: 'Train Your Ear Daily',
    body: 'Listen to BBC, podcasts, or TED Talks every day. Exposure to natural accents is irreplaceable.',
  },
]

const SCORE_REQUIREMENTS = [
  { purpose: 'UK Skilled Worker Visa',      min: 4.0 },
  { purpose: 'Australian Skilled Migration', min: 6.0 },
  { purpose: 'Canadian Express Entry',       min: 6.0 },
  { purpose: 'UK University (Undergrad)',    min: 5.5 },
  { purpose: 'UK University (Postgrad)',     min: 6.5 },
  { purpose: 'US University (Grad)',         min: 6.5 },
  { purpose: 'Australian University',        min: 6.0 },
  { purpose: 'Medical / Nursing (OET alt)', min: 7.0 },
]

// ─────────────────────────────────────────────────────────
export default function BandScorePage() {
  const navigate = useNavigate()
  const [rawScore,    setRawScore]    = useState('')
  const [highlighted, setHighlighted] = useState(null)

  // Calculate band from raw score input
  const calculated = (() => {
    const n = parseInt(rawScore, 10)
    if (isNaN(n) || n < 0 || n > 40) return null
    return BAND_DATA.find(b => n >= b.rawMin && n <= b.rawMax) || null
  })()

  function getBandWidth(band) {
    // proportional fill for the bar
    return `${((band - 3) / 6) * 100}%`
  }

  return (
    <div style={{
      background: '#f4f6fb',
      minHeight: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      paddingBottom: 80,
    }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #7c3aed 100%)',
        padding: '52px 24px 44px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255,255,255,.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
        }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 20, left: 24,
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
            color: '#fff', borderRadius: 8, padding: '6px 14px',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          ← Back
        </button>

        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,.15)',
          fontSize: 26, marginBottom: 16,
        }}>
          🎯
        </div>

        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 700, color: '#fff', margin: '0 0 10px',
          letterSpacing: '-.02em',
        }}>
          IELTS Listening Band Score Guide
        </h1>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,.75)',
          maxWidth: 520, margin: '0 auto 28px',
          lineHeight: 1.6,
        }}>
          Understand exactly how your raw score converts to a band,
          what each band means, and how to improve.
        </p>

        {/* Raw score calculator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 0,
          background: 'rgba(255,255,255,.12)',
          border: '1px solid rgba(255,255,255,.25)',
          borderRadius: 12, padding: '6px 6px 6px 16px',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, fontWeight: 500, marginRight: 10 }}>
            My raw score:
          </span>
          <input
            type="number" min="0" max="40"
            value={rawScore}
            onChange={e => setRawScore(e.target.value)}
            placeholder="0–40"
            style={{
              width: 70, padding: '8px 10px', borderRadius: 8,
              border: 'none', background: '#fff',
              fontSize: 15, fontWeight: 700, color: '#1e40af',
              outline: 'none', textAlign: 'center',
            }}
          />
          {calculated && (
            <div style={{
              marginLeft: 10, padding: '6px 16px', borderRadius: 8,
              background: calculated.color, color: '#fff',
              fontSize: 14, fontWeight: 700,
              animation: 'fadeIn .2s ease',
            }}>
              Band {calculated.band} · {calculated.label}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 0' }}>

        {/* ── Conversion Table ─────────────────────── */}
        <Section title="Raw Score → Band Conversion" icon="📊">
          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,23,42,.07)',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '90px 120px 1fr 160px',
              padding: '10px 18px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.06em',
              color: '#94a3b8',
            }}>
              <span>Band</span>
              <span>Raw Score</span>
              <span>Score Bar</span>
              <span>Descriptor</span>
            </div>

            {BAND_DATA.map((b, i) => {
              const isHighlighted = highlighted === i || (calculated && calculated.band === b.band)
              return (
                <div
                  key={b.band}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseLeave={() => setHighlighted(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 120px 1fr 160px',
                    padding: '11px 18px',
                    borderBottom: i < BAND_DATA.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: isHighlighted ? b.bg : '#fff',
                    transition: 'background .15s',
                    cursor: 'default',
                    alignItems: 'center',
                  }}
                >
                  {/* Band */}
                  <div style={{
                    fontFamily: 'Lora, serif', fontSize: 18,
                    fontWeight: 700, color: b.color,
                  }}>
                    {b.band}
                  </div>

                  {/* Raw */}
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {b.rawMin === b.rawMax ? b.rawMin : `${b.rawMin} – ${b.rawMax}`}
                    <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>
                      / 40
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{ paddingRight: 20 }}>
                    <div style={{
                      height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: getBandWidth(b.band),
                        height: '100%',
                        background: b.color,
                        borderRadius: 3,
                        transition: 'width .4s ease',
                      }} />
                    </div>
                  </div>

                  {/* Descriptor */}
                  <div style={{
                    fontSize: 11.5, fontWeight: 700,
                    color: b.color,
                    background: b.bg,
                    border: `1px solid ${b.border}`,
                    borderRadius: 20,
                    padding: '3px 10px',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                  }}>
                    {b.label}
                  </div>
                </div>
              )
            })}
          </div>

          {calculated && (
            <div style={{
              marginTop: 14, padding: '14px 18px',
              background: calculated.bg,
              border: `1.5px solid ${calculated.border}`,
              borderRadius: 10,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              animation: 'fadeIn .25s ease',
            }}>
              <div style={{
                fontSize: 28, fontFamily: 'Lora, serif',
                fontWeight: 700, color: calculated.color, flexShrink: 0,
              }}>
                {calculated.band}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                  {calculated.label}
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  {calculated.desc}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Band Descriptors ─────────────────────── */}
        <Section title="What Each Band Means" icon="📖" mt={28}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}>
            {[
              { range: '8.5 – 9.0', label: 'Expert / Very Good', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4',
                points: ['Near-perfect comprehension', 'Handles any accent with ease', 'Distinguishes subtle nuances'] },
              { range: '7.0 – 8.0', label: 'Good User', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
                points: ['Strong comprehension overall', 'Minor errors in fast speech', 'Ready for most universities'] },
              { range: '5.5 – 6.5', label: 'Competent / Modest', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
                points: ['Understands main ideas clearly', 'Struggles with fast/complex audio', 'Typical working professional'] },
              { range: '4.0 – 5.0', label: 'Limited User', color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
                points: ['Misses detail in conversations', 'Difficulties with long recordings', 'Needs focused listening practice'] },
            ].map(d => (
              <div key={d.range} style={{
                background: d.bg, border: `1px solid ${d.border}`,
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{
                  fontFamily: 'Lora, serif', fontSize: 15,
                  fontWeight: 700, color: d.color, marginBottom: 2,
                }}>
                  Band {d.range}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: d.color, marginBottom: 10, opacity: .8 }}>
                  {d.label}
                </div>
                {d.points.map(p => (
                  <div key={p} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 7,
                    fontSize: 12.5, color: '#374151', marginBottom: 5,
                  }}>
                    <span style={{ color: d.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Score Requirements ───────────────────── */}
        <Section title="Typical Score Requirements" icon="🌍" mt={28}>
          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,23,42,.07)',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '10px 18px',
              background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8',
            }}>
              <span>Purpose / Institution Type</span>
              <span>Min. Listening Band</span>
            </div>
            {SCORE_REQUIREMENTS.map((r, i) => {
              const band = BAND_DATA.find(b => b.band === r.min)
              return (
                <div key={r.purpose} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  padding: '11px 18px', alignItems: 'center',
                  borderBottom: i < SCORE_REQUIREMENTS.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: '#fff',
                }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                    {r.purpose}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: band?.color || '#2563eb',
                    background: band?.bg || '#eff6ff',
                    border: `1px solid ${band?.border || '#bfdbfe'}`,
                    borderRadius: 20, padding: '3px 14px',
                  }}>
                    {r.min}+
                  </span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 }}>
            * Requirements vary by institution and change over time. Always verify with the official body before applying.
          </p>
        </Section>

        {/* ── Tips ─────────────────────────────────── */}
        <Section title="Tips to Improve Your Score" icon="💡" mt={28}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}>
            {TIPS.map(t => (
              <div key={t.title} style={{
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: 10, padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(15,23,42,.06)',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: '#eff4ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
                    {t.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA ──────────────────────────────────── */}
        <div style={{
          marginTop: 32, borderRadius: 14,
          background: 'linear-gradient(135deg,#1e3a8a,#7c3aed)',
          padding: '32px 28px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,.06)',
          }} />
          <div style={{
            fontFamily: 'Lora, serif', fontSize: 20,
            fontWeight: 700, color: '#fff', marginBottom: 8,
          }}>
            Ready to test your listening?
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginBottom: 20 }}>
            Practice with 100 full IELTS-style listening tests and track your band score progress.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '11px 28px', borderRadius: 9, border: 'none',
              background: '#fff', color: '#1e3a8a',
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(0,0,0,.2)',
              transition: 'all .16s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Browse All Tests →
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────
function Section({ title, icon, children, mt = 0 }) {
  return (
    <div style={{ marginTop: mt }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: '#eff4ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
        }}>
          {icon}
        </span>
        <h2 style={{
          fontFamily: 'Lora, serif', fontSize: 16,
          fontWeight: 700, color: '#0f172a', margin: 0,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
