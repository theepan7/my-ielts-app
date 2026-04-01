// src/components/UserProgress.jsx
// Standalone progress ring — reads directly from leaderboard doc.
// Completely independent of the Leaderboard component.
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function UserProgress({ onAuthClick, totalTests = 100 }) {
  const { user }            = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setData(null); return }
    setLoading(true)
    getDoc(doc(db, 'leaderboard', user.uid))
      .then(snap => {
        if (snap.exists()) setData(snap.data())
        else setData({})
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false))
  }, [user?.uid])

  // ── Not logged in ── show signup wall
  if (!user) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 16, textAlign: 'center',
        boxShadow: '0 1px 3px rgba(15,23,42,.07)',
      }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>🔓</div>
        <h3 style={{
          fontFamily: 'Lora,serif', fontSize: '.95rem',
          fontWeight: 600, marginBottom: 6, color: '#0f172a',
        }}>
          Unlock All 100 Tests
        </h3>
        <p style={{ color: '#475569', fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>
          Sign up free to access the full test library, track your progress and appear on the leaderboard.
        </p>
        <button
          onClick={() => onAuthClick('signup')}
          style={{
            width: '100%', padding: 9, borderRadius: 7,
            background: '#2563eb', color: '#fff', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', border: 'none',
            marginBottom: 7, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          Create Free Account
        </button>
        <button
          onClick={() => onAuthClick('login')}
          style={{
            width: '100%', padding: 9, borderRadius: 7,
            background: 'transparent', color: '#475569', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid #e2e8f0',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          I already have an account
        </button>
        <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6 }}>
          No credit card required
        </p>
      </div>
    )
  }

  // ── Loading ──
  if (loading || !data) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 16,
        boxShadow: '0 1px 3px rgba(15,23,42,.07)',
      }}>
        <div style={{
          height: 14, width: '60%', background: '#f1f5f9',
          borderRadius: 4, marginBottom: 16,
        }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, background: '#f1f5f9', borderRadius: 3, marginBottom: 8 }} />
            <div style={{ height: 10, background: '#f1f5f9', borderRadius: 3, width: '70%' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Progress calculations ──
  const done         = (data.uniqueTestsDone || []).length
  const pct          = Math.round((done / totalTests) * 100)
  const bestBand     = data.bestBand   || '—'
  const avgBand      = data.avgBand    || '—'
  const testsCount   = data.testsCompleted || 0

  // SVG ring
  const R      = 28
  const C      = 2 * Math.PI * R
  const offset = C - (C * pct / 100)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(15,23,42,.07)',
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12,
      }}>
        📊 Your Progress
      </div>

      {/* Ring + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <svg width="72" height="72" style={{ flexShrink: 0 }}>
          {/* Track */}
          <circle cx="36" cy="36" r={R} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          {/* Fill */}
          <circle
            cx="36" cy="36" r={R} fill="none"
            stroke="url(#prog-gradient)"
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={C.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '36px 36px',
              transition: 'stroke-dashoffset .7s ease',
            }}
          />
          <defs>
            <linearGradient id="prog-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <text
            x="36" y="41" textAnchor="middle"
            fill="#0f172a" fontSize="12" fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {pct}%
          </text>
        </svg>

        <div style={{ flex: 1 }}>
          {/* Tests done */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 1 }}>
              Tests Completed
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              {done}
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                {' '}/ {totalTests}
              </span>
            </div>
          </div>

          {/* Best band */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 1 }}>
              Best Band
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#d97706' }}>
              {bestBand}
            </div>
          </div>

          {/* Avg band */}
          <div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 1 }}>
              Avg Band
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>
              {avgBand}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10.5, color: '#94a3b8', marginBottom: 4,
        }}>
          <span>Overall Progress</span>
          <span>{done}/{totalTests}</span>
        </div>
        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
            borderRadius: 3,
            transition: 'width .7s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
