// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Dropdown({ label, items, icon }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 7,
          background: open ? '#eff4ff' : 'transparent',
          border: 'none', color: open ? '#2563eb' : '#475569',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .16s',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' } }}
      >
        {icon && <span>{icon}</span>}
        {label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(15,23,42,.12)',
          minWidth: 210, zIndex: 300, overflow: 'hidden',
          animation: 'dropIn .15s ease',
        }}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
            ) : (
              <button
                key={i}
                onClick={() => { item.action(); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px',
                  background: 'none', border: 'none', textAlign: 'left',
                  cursor: 'pointer', fontSize: 13, color: '#0f172a',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {item.icon && (
                  <span style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: item.iconBg || '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  }}>
                    {item.icon}
                  </span>
                )}
                <div>
                  <div style={{ fontWeight: 500 }}>{item.label}</div>
                  {item.desc && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{item.desc}</div>}
                </div>
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onAuthClick, onContactClick }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const practiceItems = [
    { label: 'All Tests', desc: 'Browse the complete test library', icon: '📋', iconBg: '#eff4ff', action: () => navigate('/') },
  ]

  const resourceItems = [
    { label: 'Band Score Guide', desc: 'Score conversion & what each band means', icon: '🎯', iconBg: '#ecfdf5', action: () => navigate('/band-score-guide') },
    { label: 'Listening Tips',   desc: 'Strategies to improve your score',        icon: '💡', iconBg: '#fffbeb', action: () => navigate('/listening-tips')   },
    { label: 'Study Plans',      desc: '2, 4 and 8-week preparation schedules',   icon: '📅', iconBg: '#fef2f2', action: () => navigate('/study-plans')       },
    { label: 'FAQ',              desc: 'Common questions answered',               icon: '❓', iconBg: '#f5f3ff', action: () => navigate('/faq')               },
  ]

  const navLinkStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 14px', borderRadius: 7,
    background: 'transparent', border: 'none',
    color: '#475569', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .16s',
  }

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 200, height: 62,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 0 rgba(15,23,42,.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, fontSize: 16, flexShrink: 0,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>🎧</div>
          <span style={{ fontFamily: 'Lora,serif', fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-.01em' }}>
            IELTS Listening Pro
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Dropdown label="Practice"  icon="📝" items={practiceItems} />
          <Dropdown label="Resources" icon="📖" items={resourceItems} />

          {/* About Us */}
          <button
            onClick={() => navigate('/about')}
            style={navLinkStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
          >
            About Us
          </button>

          {/* Contact */}
          <button
            onClick={onContactClick}
            style={navLinkStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
          >
            Contact
          </button>
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '4px 14px 4px 4px', background: '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: 30,
                fontSize: 12.5, color: '#475569',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', fontSize: 9,
                  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {(user.displayName || user.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontWeight: 500 }}>
                  {(user.displayName || user.email || '').split(' ')[0]}
                </span>
              </div>
              <button
                onClick={logout}
                style={{ padding: '7px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .16s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuthClick('login')}
                style={{ padding: '7px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .16s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onAuthClick('signup')}
                style={{ padding: '7px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#2563eb', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .16s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.boxShadow = 'none' }}
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
