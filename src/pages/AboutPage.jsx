// src/pages/AboutPage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const STATS = [
  { n: '100',   l: 'Full Practice Tests' },
  { n: '4,000+', l: 'Questions' },
  { n: '50K+',  l: 'Students' },
  { n: '9.0',   l: 'Max Band Score' },
]

const FEATURES = [
  {
    title: 'Authentic Audio',
    desc: 'All tests use realistic audio recordings with native English speakers across a range of accents — British, Australian, American and more.',
  },
  {
    title: 'Instant Band Scores',
    desc: 'Get your estimated IELTS band score immediately after each test using the official score conversion scale.',
  },
  {
    title: 'Global Leaderboard',
    desc: 'Compete with students worldwide. Rankings are based on your average band score across all tests completed.',
  },
  {
    title: 'Progress Tracking',
    desc: 'Track which tests you have completed, monitor your improvement over time, and see your global ranking.',
  },
  {
    title: 'Secure & Private',
    desc: 'Your data is stored securely in Firebase. We never share your personal information with third parties.',
  },
  {
    title: 'Any Device',
    desc: 'Practice on desktop, tablet or mobile. The platform adapts to any screen size for a comfortable experience.',
  },
]

const TEAM = [
  {
    initials: 'EL',
    name: 'Editorial Team',
    role: 'Content & Questions',
    color: '#2563eb',
    desc: 'Our editorial team designs all test content following the official IELTS format and difficulty guidelines.',
  },
  {
    initials: 'AT',
    name: 'Audio Team',
    role: 'Recordings',
    color: '#7c3aed',
    desc: 'Professional voice actors with authentic native accents record all audio material.',
  },
  {
    initials: 'QA',
    name: 'QA Team',
    role: 'Quality Assurance',
    color: '#0891b2',
    desc: 'Every test is reviewed by certified IELTS examiners before being published on the platform.',
  },
]

export default function AboutPage() {
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
          About IELTS Listening Pro
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 22px 60px' }}>

        
        {/* Mission */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
          padding: '28px 32px', marginBottom: 32,
          boxShadow: '0 1px 3px rgba(15,23,42,.07)',
        }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
            Our Mission
          </h2>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, marginBottom: 12 }}>
            IELTS Listening Pro was created to give every student — regardless of budget or location — access to high-quality, realistic IELTS listening practice. We believe that preparation quality should not be determined by how much you can afford to spend.
          </p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, marginBottom: 12 }}>
            Our 100 full-length tests are designed by experienced IELTS educators and reviewed by certified examiners to ensure they accurately reflect the real exam format, difficulty and question types.
          </p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>
            We are continuously adding new tests, improving existing content, and building features that help students track their progress and achieve their target band scores.
          </p>
        </div>

        {/* Features */}
        <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
          Platform Features
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
          gap: 12, marginBottom: 32,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: '18px 18px', boxShadow: '0 1px 3px rgba(15,23,42,.05)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
          Who Makes This Possible
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12, marginBottom: 32 }}>
          {TEAM.map((t, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: '20px 18px', boxShadow: '0 1px 3px rgba(15,23,42,.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', marginBottom: 12,
                background: t.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff',
              }}>
                {t.initials}
              </div>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{t.name}</h3>
              <p style={{ fontSize: 11.5, color: t.color, fontWeight: 600, marginBottom: 8 }}>{t.role}</p>
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, padding: '14px 18px', marginBottom: 28,
        }}>
          <p style={{ fontSize: 12.5, color: '#92400e', margin: 0, lineHeight: 1.65 }}>
            <strong>Disclaimer:</strong> IELTS Listening Pro is an independent practice platform and is not affiliated with, endorsed by, or connected to the British Council, IDP Education, or Cambridge Assessment English. IELTS® is a registered trademark. Band score estimates are indicative and may differ from official exam results.
          </p>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          borderRadius: 14, padding: '28px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to start practising?
          </h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, marginBottom: 18 }}>
            Join thousands of students improving their IELTS score every day.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/')} style={{
              padding: '11px 24px', borderRadius: 8, border: 'none',
              background: '#fff', color: '#1d4ed8', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              Browse All Tests →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
