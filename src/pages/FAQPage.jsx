// src/pages/FAQPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAQS = [
  {
    category: 'About the IELTS Listening Test',
    icon: '📋',
    items: [
      {
        q: 'How long is the IELTS Listening test?',
        a: 'The test takes approximately 30 minutes of audio, plus 10 minutes at the end to transfer your answers to the answer sheet. Total time in the exam room is around 40 minutes.',
      },
      {
        q: 'How many questions are in the Listening test?',
        a: 'There are 40 questions in total, divided into 4 sections of 10 questions each. Each correct answer scores 1 mark.',
      },
      {
        q: 'How many times does the audio play?',
        a: 'In the real IELTS exam, the audio plays ONCE only. You cannot pause or rewind it. This is why it is important to practise without rewinding during your preparation.',
      },
      {
        q: 'What accents are used in the test?',
        a: 'The IELTS Listening test uses a range of native English accents including British, Australian, New Zealand, American and Canadian. You should practise listening to all of these.',
      },
      {
        q: 'Is the Listening test the same for Academic and General Training?',
        a: 'Yes. The IELTS Listening test is identical for both Academic and General Training candidates. The same test format, sections and scoring applies to both.',
      },
    ],
  },
  {
    category: 'Scoring & Band Scores',
    icon: '🎯',
    items: [
      {
        q: 'How is the band score calculated?',
        a: 'Your raw score out of 40 is converted to a band score between 1.0 and 9.0. For example, 30 correct answers gives you Band 7.0, and 35 correct gives Band 8.0. Scores are reported in whole and half bands.',
      },
      {
        q: 'What band score do I need?',
        a: 'Requirements vary by institution and country. Most universities require Band 6.0–7.0 for undergraduate programmes and 6.5–7.5 for postgraduate. Immigration requirements typically range from 5.0 to 7.0 depending on the country.',
      },
      {
        q: 'Does spelling count in the Listening test?',
        a: 'Yes — spelling must be correct. If you hear the correct answer but spell it wrong on the answer sheet, it will be marked incorrect. Pay special attention to proper nouns, place names and technical vocabulary.',
      },
      {
        q: 'Do word limits matter?',
        a: 'Absolutely. If a question says "write NO MORE THAN TWO WORDS" and you write three words, your answer will be marked wrong even if the content is correct. Always check the word limit before answering.',
      },
    ],
  },
  {
    category: 'Using This Platform',
    icon: '💻',
    items: [
      {
        q: 'Do I need to create an account to practise?',
        a: 'No — Test 1 is completely free without an account. To access all 100 tests, track your progress and appear on the leaderboard, you need to sign up. Registration is free and takes less than a minute.',
      },
      {
        q: 'How are scores calculated on this platform?',
        a: 'Each correct answer scores 1 point out of 40. Your raw score is then converted to an estimated IELTS band score using the official conversion scale. The band score shown is an estimate based on your performance.',
      },
      {
        q: 'Does redoing a test affect my progress?',
        a: 'No. Progress only counts the first time you complete a test. However, your average score in the leaderboard will update if you beat your previous best score on a retried test.',
      },
      {
        q: 'How does the leaderboard work?',
        a: 'The leaderboard ranks users by their average band score across all tests they have completed. Only unique tests count toward your progress total, but your best score for each test is used in the average calculation.',
      },
      {
        q: 'What does the question tracker show?',
        a: 'The question tracker at the bottom of each test part shows all question numbers. Blue means you have answered that question; grey means it is unanswered. Click any number to jump to that question.',
      },
    ],
  },
  {
    category: 'Test Preparation',
    icon: '📚',
    items: [
      {
        q: 'How many tests should I practise before the real exam?',
        a: 'We recommend completing at least 10–15 full tests before your exam, with careful error review after each one. Quality of review matters more than quantity — understanding why you got something wrong is more valuable than simply doing more tests.',
      },
      {
        q: 'Should I practise with or without headphones?',
        a: 'In the real exam you listen through headphones provided at the test centre. Practising with headphones gives you the most realistic experience. However, practising without them is also fine as long as you focus on the listening itself.',
      },
      {
        q: 'How do I improve my listening for Section 4?',
        a: 'Section 4 is an academic lecture — the most challenging section. To improve, regularly listen to university lectures, TED talks and academic podcasts. Focus on understanding the structure of arguments and note-taking speed.',
      },
      {
        q: 'How soon before the exam should I stop practising?',
        a: 'Stop doing full tests 1–2 days before the exam. Use the final day for light vocabulary review and rest. Being well-rested is more valuable than last-minute practice.',
      },
    ],
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: '#fff', border: `1px solid ${open ? '#bfdbfe' : '#e2e8f0'}`,
      borderRadius: 10, overflow: 'hidden', transition: 'all .18s',
      boxShadow: open ? '0 4px 12px rgba(37,99,235,.08)' : '0 1px 3px rgba(15,23,42,.05)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, flex: 1 }}>
          {item.q}
        </span>
        <span style={{
          fontSize: 18, color: open ? '#2563eb' : '#94a3b8',
          transition: 'transform .2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          flexShrink: 0, lineHeight: 1,
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 18px 16px',
          borderTop: '1px solid #eff4ff',
        }}>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.75, margin: 0 }}>
            {item.a}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const navigate   = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0)

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        padding: '52px 28px 48px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>❓</div>
        <h1 style={{ fontFamily: 'Lora,serif', fontSize: '2rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, maxWidth: 500, margin: '0 auto 22px' }}>
          Everything you need to know about the IELTS Listening test and this platform.
        </p>
        {/* Search */}
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search questions…"
            style={{
              width: '100%', padding: '12px 18px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.15)',
              color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 22px 60px' }}>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            No questions match your search. <button onClick={() => setSearch('')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear search</button>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.category} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  {cat.category}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.items.map((item, i) => (
                  <FAQItem key={i} item={item} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Still have questions */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 14, padding: '24px 28px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(15,23,42,.06)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
            Still have a question?
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Our support team responds within 24 hours on weekdays.
          </p>
          <button onClick={() => navigate('/')} style={{
            padding: '9px 22px', borderRadius: 8, border: 'none',
            background: '#2563eb', color: '#fff', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Contact Us →
          </button>
        </div>
      </div>
    </div>
  )
}
