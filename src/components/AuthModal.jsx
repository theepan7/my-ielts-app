// src/components/AuthModal.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES } from '../data/countries'

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

// ── Verification pending screen ────────────────────────────
function VerificationPending({ email, onResend, onSwitchToLogin }) {
  const [resending, setResending] = useState(false)
  const [resent,    setResent]    = useState(false)

  async function handleResend() {
    setResending(true)
    const ok = await onResend()
    setResending(false)
    if (ok) setResent(true)
  }

  return (
    <div style={{ padding: '28px 26px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
        background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)',
        border: '2px solid #bfdbfe',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>✉️</div>

      <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
        Check your email
      </h2>
      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 6 }}>
        We sent a verification link to
      </p>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#2563eb', marginBottom: 18, wordBreak: 'break-all' }}>
        {email}
      </p>

      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
      }}>
        {[
          'Open your email inbox',
          'Find the email from IELTS Listening Pro',
          'Click the "Verify Email" link',
          'Return here and sign in',
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12.5, color: '#475569', marginBottom: i < 3 ? 9 : 0,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: '#2563eb', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{i + 1}</span>
            {step}
          </div>
        ))}
      </div>

      <button onClick={onSwitchToLogin} style={{
        width: '100%', padding: '11px', borderRadius: 8, border: 'none',
        background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
        cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 9,
      }}>
        I've verified — Sign In Now
      </button>

      {resent ? (
        <p style={{ fontSize: 12.5, color: '#059669', fontWeight: 600, marginBottom: 8 }}>
          ✓ Verification email resent — check your inbox
        </p>
      ) : (
        <button onClick={handleResend} disabled={resending} style={{
          width: '100%', padding: '9px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#f8fafc',
          color: '#475569', fontWeight: 600, fontSize: 13,
          cursor: resending ? 'not-allowed' : 'pointer',
          fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8,
        }}>
          {resending ? 'Sending…' : '↻ Resend verification email'}
        </button>
      )}

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
        Can't find it? Check your spam or junk folder.
      </p>
    </div>
  )
}

// ── Country picker (used for OAuth flows) ─────────────────
function CountryPicker({ value, onChange }) {
  const selected = COUNTRIES.find(c => c.code === value)
  return (
    <div>
      <label style={LABEL}>Your Country <span style={{ color: '#dc2626' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        {selected && (
          <span style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
          }}>{selected.flag}</span>
        )}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            ...INPUT,
            paddingLeft: selected ? 36 : 12,
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
  )
}

// ── Social button ──────────────────────────────────────────
function SocialBtn({ onClick, disabled, icon, label, color, bg, border }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 12px', borderRadius: 8,
        border: `1.5px solid ${border}`, background: bg, color,
        fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        transition: 'all .18s', opacity: disabled ? .6 : 1,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '.85' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  )
}

