// src/pages/BandScorePage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const BAND_DATA = [
  {
    band: '9.0', correct: '39–40', label: 'Expert',
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    desc: 'Full operational command of the language. Complete understanding with no errors.',
  },
  {
    band: '8.5', correct: '37–38', label: 'Very Good',
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    desc: 'Very good command with occasional inaccuracies. Handles complex language well.',
  },
  {
    band: '8.0', correct: '35–36', label: 'Very Good',
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    desc: 'Very good command. Occasional unsystematic inaccuracies may occur.',
  },
  {
    band: '7.5', correct: '33–34', label: 'Good',
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    desc: 'Good operational command with occasional inaccuracies in complex situations.',
  },
  {
    band: '7.0', correct: '30–32', label: 'Good',
    color: '#2563eb', bg: '#eff4ff', border: '#bfdbfe',
    desc: 'Good command with some inaccuracies. Generally handles complex language well.',
  },
  {
    band: '6.5', correct: '27–29', label: 'Competent',
    color: '#2563eb', bg: '#eff4ff', border: '#bfdbfe',
    desc: 'Competent command with occasional inaccuracies. Understands fairly complex language.',
  },
  {
    band: '6.0', correct: '23–26', label: 'Competent',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    desc: 'Generally effective command despite inaccuracies. Can use and understand complex language.',
  },
  {
    band: '5.5', correct: '20–22', label: 'Modest',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    desc: 'Partial command of the language. Copes with overall meaning in most situations.',
  },
  {
    band: '5.0', correct: '16–19', label: 'Modest',
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    desc: 'Partial command. Likely to make many mistakes and to misunderstand in some situations.',
  },
  {
    band: '4.5', correct: '13–15', label: 'Limited',
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    desc: 'Limited command. Copes with familiar topics but has frequent problems.',
  },
  {
    band: '4.0', correct: '10–12', label: 'Limited',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    desc: 'Basic competence limited to familiar situations. Has frequent comprehension problems.',
  },
]

const TIPS = [
  { icon: '🎯', tip: 'Read questions before listening — predict what type of answer you need.' },
  { icon: '✏️', tip: 'Write answers as you listen — do not wait for pauses.' },
  { icon: '🔄', tip: 'Watch spelling carefully — wrong spelling = wrong answer.' },
  { icon: '🔢', tip: 'Pay attention to word limits — "no more than two words" means exactly that.' },
  { icon: '🔊', tip: 'Audio plays only once in the real exam — practise not rewinding.' },
  { icon: '📝', tip: 'Transfer answers carefully in the real exam — you get 10 minutes at the end.' },
]

export default function BandScorePage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        height: 75, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
      }}>
        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 600,
          color: '#fff', margin: 0,
        }}>
          IELTS Listening Band Score Guide
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 22px 60px' }}>

        {/* How scores work */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 14, padding: '24px 28px', marginBottom: 28,
          boxShadow: '0 1px 3px rgba(15,23,42,.07)',
        }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            How Band Scores Are Calculated
          </h2>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.75, marginBottom: 14 }}>
            The IELTS Listening test has <strong>40 questions</strong>. Each correct answer scores one mark.
            Your raw score out of 40 is then converted to a band score between 1.0 and 9.0.
            Scores are reported in whole and half bands (e.g. 6.5, 7.0, 7.5).
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Questions', value: '40', color: '#2563eb', bg: '#eff4ff' },
              { label: 'Marks Per Question', value: '1', color: '#059669', bg: '#ecfdf5' },
              { label: 'Band Range', value: '1–9', color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Pass Band (Typical)', value: '6.0+', color: '#d97706', bg: '#fffbeb' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, minWidth: 110,
                background: s.bg, border: `1px solid ${s.color}33`,
                borderRadius: 10, padding: '12px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: 'Lora,serif' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Band score table */}
        <h2 style={{
          fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600,
          color: '#0f172a', marginBottom: 14,
        }}>
          Full Band Score Conversion Table
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {BAND_DATA.map(b => (
            <div key={b.band} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#fff', border: `1px solid ${b.border}`,
              borderRadius: 10, padding: '14px 18px',
              boxShadow: '0 1px 3px rgba(15,23,42,.05)',
            }}>
              {/* Band number */}
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: b.bg, border: `2px solid ${b.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Lora,serif', fontSize: '1.3rem', fontWeight: 700, color: b.color,
              }}>
                {b.band}
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: '#0f172a',
                  }}>
                    Band {b.band}
                  </span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, padding: '1px 8px',
                    borderRadius: 20, background: b.bg, color: b.color,
                    border: `1px solid ${b.border}`,
                  }}>
                    {b.label}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {b.desc}
                </p>
              </div>

              {/* Correct answers */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: b.color }}>
                  {b.correct}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>correct</div>
              </div>

              {/* Progress bar */}
              <div style={{ width: 80, flexShrink: 0 }}>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                  <div style={{
                    width: `${(parseFloat(b.band) / 9) * 100}%`,
                    height: '100%', background: b.color,
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <h2 style={{
          fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600,
          color: '#0f172a', marginBottom: 14,
        }}>
          Quick Tips to Improve Your Score
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
          gap: 12, marginBottom: 32,
        }}>
          {TIPS.map((t, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: '0 1px 3px rgba(15,23,42,.05)',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>{t.tip}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          borderRadius: 14, padding: '28px 28px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to practise?
          </h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, marginBottom: 18 }}>
            Start with Test 1 — it's completely free.
          </p>
          <button onClick={() => navigate('/')} style={{
            padding: '11px 28px', borderRadius: 8, border: 'none',
            background: '#fff', color: '#1d4ed8', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Browse All 100 Tests →
          </button>
        </div>
      </div>
    </div>
  )
}
