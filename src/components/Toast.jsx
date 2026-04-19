// src/components/Toast.jsx
import React, { useEffect, useState } from 'react'

export default function Toast({ msg, type = 'success' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const show = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(show)
  }, [])

  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✓' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '✕' },
    info:    { bg: '#eff4ff', border: '#bfdbfe', text: '#1d4ed8', icon: 'ℹ' },
  }
  const c = colors[type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: '12px 18px',
      boxShadow: '0 4px 20px rgba(15,23,42,.12)',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 13.5, color: c.text, fontWeight: 500,
      maxWidth: 340,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity:   visible ? 1 : 0,
      transition: 'transform .25s ease, opacity .25s ease',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: c.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: c.text,
      }}>
        {c.icon}
      </span>
      {msg}
    </div>
  )
}
