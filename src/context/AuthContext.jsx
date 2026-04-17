// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

const googleProvider   = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
facebookProvider.addScope('email')
facebookProvider.addScope('public_profile')

const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
  'yopmail.com','trashmail.com','fakeinbox.com','maildrop.cc',
  'sharklasers.com','grr.la','spam4.me','dispostable.com',
  'spamgourmet.com','mytemp.email','temp-mail.org','discard.email',
  'mailnull.com','tempr.email','getairmail.com','mt2014.com',
  'drdrb.com','spamhereplease.com','guerrillamailblock.com',
]

const COUNTRY_KEY = 'ielts_pending_country'

// ── Helper: is a Firebase user considered verified? ────────
// Email/password users must have emailVerified = true
// OAuth users (Google/Facebook) are always trusted
function isUserVerified(firebaseUser) {
  if (!firebaseUser) return false
  if (firebaseUser.emailVerified) return true
  return firebaseUser.providerData?.some(
    p => p.providerId === 'google.com' || p.providerId === 'facebook.com'
  ) ?? false
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Auth state listener ────────────────────────────────
  // FIX: do NOT call reload() here — it causes race conditions.
  // reload() is only called explicitly in login() where we need
  // fresh emailVerified status. The listener just trusts the
  // current token state.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, firebaseUser => {
      if (isUserVerified(firebaseUser)) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Handle OAuth redirect result on page load ──────────
  // FIX: wrapped in its own try/catch that doesn't affect loading state
  // so a slow/failed redirect check never blocks the app from rendering
  useEffect(() => {
    getRedirectResult(auth)
      .then(async result => {
        if (!result?.user) return
        const u = result.user

        // Recover country saved before the redirect
        let countryCode = '', countryName = '', countryFlag = '🌍'
        try {
          const saved = JSON.parse(sessionStorage.getItem(COUNTRY_KEY) || 'null')
          if (saved) {
            countryCode = saved.code || ''
            countryName = saved.name || ''
            countryFlag = saved.flag || '🌍'
            sessionStorage.removeItem(COUNTRY_KEY)
          }
        } catch (_) {}

        await ensureLeaderboardEntry(
          u.uid,
          u.displayName || u.email?.split('@')[0] || 'Student',
          u.email,
          countryCode, countryName, countryFlag
        )
      })
      .catch(err => {
        // auth/no-auth-event is expected when no redirect happened — ignore it
        if (err?.code !== 'auth/no-auth-event') {
          console.warn('getRedirectResult:', err?.code, err?.message)
        }
      })
  }, [])

  // ── Create leaderboard entry for new OAuth users ───────
  async function ensureLeaderboardEntry(uid, name, email, countryCode, countryName, countryFlag) {
    try {
      const ref  = doc(db, 'leaderboard', uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          userId:          uid,
          userName:        name || '',
          email:           (email || '').toLowerCase(),
          countryCode:     countryCode || '',
          countryName:     countryName || '',
          countryFlag:     countryFlag || '🌍',
          testsCompleted:  0,
          uniqueTestsDone: [],
          bestScores:      {},
          avgScore:        0,
          avgBand:         '—',
          bestBand:        '—',
          bestScore:       0,
          seed:            false,
          emailVerified:   true,
          createdAt:       serverTimestamp(),
          lastPlayed:      null,
        })
      }
    } catch (err) {
      console.warn('ensureLeaderboardEntry error:', err.message)
    }
  }

  // ── Email / password SIGNUP ────────────────────────────
  // Creates account → sends verification email → signs out.
  // User must verify before they can log in.
  async function signup(name, email, password, countryCode, countryName, countryFlag) {
    const domain = email.trim().toLowerCase().split('@')[1] || ''
    if (BLOCKED_DOMAINS.includes(domain)) {
      const e = new Error('Please use a real email address.')
      e.code  = 'auth/disposable-email'
      throw e
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })

    // Send verification — no url option avoids UNAUTHORIZED_DOMAIN error
    try { await sendEmailVerification(cred.user) } catch (_) {}

    // Create leaderboard entry before signing out
    try {
      await setDoc(doc(db, 'leaderboard', cred.user.uid), {
        userId:          cred.user.uid,
        userName:        name.trim(),
        email:           email.trim().toLowerCase(),
        countryCode:     countryCode || '',
        countryName:     countryName || '',
        countryFlag:     countryFlag || '🌍',
        testsCompleted:  0,
        uniqueTestsDone: [],
        bestScores:      {},
        avgScore:        0,
        avgBand:         '—',
        bestBand:        '—',
        bestScore:       0,
        seed:            false,
        emailVerified:   false,
        createdAt:       serverTimestamp(),
        lastPlayed:      null,
      })
    } catch (err) { console.warn('Leaderboard entry error:', err.message) }

    // Sign out — user must verify email before accessing the app
    await signOut(auth)
    return { status: 'pending_verification', email: email.trim() }
  }

  // ── Email / password LOGIN ─────────────────────────────
  // FIX: reload() is called HERE (not in onAuthStateChanged)
  // so we get the fresh emailVerified status for this specific
  // login attempt without causing race conditions elsewhere.
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)

    // Reload to get the very latest emailVerified flag from Firebase
    await reload(cred.user)

    if (!cred.user.emailVerified) {
      // Sign out — must verify email first
      await signOut(auth)
      const e = new Error(
        'Your email is not verified yet. Please check your inbox and click the verification link.'
      )
      e.code = 'auth/email-not-verified'
      throw e
    }

    // Mark leaderboard doc as verified (best-effort)
    try {
      await updateDoc(doc(db, 'leaderboard', cred.user.uid), { emailVerified: true })
    } catch (_) {}

    // Return the user — onAuthStateChanged will fire and setUser automatically
    return cred.user
  }

  // ── Google sign in — uses REDIRECT (not popup) ─────────
  // signInWithRedirect avoids the COOP header issue with popups.
  async function signInWithGoogle(countryCode, countryName, countryFlag) {
    try {
      sessionStorage.setItem(COUNTRY_KEY, JSON.stringify({
        code: countryCode || '',
        name: countryName || '',
        flag: countryFlag || '🌍',
      }))
    } catch (_) {}
    // This navigates the browser away — nothing after this line runs
    await signInWithRedirect(auth, googleProvider)
  }

  // ── Facebook sign in — uses REDIRECT ──────────────────
  async function signInWithFacebook(countryCode, countryName, countryFlag) {
    try {
      sessionStorage.setItem(COUNTRY_KEY, JSON.stringify({
        code: countryCode || '',
        name: countryName || '',
        flag: countryFlag || '🌍',
      }))
    } catch (_) {}
    await signInWithRedirect(auth, facebookProvider)
  }

  // ── Resend verification email ──────────────────────────
  async function resendVerification(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await reload(cred.user)
      if (!cred.user.emailVerified) {
        await sendEmailVerification(cred.user)
      }
      await signOut(auth)
      return true
    } catch (_) {
      return false
    }
  }

  // ── Sign out ───────────────────────────────────────────
  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      login,
      signInWithGoogle,
      signInWithFacebook,
      logout,
      resendVerification,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
