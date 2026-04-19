// src/components/ContactModal.jsx
import React, { useState } from 'react'
import { sendContactMessage } from '../firebase/services'

const INPUT = {
  width: '100%', background: '#f8fafc',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  padding: '9px 12px', color: '#0f172a',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontSize: 13, outline: 'none', transition: 'border-color .18s',
  boxSizing: 'border-box',
}
const LABEL = {
  display: 'block', fontSize: 11.5,
  fontWeight: 600, color: '#475569', marginBottom: 4,
}

export default function ContactModal({ onClose, showToast }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy,    setBusy]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setBusy(true)
    try {
      await sendContactMessage(name.trim(), email.trim(), subject.trim(), message.trim())
      showToast('Message sent! We\'ll get back to you soon.', 'success')
      onClose()
    } catch (err) {
      showToast('Could not send message — please try again.', 'error')
    }
    setBusy(false)
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%',
        overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)',
        animation: 'slideUp .22s ease', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#4338ca)', padding: '22px 26px', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
            Contact Us
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginTop: 3 }}>
            We'll get back to you within 24 hours
          </p>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 14,
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={INPUT} type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>Email <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={INPUT} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={LABEL}>Subject</label>
            <input style={INPUT} type="text" placeholder="What's this about?" value={subject} onChange={e => setSubject(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={LABEL}>Message <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us how we can help…"
              rows={5}
              style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button type="submit" disabled={busy} style={{
            padding: '11px', borderRadius: 8, border: 'none',
            background: busy ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: busy ? 'not-allowed' : 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            boxShadow: busy ? 'none' : '0 4px 14px rgba(37,99,235,.25)',
            transition: 'all .2s',
          }}>
            {busy ? 'Sending…' : 'Send Message →'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(18px) scale(.97) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}
