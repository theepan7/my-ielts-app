// src/components/AuthModal.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES } from '../data/countries'

// ── Input + Label style helpers ───────────────────────────
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

// ── Pending verification screen ───────────────────────────
function VerificationPending({ email, onResend, onClose, onSwitchToLogin }) {
  const [resending,  setResending]  = useState(false)
  const [resent,     setResent]     = useState(false)

  async function handleResend() {
    setResending(true)
    const ok = await onResend()
    setResending(false)
    if (ok) setResent(true)
  }

  return (
    <div style={{ padding: '28px 26px', textAlign: 'center' }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
        background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)',
        border: '2px solid #bfdbfe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        ✉️
      </div>

      <h2 style={{
        fontFamily: 'Lora, serif', fontSize: '1.2rem',
        fontWeight: 600, color: '#0f172a', marginBottom: 8,
      }}>
        Check your email
      </h2>

      <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.75, marginBottom: 6 }}>
        We sent a verification link to
      </p>
      <p style={{
        fontSize: 13.5, fontWeight: 700, color: '#2563eb',
        marginBottom: 18, wordBreak: 'break-all',
      }}>
        {email}
      </p>

      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.65, marginBottom: 22 }}>
        Click the link in the email to verify your account. Once verified, come back and sign in.
      </p>

      {/* Steps */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: '14px 16px', marginBottom: 22,
        textAlign: 'left',
      }}>
        {[
          '1. Open your email inbox',
          '2. Find the email from IELTS Listening Pro',
          '3. Click the "Verify Email" button',
          '4. Return here and sign in',
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12.5, color: '#475569',
            marginBottom: i < 3 ? 8 : 0,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: '#2563eb', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{i + 1}</span>
            {step.slice(3)}
          </div>
        ))}
      </div>

      {/* Sign in button — main CTA */}
      <button
        onClick={onSwitchToLogin}
        style={{
          width: '100%', padding: '11px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10,
        }}
      >
        I've verified — Sign In Now
      </button>

      {/* Resend */}
      {!resent ? (
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            width: '100%', padding: '9px', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#475569', fontWeight: 600, fontSize: 13,
            cursor: resending ? 'not-allowed' : 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8,
          }}
        >
          {resending ? 'Sending…' : '↻ Resend verification email'}
        </button>
      ) : (
        <p style={{
          fontSize: 12.5, color: '#059669', fontWeight: 600,
          marginBottom: 8,
        }}>
          ✓ Verification email resent — check your inbox
        </p>
      )}

      {/* Spam note */}
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
        Can't find it? Check your spam or junk folder.
      </p>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────
