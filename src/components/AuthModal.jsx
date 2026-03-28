import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
 
export default function AuthModal({ mode, onClose, onSwitch, showToast }) {
  const { signup, login } = useAuth()
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [busy,  setBusy]  = useState(false)
 
  async function handle(e) {
    e.preventDefault()
 
    // ── Validation ────────────────────────────────────────
    if (!email.trim() || !pass.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      showToast('Please enter your name', 'error')
      return
    }
    if (pass.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
 
    setBusy(true)
 
    try {
      if (mode === 'signup') {
        // ── Sign Up ────────────────────────────────────────
        await signup(name.trim(), email.trim(), pass)
        showToast(`Welcome aboard, ${name.trim().split(' ')[0]}! 🎉`, 'success')
        onClose()   // ← close modal on success
 
      } else {
        // ── Sign In ────────────────────────────────────────
        const user = await login(email.trim(), pass)
        const displayName = user?.displayName || name || email.split('@')[0]
        showToast(`Welcome back, ${displayName.split(' ')[0]}!`, 'success')
        onClose()   // ← close modal on success
      }
 
    } catch (err) {
      // ── Firebase error codes → friendly messages ────────
      const code = err?.code || ''
      let msg = 'Something went wrong — please try again'
 
      if (code === 'auth/email-already-in-use') {
        msg = 'Email already registered — try signing in'
      } else if (code === 'auth/user-not-found') {
        msg = 'No account found with this email'
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password'
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address'
      } else if (code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters'
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts — please wait a moment and try again'
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error — check your internet connection'
      }
 
      showToast(msg, 'error')
    }
 
    setBusy(false)
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
 
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-blue-700 to-violet-700 px-6 py-5 relative">
          <h2 className="font-serif text-xl font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-blue-200 text-xs mt-1">
            {mode === 'login'
              ? 'Sign in to access all practice tests'
              : 'Free forever · No credit card needed'}
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 text-xs transition-all"
          >
            ✕
          </button>
        </div>
 
        {/* ── Body ── */}
        <div className="p-6">
 
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 mb-5">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onSwitch(t)}
                className={`flex-1 py-1.5 rounded-md text-[12.5px] font-semibold transition-all ${
                  mode === t
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
 
          {/* Form */}
          <form onSubmit={handle} className="space-y-3" noValidate>
 
            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}
 
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
 
            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' && (
                <p className="text-[11px] text-slate-400 mt-1 ml-0.5">
                  Minimum 6 characters
                </p>
              )}
            </div>
 
            {/* Submit button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 mt-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {busy
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'login'  ? 'Sign In' : 'Create Account')}
            </button>
          </form>
 
          {/* Switch mode link */}
          <p className="text-center text-xs text-slate-500 mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => onSwitch(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
 
        </div>
      </div>
    </div>
  )
}
