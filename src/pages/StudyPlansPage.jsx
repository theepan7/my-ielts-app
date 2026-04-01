// src/pages/StudyPlansPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    id: 'two-week',
    label: '2-Week Intensive',
    icon: '⚡',
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    target: 'Band 6.0+',
    hours: '2–3 hrs/day',
    desc: 'A focused sprint for students with limited time. Best if you already have basic English skills.',
    weeks: [
      {
        title: 'Week 1 — Foundation',
        days: [
          { day: 'Day 1', task: 'Take Test 1 (diagnostic) — identify your weaknesses', type: 'test' },
          { day: 'Day 2', task: 'Study band score guide — understand what you are aiming for', type: 'study' },
          { day: 'Day 3', task: 'Complete Tests 2 & 3 — focus on Section 1 & 2 question types', type: 'test' },
          { day: 'Day 4', task: 'Review all errors from Days 1–3 — understand why each was wrong', type: 'review' },
          { day: 'Day 5', task: 'Complete Tests 4 & 5 — focus on note completion and form filling', type: 'test' },
          { day: 'Day 6', task: 'Practise spelling of commonly misspelled IELTS words', type: 'study' },
          { day: 'Day 7', task: 'Rest and light review of vocabulary from the week', type: 'rest' },
        ],
      },
      {
        title: 'Week 2 — Consolidation',
        days: [
          { day: 'Day 8',  task: 'Complete Tests 6, 7 & 8 under exam conditions — no rewinding', type: 'test' },
          { day: 'Day 9',  task: 'Focus on MCQ strategy — elimination technique and distractor awareness', type: 'study' },
          { day: 'Day 10', task: 'Complete Tests 9 & 10 — time yourself strictly', type: 'test' },
          { day: 'Day 11', task: 'Review all errors — track which question types you miss most', type: 'review' },
          { day: 'Day 12', task: 'Complete Tests 11 & 12 — Section 3 & 4 focus (academic discussion)', type: 'test' },
          { day: 'Day 13', task: 'Full mock exam — Tests 13 & 14 back to back under timed conditions', type: 'test' },
          { day: 'Day 14', task: 'Final review — check errors and rest before exam', type: 'rest' },
        ],
      },
    ],
  },
  {
    id: 'four-week',
    label: '4-Week Standard',
    icon: '📅',
    color: '#2563eb', bg: '#eff4ff', border: '#bfdbfe',
    target: 'Band 6.5–7.0',
    hours: '1–2 hrs/day',
    desc: 'The most popular plan. Balances learning, practice and review at a manageable pace.',
    weeks: [
      {
        title: 'Week 1 — Diagnosis & Basics',
        days: [
          { day: 'Mon', task: 'Take Test 1 — diagnostic, note every error', type: 'test' },
          { day: 'Tue', task: 'Read band score guide and listening tips thoroughly', type: 'study' },
          { day: 'Wed', task: 'Tests 2 & 3 — form and note completion focus', type: 'test' },
          { day: 'Thu', task: 'Vocabulary: numbers, dates, times, spelling practice', type: 'study' },
          { day: 'Fri', task: 'Tests 4 & 5 — table completion and labelling focus', type: 'test' },
          { day: 'Sat', task: 'Review all errors from the week', type: 'review' },
          { day: 'Sun', task: 'Rest', type: 'rest' },
        ],
      },
      {
        title: 'Week 2 — Question Types',
        days: [
          { day: 'Mon', task: 'Tests 6 & 7 — MCQ strategy: predict, listen, eliminate', type: 'test' },
          { day: 'Tue', task: 'Vocabulary: academic topics (health, environment, education)', type: 'study' },
          { day: 'Wed', task: 'Tests 8 & 9 — matching exercises focus', type: 'test' },
          { day: 'Thu', task: 'Practise with different accents (British, Australian, American)', type: 'study' },
          { day: 'Fri', task: 'Tests 10 & 11 — map and diagram labelling', type: 'test' },
          { day: 'Sat', task: 'Error review and vocabulary consolidation', type: 'review' },
          { day: 'Sun', task: 'Rest', type: 'rest' },
        ],
      },
      {
        title: 'Week 3 — Speed & Accuracy',
        days: [
          { day: 'Mon', task: 'Tests 12, 13 & 14 — timed, no pausing', type: 'test' },
          { day: 'Tue', task: 'Focus on Section 3 & 4 — academic discussion and lecture format', type: 'study' },
          { day: 'Wed', task: 'Tests 15 & 16 — note all distractor moments', type: 'test' },
          { day: 'Thu', task: 'Spelling drills: proper nouns, technical vocabulary', type: 'study' },
          { day: 'Fri', task: 'Tests 17 & 18 — complete under full exam conditions', type: 'test' },
          { day: 'Sat', task: 'In-depth error analysis — find patterns in your mistakes', type: 'review' },
          { day: 'Sun', task: 'Rest', type: 'rest' },
        ],
      },
      {
        title: 'Week 4 — Mock Exams',
        days: [
          { day: 'Mon', task: 'Full mock: Tests 19 & 20 back to back — 60 minutes total', type: 'test' },
          { day: 'Tue', task: 'Review mock results — focus only on error types', type: 'review' },
          { day: 'Wed', task: 'Tests 21 & 22 — practise answer transfer in 10 minutes', type: 'test' },
          { day: 'Thu', task: 'Light vocabulary review — do not overload before exam', type: 'study' },
          { day: 'Fri', task: 'Final mock: Test 23 under strict exam conditions', type: 'test' },
          { day: 'Sat', task: 'Rest and light review only', type: 'rest' },
          { day: 'Sun', task: 'Exam day — you are ready!', type: 'exam' },
        ],
      },
    ],
  },
  {
    id: 'eight-week',
    label: '8-Week Thorough',
    icon: '🏆',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    target: 'Band 7.5–8.0',
    hours: '1 hr/day',
    desc: 'The most comprehensive plan. Recommended for students aiming for Band 7.5 or above.',
    weeks: [
      { title: 'Weeks 1–2 — Foundation', days: [
        { day: 'Week 1', task: 'Tests 1–5 · Band score guide · Question type analysis', type: 'test' },
        { day: 'Week 2', task: 'Tests 6–10 · Vocabulary by topic · Accent exposure', type: 'test' },
      ]},
      { title: 'Weeks 3–4 — Question Mastery', days: [
        { day: 'Week 3', task: 'Tests 11–16 · MCQ deep dive · Matching strategy', type: 'test' },
        { day: 'Week 4', task: 'Tests 17–22 · Maps & diagrams · Section 3 & 4 focus', type: 'test' },
      ]},
      { title: 'Weeks 5–6 — Speed & Endurance', days: [
        { day: 'Week 5', task: 'Tests 23–30 · No pausing · Timed conditions every session', type: 'test' },
        { day: 'Week 6', task: 'Tests 31–38 · Error pattern analysis · Vocabulary gaps', type: 'test' },
      ]},
      { title: 'Weeks 7–8 — Mock & Polish', days: [
        { day: 'Week 7', task: 'Tests 39–48 · Full mock exams · Transfer practice', type: 'test' },
        { day: 'Week 8', task: 'Tests 49–50 · Final review · Rest · Exam day', type: 'exam' },
      ]},
    ],
  },
]