export default function AuthModal({ mode, onClose, onSwitch, showToast }) {
  const { signup, login, resendVerification } = useAuth()

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [pass,        setPass]        = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [busy,        setBusy]        = useState(false)
  const [pending,     setPending]     = useState(null) // { email, password } while awaiting verification

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)

  // Map Firebase error codes to friendly messages
  function friendlyError(code) {
    return (
      code === 'auth/email-already-in-use'  ? 'Email already registered — try signing in instead.' :
      code === 'auth/user-not-found'        ? 'No account found with this email.' :
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'    ? 'Incorrect email or password.' :
      code === 'auth/invalid-email'         ? 'Please enter a valid email address.' :
      code === 'auth/weak-password'         ? 'Password must be at least 6 characters.' :
      code === 'auth/too-many-requests'     ? 'Too many attempts — please wait a moment and try again.' :
      code === 'auth/network-request-failed'? 'Network error — check your connection.' :
      code === 'auth/email-not-verified'    ? null : // handled inline
      code === 'auth/disposable-email'      ? 'Please use a real email address to sign up.' :
      'Something went wrong — please try again.'
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Basic validation
    if (!email.trim() || !pass.trim()) {
      showToast('Please fill in all fields.', 'error'); return
    }
    if (mode === 'signup') {
      if (!name.trim())   { showToast('Please enter your name.', 'error'); return }
      if (!countryCode)   { showToast('Please select your country.', 'error'); return }
    }
    if (pass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return }

    setBusy(true)
    try {
      if (mode === 'signup') {
        // Returns { status: 'pending_verification' }
        await signup(
          name.trim(), email.trim(), pass,
          selectedCountry?.code || '',
          selectedCountry?.name || '',
          selectedCountry?.flag || '🌍',
        )
        // Show the verification pending screen
        setPending({ email: email.trim(), password: pass })

      } else {
        // Login — will throw if email not verified
        const u = await login(email.trim(), pass)
        showToast(`Welcome back, ${(u.displayName || email).split(' ')[0]}! 👋`, 'success')
        onClose()
      }
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/email-not-verified') {
        // Show a specific toast + offer the pending screen
        showToast('Email not verified — check your inbox first.', 'error')
        setPending({ email: email.trim(), password: pass })
      } else {
        const msg = friendlyError(code)
        if (msg) showToast(msg, 'error')
      }
    }
    setBusy(false)
  }

  async function handleResend() {
    if (!pending) return false
    return resendVerification(pending.email, pending.password)
  }

  function switchToLogin() {
    setPending(null)
    onSwitch('login')
  }

  // ── Pending verification state ────────────────────────
  if (pending) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ background: '#fff', borderRadius: 18, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)', animation: 'slideUp .22s ease' }}>
          <VerificationPending
            email={pending.email}
            onResend={handleResend}
            onClose={onClose}
            onSwitchToLogin={switchToLogin}
          />
        </div>
        <Anim />
      </Overlay>
    )
  }

  // ── Normal sign in / sign up form ─────────────────────
  return (
    <Overlay onClose={onClose}>
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
            {mode === 'login'
              ? 'Sign in to access all practice tests'
              : 'Free forever · No credit card needed'}
          </p>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 14,
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 26px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 18 }}>
            {['login','signup'].map(t => (
              <button key={t} type="button" onClick={() => { setPending(null); onSwitch(t) }} style={{
                flex: 1, padding: '6px', borderRadius: 6,
                background: mode === t ? '#fff' : 'transparent',
                border: 'none', fontSize: 12.5, fontWeight: 600,
                color: mode === t ? '#0f172a' : '#64748b',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: mode === t ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                transition: 'all .16s',
              }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Verification notice on login tab */}
          {mode === 'login' && (
            <div style={{
              background: '#eff4ff', border: '1px solid #bfdbfe',
              borderRadius: 8, padding: '10px 12px', marginBottom: 14,
              fontSize: 12, color: '#1d4ed8', lineHeight: 1.55,
            }}>
              🔒 Your email must be verified before you can sign in.
              Check your inbox after registering.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={LABEL}>Full Name</label>
                <input style={INPUT} type="text" placeholder="Jane Smith"
                  value={name} onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={LABEL}>Email Address</label>
              <input style={INPUT} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={LABEL}>Password</label>
              <input style={INPUT} type="password" placeholder="••••••••"
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
                <label style={LABEL}>Your Country</label>
                <div style={{ position: 'relative' }}>
                  {selectedCountry && (
                    <span style={{
                      position: 'absolute', left: 10, top: '50%',
                      transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
                    }}>
                      {selectedCountry.flag}
                    </span>
                  )}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{
                      ...INPUT,
                      paddingLeft: selectedCountry ? 36 : 12,
                      appearance: 'none', cursor: 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="">🌍  Select your country…</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                  Used for country rankings on the leaderboard
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
                : (mode === 'login'  ? 'Sign In' : 'Create Account & Send Verification')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setPending(null); onSwitch(mode === 'login' ? 'signup' : 'login') }}
              style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      <Anim />
    </Overlay>
  )
}

// ── Shared overlay wrapper ────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {children}
    </div>
  )
}

function Anim() {
  return (
    <style>{`
      @keyframes slideUp {
        from { opacity:0; transform:translateY(18px) scale(.97) }
        to   { opacity:1; transform:translateY(0) scale(1) }
      }
    `}</style>
  )
}
