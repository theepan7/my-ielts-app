// src/components/AuthModal.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES } from '../data/countries'

// ── Shared input styles ───────────────────────────────────
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

function focusBorder(e)  { e.target.style.borderColor = '#2563eb' }
function blurBorder(e)   { e.target.style.borderColor = '#e2e8f0' }

// ── Verification pending screen ───────────────────────────
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

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
        {['Open your email inbox', 'Find the email from IELTS Listening Pro', 'Click the "Verify Email" link', 'Return here and sign in'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#475569', marginBottom: i < 3 ? 9 : 0 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      <button onClick={onSwitchToLogin} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 9 }}>
        I've verified — Sign In Now
      </button>

      {resent ? (
        <p style={{ fontSize: 12.5, color: '#059669', fontWeight: 600, marginBottom: 8 }}>
          ✓ Verification email resent — check your inbox
        </p>
      ) : (
        <button onClick={handleResend} disabled={resending} style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: 13, cursor: resending ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: 8 }}>
          {resending ? 'Sending…' : '↻ Resend verification email'}
        </button>
      )}
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
        Can't find it? Check your spam or junk folder.
      </p>
    </div>
  )
}

// ── OAuth redirect loading screen ─────────────────────────
function RedirectingScreen({ provider }) {
  return (
    <div style={{ padding: '40px 26px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px',
        background: provider === 'google' ? '#fff' : '#1877f2',
        border: provider === 'google' ? '2px solid #e2e8f0' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
      }}>
        {provider === 'google' ? '🇬' : '📘'}
      </div>
      <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
        Redirecting to {provider === 'google' ? 'Google' : 'Facebook'}…
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 20 }}>
        You'll be taken to {provider === 'google' ? 'Google' : 'Facebook'} to sign in.
        After signing in you'll be returned to the app automatically.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
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
  const [oauthBusy,   setOauthBusy]   = useState(null)  // null | 'google' | 'facebook'
  const [pending,     setPending]     = useState(null)   // { email, password } after signup

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)
  const anyBusy = busy || !!oauthBusy

  // Friendly error messages
  function friendlyError(code) {
    const map = {
      'auth/email-already-in-use':                    'Email already registered — try signing in.',
      'auth/user-not-found':                          'No account found with this email.',
      'auth/wrong-password':                          'Incorrect email or password.',
      'auth/invalid-credential':                      'Incorrect email or password.',
      'auth/invalid-email':                           'Please enter a valid email address.',
      'auth/weak-password':                           'Password must be at least 6 characters.',
      'auth/too-many-requests':                       'Too many attempts — please wait and try again.',
      'auth/network-request-failed':                  'Network error — check your connection.',
      'auth/disposable-email':                        'Please use a real email address.',
      'auth/account-exists-with-different-credential':'An account already exists with this email using a different sign-in method.',
    }
    return map[code] || null
  }

  // ── Email / password submit ───────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()

    // Validation
    if (!email.trim()) { showToast('Please enter your email.', 'error'); return }
    if (!pass.trim())  { showToast('Please enter your password.', 'error'); return }
    if (mode === 'signup') {
      if (!name.trim())  { showToast('Please enter your name.', 'error'); return }
      if (!countryCode)  { showToast('Please select your country.', 'error'); return }
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
        // Show verification pending screen
        setPending({ email: email.trim(), password: pass })

      } else {
        // LOGIN
        await login(email.trim(), pass)
        // onAuthStateChanged in AuthContext will set user automatically
        // Just close the modal — the rest of the UI reacts to user state
        showToast('Welcome back! 👋', 'success')
        onClose()
      }

    } catch (err) {
      const code = err?.code || ''

      if (code === 'auth/email-not-verified') {
        // Show the pending screen so user can resend or learn what to do
        showToast('Email not verified — check your inbox.', 'error')
        setPending({ email: email.trim(), password: pass })

      } else {
        const msg = friendlyError(code)
        showToast(msg || 'Something went wrong — please try again.', 'error')
      }
    }
    setBusy(false)
  }

  // ── Google OAuth ──────────────────────────────────────
  async function handleGoogle() {
    if (mode === 'signup' && !countryCode) {
      showToast('Please select your country first.', 'error')
      return
    }
    setOauthBusy('google')
    try {
      await signInWithGoogle(
        selectedCountry?.code || '',
        selectedCountry?.name || '',
        selectedCountry?.flag || '🌍',
      )
      // Browser navigates away — nothing below runs
    } catch (err) {
      setOauthBusy(null)
      const msg = friendlyError(err?.code)
      showToast(msg || 'Google sign-in failed — please try again.', 'error')
    }
  }

  // ── Facebook OAuth ────────────────────────────────────
  async function handleFacebook() {
    if (mode === 'signup' && !countryCode) {
      showToast('Please select your country first.', 'error')
      return
    }
    setOauthBusy('facebook')
    try {
      await signInWithFacebook(
        selectedCountry?.code || '',
        selectedCountry?.name || '',
        selectedCountry?.flag || '🌍',
      )
      // Browser navigates away — nothing below runs
    } catch (err) {
      setOauthBusy(null)
      const msg = friendlyError(err?.code)
      showToast(msg || 'Facebook sign-in failed — please try again.', 'error')
    }
  }

  function switchToLogin() { setPending(null); onSwitch('login') }

  // ── Show redirecting screen ───────────────────────────
  if (oauthBusy) {
    return (
      <Overlay onClose={() => {}}>
        <ModalCard>
          <RedirectingScreen provider={oauthBusy} />
        </ModalCard>
        <Anim />
      </Overlay>
    )
  }

  // ── Show verification pending screen ──────────────────
  if (pending) {
    return (
      <Overlay onClose={onClose}>
        <ModalCard>
          <VerificationPending
            email={pending.email}
            onResend={() => resendVerification(pending.email, pending.password)}
            onSwitchToLogin={switchToLogin}
          />
        </ModalCard>
        <Anim />
      </Overlay>
    )
  }

  // ── Sign in / Sign up form ────────────────────────────
  return (
    <Overlay onClose={onClose}>
      <ModalCard scrollable>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#4338ca)', padding: '22px 26px', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Lora,serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginTop: 3 }}>
            {mode === 'login' ? 'Sign in to access all practice tests' : 'Free forever · No credit card needed'}
          </p>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 26px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 18 }}>
            {['login', 'signup'].map(t => (
              <button key={t} type="button"
                onClick={() => { setPending(null); onSwitch(t) }}
                style={{
                  flex: 1, padding: '6px', borderRadius: 6, border: 'none',
                  background: mode === t ? '#fff' : 'transparent',
                  fontSize: 12.5, fontWeight: 600,
                  color: mode === t ? '#0f172a' : '#64748b',
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif',
                  boxShadow: mode === t ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                  transition: 'all .16s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Country — signup only (must pick before OAuth too) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={LABEL}>Your Country <span style={{ color: '#dc2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                {selectedCountry && (
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>
                    {selectedCountry.flag}
                  </span>
                )}
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  style={{ ...INPUT, paddingLeft: selectedCountry ? 36 : 12, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusBorder} onBlur={blurBorder}
                >
                  <option value="">🌍  Select your country…</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Used for country rankings on the leaderboard</p>
            </div>
          )}

          {/* Social buttons */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
              {mode === 'login' ? 'Quick sign in with' : 'Or sign up with'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Google */}
              <button type="button" onClick={handleGoogle} disabled={anyBusy} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#1a1a1a', fontSize: 13, fontWeight: 600, cursor: anyBusy ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', opacity: anyBusy ? .6 : 1 }}>
                <span style={{ fontSize: 15 }}>🇬</span> Google
              </button>
              {/* Facebook */}
              <button type="button" onClick={handleFacebook} disabled={anyBusy} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 8, border: '1.5px solid #1877f2', background: '#1877f2', color: '#fff', fontSize: 13, fontWeight: 600, cursor: anyBusy ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', opacity: anyBusy ? .6 : 1 }}>
                <span style={{ fontSize: 15 }}>📘</span> Facebook
              </button>
            </div>
            {mode === 'signup' && !countryCode && (
              <p style={{ fontSize: 11, color: '#f97316', marginTop: 7, textAlign: 'center' }}>
                ↑ Select your country above before continuing with Google or Facebook
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 11.5, color: '#94a3b8' }}>or use email</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {mode === 'signup' && (
              <div>
                <label style={LABEL}>Full Name</label>
                <input style={INPUT} type="text" placeholder="Jane Smith"
                  value={name} onChange={e => setName(e.target.value)}
                  autoComplete="name" onFocus={focusBorder} onBlur={blurBorder}
                />
              </div>
            )}

            <div>
              <label style={LABEL}>Email Address</label>
              <input style={INPUT} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>

            <div>
              <label style={LABEL}>Password</label>
              <input style={INPUT} type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                onFocus={focusBorder} onBlur={blurBorder}
              />
              {mode === 'signup' && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Minimum 6 characters</p>}
            </div>

            {/* Reminder on login tab */}
            {mode === 'login' && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#92400e', lineHeight: 1.55 }}>
                💡 If you signed up with email, verify your inbox before signing in.
              </div>
            )}

            <button type="submit" disabled={anyBusy} style={{
              padding: '11px', borderRadius: 8, border: 'none', marginTop: 2,
              background: anyBusy ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: anyBusy ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans,sans-serif',
              boxShadow: anyBusy ? 'none' : '0 4px 14px rgba(37,99,235,.25)',
              transition: 'all .2s',
            }}>
              {busy
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'login'  ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button"
              onClick={() => { setPending(null); onSwitch(mode === 'login' ? 'signup' : 'login') }}
              style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </ModalCard>
      <Anim />
    </Overlay>
  )
}

// ── Layout helpers ────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      {children}
    </div>
  )
}

function ModalCard({ children, scrollable }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, maxWidth: 440, width: '100%',
      overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,.14)',
      animation: 'slideUp .22s ease',
      ...(scrollable ? { maxHeight: '90vh', overflowY: 'auto' } : {}),
    }}>
      {children}
    </div>
  )
}

function Anim() {
  return (
    <style>{`
      @keyframes slideUp {
        from { opacity:0; transform:translateY(18px) scale(.97) }
        to   { opacity:1; transform:translateY(0)    scale(1)   }
      }
    `}</style>
  )
}