const DAY_COLORS = {
  test:   { bg: '#eff4ff', color: '#2563eb', border: '#bfdbfe', label: 'Test' },
  study:  { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', label: 'Study' },
  review: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Review' },
  rest:   { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Rest' },
  exam:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Exam' },
}

export default function StudyPlansPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState('four-week')
  const plan = PLANS.find(p => p.id === active)

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
          IELTS Listening Study Plans
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 22px 60px' }}>

        {/* Plan selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              style={{
                flex: 1, minWidth: 160,
                padding: '16px 14px', borderRadius: 12, border: `2px solid ${active === p.id ? p.color : '#e2e8f0'}`,
                background: active === p.id ? p.bg : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all .18s',
                boxShadow: active === p.id ? `0 4px 14px ${p.color}22` : '0 1px 3px rgba(15,23,42,.06)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: active === p.id ? p.color : '#0f172a', marginBottom: 3 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{p.hours}</div>
              <div style={{
                marginTop: 6, display: 'inline-block', padding: '2px 8px',
                borderRadius: 20, fontSize: 10.5, fontWeight: 700,
                background: active === p.id ? p.color : '#f1f5f9',
                color: active === p.id ? '#fff' : '#64748b',
              }}>
                Target: {p.target}
              </div>
            </button>
          ))}
        </div>

        {/* Plan description */}
        <div style={{
          background: plan.bg, border: `1px solid ${plan.border}`,
          borderRadius: 10, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{plan.icon}</span>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: plan.color, margin: 0, marginBottom: 3 }}>
              {plan.label} — Target {plan.target}
            </p>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{plan.desc}</p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {Object.entries(DAY_COLORS).map(([key, val]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: val.color, display: 'inline-block' }} />
              <span style={{ color: '#64748b' }}>{val.label}</span>
            </span>
          ))}
        </div>

        {/* Weeks */}
        {plan.weeks.map((week, wi) => (
          <div key={wi} style={{ marginBottom: 24 }}>
            <h3 style={{
              fontFamily: 'Lora,serif', fontSize: '1rem', fontWeight: 600,
              color: '#0f172a', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, background: plan.color,
                color: '#fff', fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {wi + 1}
              </span>
              {week.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {week.days.map((day, di) => {
                const dc = DAY_COLORS[day.type] || DAY_COLORS.study
                return (
                  <div key={di} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#fff', border: `1px solid ${dc.border}`,
                    borderRadius: 9, padding: '10px 14px',
                    borderLeft: `4px solid ${dc.color}`,
                    boxShadow: '0 1px 3px rgba(15,23,42,.04)',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: dc.color,
                      background: dc.bg, padding: '2px 8px', borderRadius: 5,
                      minWidth: 48, textAlign: 'center', flexShrink: 0,
                    }}>
                      {day.day}
                    </span>
                    <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{day.task}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 7px',
                      borderRadius: 20, background: dc.bg, color: dc.color,
                      flexShrink: 0,
                    }}>
                      {dc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          borderRadius: 14, padding: '28px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Start your {plan.label} plan today
          </h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, marginBottom: 18 }}>
            Test 1 is free — no account needed to begin.
          </p>
          <button onClick={() => navigate('/')} style={{
            padding: '11px 28px', borderRadius: 8, border: 'none',
            background: '#fff', color: '#1d4ed8', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Start Test 1 Now →
          </button>
        </div>
      </div>
    </div>
  )
}
