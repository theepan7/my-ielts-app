// src/components/AuthModal.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES } from '../data/countries'

export default function AuthModal({ mode, onClose, onSwitch, showToast }) {
  const { signup, login } = useAuth()
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [pass,        setPass]        = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [busy,        setBusy]        = useState(false)

  // Find full country object from selected code
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)

  async function handle(e) {
    e.preventDefault()
    if (!email.trim() || !pass.trim()) { showToast('Please fill in all fields', 'error'); return }
    if (mode === 'signup') {
      if (!name.trim()) { showToast('Please enter your name', 'error'); return }
      if (!countryCode)  { showToast('Please select your country', 'error'); return }
    }
    if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }

    setBusy(true)
    try {
      if (mode === 'signup') {
        await signup(
          name.trim(),
          email.trim(),
          pass,
          selectedCountry?.code  || '',
          selectedCountry?.name  || '',
          selectedCountry?.flag  || '🌍'
        )
        showToast(`Welcome aboard, ${name.trim().split(' ')[0]}! 🎉`, 'success')
        onClose()
      } else {
        const user = await login(email.trim(), pass)
        showToast(`Welcome back, ${(user.displayName || email).split(' ')[0]}!`, 'success')
        onClose()
      }
    } catch (err) {
      const code = err?.code || ''
      const msg =
        code === 'auth/email-already-in-use'    ? 'Email already registered — try signing in' :
        code === 'auth/user-not-found'           ? 'No account found with this email' :
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'       ? 'Incorrect email or password' :
        code === 'auth/invalid-email'            ? 'Please enter a valid email address' :
        code === 'auth/weak-password'            ? 'Password must be at least 6 characters' :
        code === 'auth/too-many-requests'        ? 'Too many attempts — please wait and try again' :
        code === 'auth/network-request-failed'   ? 'Network error — check your connection' :
        'Something went wrong — please try again'
      showToast(msg, 'error')
    }
    setBusy(false)
  }

  const inputStyle = {
    width: '100%', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', borderRadius: 8,
    padding: '9px 12px', color: '#0f172a',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 13, outline: 'none', transition: 'all .18s',
    boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: 11.5, fontWeight: 600,
    color: '#475569', marginBottom: 4,
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 18, maxWidth: 420, width: '100%',
        overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)',
        animation: 'slideUp .22s ease',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          padding: '22px 26px', position: 'relative',
        }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginTop: 3 }}>
            {mode === 'login' ? 'Sign in to access all practice tests' : 'Free forever · No credit card needed'}
          </p>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 14,
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)', border: 'none',
              color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ padding: '20px 26px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 18 }}>
            {['login','signup'].map(t => (
              <button
                key={t}
                onClick={() => onSwitch(t)}
                style={{
                  flex: 1, padding: '6px', borderRadius: 6,
                  background: mode === t ? '#fff' : 'transparent',
                  border: 'none', fontSize: 12.5, fontWeight: 600,
                  color: mode === t ? '#0f172a' : '#64748b',
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: mode === t ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                  transition: 'all .16s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} type="text" placeholder="Jane Smith"
                  value={name} onChange={e => setName(e.target.value)} autoComplete="name"
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={inputStyle} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              {mode === 'signup' && (
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Minimum 6 characters</p>
              )}
            </div>

            {/* Country — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Your Country</label>
                <div style={{ position: 'relative' }}>
                  {/* Flag preview */}
                  {selectedCountry && (
                    <span style={{
                      position: 'absolute', left: 10, top: '50%',
                      transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none',
                    }}>
                      {selectedCountry.flag}
                    </span>
                  )}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{
                      ...inputStyle,
                      paddingLeft: selectedCountry ? 38 : 12,
                      appearance: 'none', cursor: 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="">🌍 Select your country…</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                  Used for country rankings — shown on the leaderboard
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '11px', borderRadius: 8, border: 'none',
                background: busy ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                marginTop: 2, transition: 'all .2s',
                boxShadow: busy ? 'none' : '0 4px 14px rgba(37,99,235,.25)',
              }}
            >
              {busy
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'login'  ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => onSwitch(mode === 'login' ? 'signup' : 'login')}
              style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
    </div>
  )
}
