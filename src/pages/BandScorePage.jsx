// src/pages/BandScorePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Data ─────────────────────────────────────────────────
const BAND_DATA = [
  { band: 9.0, rawMin: 39, rawMax: 40, label: 'Expert User', desc: 'Full operational command of the language. Rare and outstanding performance.' },
  { band: 8.5, rawMin: 37, rawMax: 38, label: 'Very Good User', desc: 'Fully operational command with only occasional inaccuracies.' },
  { band: 8.0, rawMin: 35, rawMax: 36, label: 'Very Good User', desc: 'Handles complex language well. Minor misunderstandings in unfamiliar situations.' },
  { band: 7.5, rawMin: 32, rawMax: 34, label: 'Good User', desc: 'Operational command with occasional inaccuracies.' },
  { band: 7.0, rawMin: 30, rawMax: 31, label: 'Good User', desc: 'Good working knowledge. Handles complex language despite occasional errors.' },
  { band: 6.5, rawMin: 26, rawMax: 29, label: 'Competent User', desc: 'Effective command in familiar situations.' },
  { band: 6.0, rawMin: 23, rawMax: 25, label: 'Competent User', desc: 'Generally effective command despite inaccuracies.' },
  { band: 5.5, rawMin: 18, rawMax: 22, label: 'Modest User', desc: 'Partial command. Copes with overall meaning.' },
  { band: 5.0, rawMin: 16, rawMax: 17, label: 'Modest User', desc: 'Likely to make many mistakes.' },
  { band: 4.5, rawMin: 13, rawMax: 15, label: 'Limited User', desc: 'Basic competence with frequent problems.' },
  { band: 4.0, rawMin: 10, rawMax: 12, label: 'Limited User', desc: 'Considerable difficulty in unfamiliar situations.' },
  { band: 3.5, rawMin: 8, rawMax: 9, label: 'Extremely Limited', desc: 'Only general meaning in familiar situations.' },
  { band: 3.0, rawMin: 6, rawMax: 7, label: 'Extremely Limited', desc: 'Very limited understanding.' },
]

export default function BandScorePage() {
  const navigate = useNavigate()
  const [rawScore, setRawScore] = useState('')
  const [highlighted, setHighlighted] = useState(null)

  const calculated = (() => {
    const n = parseInt(rawScore, 10)
    if (isNaN(n) || n < 0 || n > 40) return null
    return BAND_DATA.find(b => n >= b.rawMin && n <= b.rawMax) || null
  })()

  return (
    <div style={{
      background: '#f4f6fb',
      minHeight: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      paddingBottom: 60,
    }}>

      {/* ── SIMPLE HERO ───────────────────────────── */}
      <div style={{
        background: '#1e3a8a',
        padding: '18px 16px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            background: '#ffffff20',
            border: '1px solid #ffffff40',
            color: '#fff',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        <h1 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
        }}>
          IELTS Listening Band Guide
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Raw score input */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <input
            type="number"
            min="0"
            max="40"
            value={rawScore}
            onChange={e => setRawScore(e.target.value)}
            placeholder="Enter raw score (0–40)"
            style={{
              padding: '10px',
              width: 120,
              textAlign: 'center',
              fontSize: 14,
              borderRadius: 8,
              border: '1px solid #cbd5f5',
            }}
          />
        </div>

        {/* ── Conversion Table ─────────────────────── */}
        <Section title="Raw Score → Band Conversion" icon="📊">
          <div style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '90px 120px 1fr 160px',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}>
              <span>Band</span>
              <span>Raw Score</span>
              <span>Progress</span>
              <span>Label</span>
            </div>

            {BAND_DATA.map((b, i) => {
              const isHighlighted =
                highlighted === i ||
                (calculated && calculated.band === b.band)

              return (
                <div
                  key={b.band}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseLeave={() => setHighlighted(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 120px 1fr 160px',
                    padding: '10px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: isHighlighted ? '#e2e8f0' : '#fff',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {b.band}
                  </div>

                  <div style={{ fontSize: 13 }}>
                    {b.rawMin === b.rawMax ? b.rawMin : `${b.rawMin}–${b.rawMax}`}
                  </div>

                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 4 }}>
                    <div style={{
                      width: `${((b.band - 3) / 6) * 100}%`,
                      height: '100%',
                      background: '#2563eb',
                      borderRadius: 4,
                    }} />
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: '#1e293b',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 20,
                    padding: '2px 10px',
                    display: 'inline-block',
                  }}>
                    {b.label}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Result */}
        {calculated && (
          <div style={{
            marginTop: 16,
            padding: 14,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
          }}>
            <strong>Band {calculated.band} – {calculated.label}</strong>
            <p style={{ margin: 6, fontSize: 13 }}>
              {calculated.desc}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Section ─────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span>{icon}</span>
        <h2 style={{ fontSize: 16, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
