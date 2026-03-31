// src/pages/ListeningTipsPage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    icon: '🎧',
    title: 'Before You Listen',
    color: '#2563eb', bg: '#eff4ff', border: '#bfdbfe',
    tips: [
      {
        heading: 'Read the questions first',
        body: 'You are given time before each section. Use every second to read the questions carefully. Underline key words like names, numbers, places and dates.',
      },
      {
        heading: 'Predict the answer type',
        body: 'Look at what kind of answer is needed. Is it a number? A name? A place? A date? Knowing this helps you listen for the right information.',
      },
      {
        heading: 'Understand the context',
        body: 'The introduction before each section tells you the situation. Use this to build a mental picture of who is speaking and what they are discussing.',
      },
    ],
  },
  {
    icon: '✏️',
    title: 'While You Listen',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    tips: [
      {
        heading: 'Write as you listen',
        body: 'Do not wait until the speaker finishes. Write down answers immediately when you hear them. You can refine them later but do not miss the moment.',
      },
      {
        heading: 'Follow the order',
        body: 'Questions follow the order of the audio. If you miss one, move on — do not get stuck on a single question and lose the rest.',
      },
      {
        heading: 'Listen for signpost words',
        body: 'Words like "however", "on the other hand", "the most important thing" and "finally" signal key information and answer locations.',
      },
      {
        heading: 'Watch for distractors',
        body: 'Speakers often mention something that sounds correct, then correct themselves. Wait until the speaker finishes their point before writing.',
      },
    ],
  },
  {
    icon: '📝',
    title: 'Answer & Transfer',
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    tips: [
      {
        heading: 'Check word limits',
        body: 'If the question says "no more than two words", writing three words will score zero even if the content is correct. Count your words.',
      },
      {
        heading: 'Spelling must be correct',
        body: 'A correctly heard answer with incorrect spelling is marked wrong. Focus especially on proper nouns — names, places, organisations.',
      },
      {
        heading: 'Use the transfer time wisely',
        body: 'In the real exam you get 10 minutes to transfer answers to the answer sheet. Check spelling, word limits, and that every question has an answer.',
      },
    ],
  },
  {
    icon: '🏋️',
    title: 'Practice Strategies',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    tips: [
      {
        heading: 'Listen without rewinding',
        body: 'In the real exam the audio plays only once. Train yourself by not rewinding during practice. This builds concentration and real exam conditions.',
      },
      {
        heading: 'Practise with accents',
        body: 'IELTS uses British, Australian, American and other English accents. Watch films, podcasts and news from different English-speaking countries.',
      },
      {
        heading: 'Build vocabulary by topic',
        body: 'Common IELTS topics include education, health, environment, technology and daily life. Learn vocabulary clusters for each topic.',
      },
      {
        heading: 'Time yourself',
        body: 'Each section has a time limit. Practice under timed conditions so the real exam pace feels familiar rather than rushed.',
      },
    ],
  },
]

const SECTION_TIPS = [
  { sec: 'Section 1', type: 'Conversation', difficulty: 'Easiest', tip: 'Often a phone call or enquiry. Focus on names, numbers, dates, addresses and times. Speakers spell out important words — write them as you hear.' },
  { sec: 'Section 2', type: 'Monologue', difficulty: 'Easy', tip: 'A single speaker about a public topic — a tour, facility or event. Maps and diagrams are common. Visualise the layout as you listen.' },
  { sec: 'Section 3', type: 'Discussion', difficulty: 'Medium', tip: 'Academic discussion between 2–4 people. Multiple opinions are expressed. Identify who says what — opinions can differ between speakers.' },
  { sec: 'Section 4', type: 'Lecture', difficulty: 'Hardest', tip: 'An academic lecture with no pause. The vocabulary is more technical. Take notes on main points and listen for the structure of the argument.' },
]

export default function ListeningTipsPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        padding: '52px 28px 48px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>💡</div>
        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 600,
          color: '#fff', marginBottom: 10,
        }}>
          IELTS Listening Tips & Strategies
        </h1>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
          Proven strategies to maximise your IELTS Listening score — from preparation to the final transfer.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 22px 60px' }}>

        {/* Section-by-section guide */}
        <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
          Know Each Section
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 32 }}>
          {SECTION_TIPS.map(s => (
            <div key={s.sec} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: '16px 16px', boxShadow: '0 1px 3px rgba(15,23,42,.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{s.sec}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                  background: s.difficulty === 'Easiest' ? '#ecfdf5' : s.difficulty === 'Easy' ? '#eff4ff' : s.difficulty === 'Medium' ? '#fffbeb' : '#fef2f2',
                  color: s.difficulty === 'Easiest' ? '#059669' : s.difficulty === 'Easy' ? '#2563eb' : s.difficulty === 'Medium' ? '#d97706' : '#dc2626',
                }}>
                  {s.difficulty}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>{s.type}</div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{s.tip}</p>
            </div>
          ))}
        </div>

        {/* Tip sections */}
        {SECTIONS.map(sec => (
          <div key={sec.title} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, fontSize: 18,
                background: sec.bg, border: `1px solid ${sec.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{sec.icon}</div>
              <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                {sec.title}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.tips.map((tip, i) => (
                <div key={i} style={{
                  background: '#fff', border: `1px solid ${sec.border}`,
                  borderRadius: 10, padding: '14px 18px',
                  borderLeft: `4px solid ${sec.color}`,
                  boxShadow: '0 1px 3px rgba(15,23,42,.05)',
                }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                    {tip.heading}
                  </p>
                  <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.7 }}>
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          borderRadius: 14, padding: '28px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Put these tips into practice
          </h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, marginBottom: 18 }}>
            100 full tests available — start with Test 1 for free.
          </p>
          <button onClick={() => navigate('/')} style={{
            padding: '11px 28px', borderRadius: 8, border: 'none',
            background: '#fff', color: '#1d4ed8', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Start Practising →
          </button>
        </div>
      </div>
    </div>
  )
}
