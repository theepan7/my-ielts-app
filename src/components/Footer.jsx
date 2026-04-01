// src/components/Footer.jsx
import { useNavigate } from 'react-router-dom'

export default function Footer({ onContactClick }) {
  const navigate = useNavigate()

  const cols = [
    {
      title: 'Practice',
      links: [
        { label: 'All 100 Tests', action: () => navigate('/') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Band Score Guide', action: () => navigate('/band-score-guide') }, // ← was /band-score
        { label: 'Listening Tips',   action: () => navigate('/listening-tips')  },
        { label: 'Study Plans',      action: () => navigate('/study-plans')     },
        { label: 'FAQ',              action: () => navigate('/faq')             },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us',       action: () => navigate('/about')   },
        { label: 'Contact Us',     action: onContactClick             },
        { label: 'Privacy Policy', action: () => navigate('/privacy') },
        { label: 'Terms of Use',   action: () => navigate('/terms')   },
      ],
    },
  ]

  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: '40px 24px 28px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 32,
      }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, fontSize: 13,
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>🎧</div>
            <span style={{ fontFamily: 'Lora,serif', fontSize: '.95rem', fontWeight: 600, color: '#0f172a' }}>
              IELTS Listening Pro
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.75, maxWidth: 270, marginBottom: 14 }}>
            The most comprehensive IELTS Listening practice platform — 100 full tests with authentic audio and instant band score results.
          </p>
          <div style={{ display: 'flex', gap: 7 }}>
            {['𝕏', 'f', '▶', '◈', 'in'].map((s, i) => (
              <button key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, cursor: 'pointer', color: '#475569',
                transition: 'all .16s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff4ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#f8fafc' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(col => (
          <div key={col.title}>
            <h4 style={{
              fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12,
            }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      fontSize: 13, color: '#475569', cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      transition: 'color .14s', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #e2e8f0', padding: '13px 24px',
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <p style={{ fontSize: 11.5, color: '#94a3b8' }}>
          © 2025 IELTS Listening Pro. Not affiliated with British Council, IDP or Cambridge Assessment.
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {['🔒 Secure', '✓ Verified', '🌍 Global'].map(b => (
            <span key={b} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 5, padding: '2px 8px', fontSize: 10.5, color: '#94a3b8',
            }}>{b}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