// ── Main Modal ─────────────────────────────────────────────
export default function AuthModal({ mode, onClose, onSwitch, showToast }) {
  const { signup, login, signInWithGoogle, signInWithFacebook, resendVerification } = useAuth()

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [pass,        setPass]        = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [busy,        setBusy]        = useState(false)
  const [socialBusy,  setSocialBusy]  = useState(null) // 'google' | 'facebook'
  const [pending,     setPending]     = useState(null)
  // OAuth country step: after social signin, ask for country if not set
  const [oauthUser,   setOauthUser]   = useState(null)

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)

  function friendlyError(code) {
    return (
      code === 'auth/email-already-in-use'   ? 'Email already registered — try signing in.'         :
      code === 'auth/user-not-found'         ? 'No account found with this email.'                  :
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'     ? 'Incorrect email or password.'                       :
      code === 'auth/invalid-email'          ? 'Please enter a valid email address.'                :
      code === 'auth/weak-password'          ? 'Password must be at least 6 characters.'            :
      code === 'auth/too-many-requests'      ? 'Too many attempts — please wait and try again.'     :
      code === 'auth/network-request-failed' ? 'Network error — check your connection.'             :
      code === 'auth/popup-closed-by-user'   ? null                                                 :
      code === 'auth/disposable-email'       ? 'Please use a real email address.'                   :
      code === 'auth/email-not-verified'     ? null                                                 :
      code === 'auth/account-exists-with-different-credential'
        ? 'An account already exists with this email using a different sign-in method.' :
      'Something went wrong — please try again.'
    )
  }

  // ── Email/password submit ────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !pass.trim()) { showToast('Please fill in all fields.', 'error'); return }
    if (mode === 'signup') {
      if (!name.trim())   { showToast('Please enter your name.',    'error'); return }
      if (!countryCode)   { showToast('Please select your country.','error'); return }
    }
    if (pass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return }

    setBusy(true)
    try {
      if (mode === 'signup') {
        await signup(
          name.trim(), email.trim(), pass,
          selectedCountry?.code || '',
          selectedCountry?.name || '',
          selectedCountry?.flag || '🌍',
        )
        setPending({ email: email.trim(), password: pass })
      } else {
        const u = await login(email.trim(), pass)
        showToast(`Welcome back, ${(u.displayName || email).split(' ')[0]}! 👋`, 'success')
        onClose()
      }
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/email-not-verified') {
        showToast('Email not verified — check your inbox first.', 'error')
        setPending({ email: email.trim(), password: pass })
      } else {
        const msg = friendlyError(code)
        if (msg) showToast(msg, 'error')
      }
    }
    setBusy(false)
  }

  // ── Google sign in ───────────────────────────────────────
  async function handleGoogle() {
    if (!countryCode && mode !== 'login') {
      showToast('Please select your country first.', 'error'); return
    }
    setSocialBusy('google')
    try {
      const u = await signInWithGoogle(
        selectedCountry?.code || '',
        selectedCountry?.name || '',
        selectedCountry?.flag || '🌍',
      )
      showToast(`Welcome, ${u.displayName?.split(' ')[0] || 'there'}! 🎉`, 'success')
      onClose()
    } catch (err) {
      const msg = friendlyError(err?.code)
      if (msg) showToast(msg, 'error')
    }
    setSocialBusy(null)
  }

  // ── Facebook sign in ─────────────────────────────────────
  async function handleFacebook() {
    if (!countryCode && mode !== 'login') {
      showToast('Please select your country first.', 'error'); return
    }
    setSocialBusy('facebook')
    try {
      const u = await signInWithFacebook(
        selectedCountry?.code || '',
        selectedCountry?.name || '',
        selectedCountry?.flag || '🌍',
      )
      showToast(`Welcome, ${u.displayName?.split(' ')[0] || 'there'}! 🎉`, 'success')
      onClose()
    } catch (err) {
      const msg = friendlyError(err?.code)
      if (msg) showToast(msg, 'error')
    }
    setSocialBusy(null)
  }

  function switchToLogin() { setPending(null); onSwitch('login') }

  // ── Verification pending state ────────────────────────────
  if (pending) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ background: '#fff', borderRadius: 18, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)', animation: 'slideUp .22s ease' }}>
          <VerificationPending
            email={pending.email}
            onResend={() => resendVerification(pending.email, pending.password)}
            onSwitchToLogin={switchToLogin}
          />
        </div>
        <AnimStyle />
      </Overlay>
    )
  }

  const anyBusy = busy || !!socialBusy

  return (
    <Overlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: 18, maxWidth: 440, width: '100%',
        overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)',
        animation: 'slideUp .22s ease', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#4338ca)', padding: '22px 26px', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginTop: 3 }}>
            {mode === 'login' ? 'Sign in to access all practice tests' : 'Free forever · No credit card needed'}
          </p>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '20px 26px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 18 }}>
            {['login','signup'].map(t => (
              <button key={t} type="button" onClick={() => { setPending(null); onSwitch(t) }} style={{
                flex: 1, padding: '6px', borderRadius: 6,
                background: mode === t ? '#fff' : 'transparent', border: 'none',
                fontSize: 12.5, fontWeight: 600,
                color: mode === t ? '#0f172a' : '#64748b',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: mode === t ? '0 1px 3px rgba(15,23,42,.08)' : 'none', transition: 'all .16s',
              }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Country picker — shown for BOTH signup and social login */}
          {/* For login it's only needed if user doesn't have country yet */}
          {mode === 'signup' && (
            <CountryPicker value={countryCode} onChange={setCountryCode} />
          )}

          {/* Social buttons */}
          <div style={{ marginTop: mode === 'signup' ? 14 : 0, marginBottom: 16 }}>
            {mode === 'signup' && (
              <p style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
                Or sign up with
              </p>
            )}
            {mode === 'login' && (
              <p style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
                Sign in with
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialBtn
                onClick={handleGoogle}
                disabled={anyBusy}
                icon={socialBusy === 'google' ? '⏳' : '🇬'}
                label={socialBusy === 'google' ? 'Connecting…' : 'Google'}
                color="#1a1a1a" bg="#fff" border="#e2e8f0"
              />
              <SocialBtn
                onClick={handleFacebook}
                disabled={anyBusy}
                icon={socialBusy === 'facebook' ? '⏳' : '📘'}
                label={socialBusy === 'facebook' ? 'Connecting…' : 'Facebook'}
                color="#fff" bg="#1877f2" border="#1877f2"
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              or use email
            </span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>

            {mode === 'signup' && (
              <div>
                <label style={LABEL}>Full Name</label>
                <input style={INPUT} type="text" placeholder="Jane Smith"
                  value={name} onChange={e => setName(e.target.value)} autoComplete="name"
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            )}

            <div>
              <label style={LABEL}>Email Address</label>
              <input style={INPUT} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

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

            {/* Email verification notice on login */}
            {mode === 'login' && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 8, padding: '9px 12px',
                fontSize: 12, color: '#92400e', lineHeight: 1.55,
              }}>
                💡 If you signed up with email, verify your inbox before signing in.
              </div>
            )}

            <button
              type="submit"
              disabled={anyBusy}
              style={{
                padding: '11px', borderRadius: 8, border: 'none',
                background: anyBusy ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: anyBusy ? 'not-allowed' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                marginTop: 2, transition: 'all .2s',
                boxShadow: anyBusy ? 'none' : '0 4px 14px rgba(37,99,235,.25)',
              }}
            >
              {busy
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'login'  ? 'Sign In with Email' : 'Create Account')}
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
      <AnimStyle />
    </Overlay>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      {children}
    </div>
  )
}

function AnimStyle() {
  return (
    <style>{`
      @keyframes slideUp {
        from { opacity:0; transform:translateY(18px) scale(.97) }
        to   { opacity:1; transform:translateY(0) scale(1) }
      }
    `}</style>
  )
}
