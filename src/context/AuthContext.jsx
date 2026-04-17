// src/context/AuthContext.jsx
// OAuth uses signInWithRedirect instead of signInWithPopup
// to avoid Cross-Origin-Opener-Policy (COOP) errors.
//
// Flow:
//   1. User clicks "Sign in with Google/Facebook"
//   2. Browser redirects to Google/Facebook
//   3. After auth, browser redirects back to the app
//   4. getRedirectResult() picks up the result on mount
//   5. User is signed in

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

// Blocked throwaway email domains
const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
  'yopmail.com','trashmail.com','fakeinbox.com','maildrop.cc',
  'sharklasers.com','grr.la','spam4.me','dispostable.com',
  'spamgourmet.com','mytemp.email','temp-mail.org','discard.email',
  'mailnull.com','tempr.email','getairmail.com','mt2014.com',
  'drdrb.com','spamhereplease.com','guerrillamailblock.com',
]

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [redirecting,  setRedirecting]  = useState(false)
  // Stores pending country for OAuth redirect flow
  // Written before redirect, read after return
  const COUNTRY_KEY = 'ielts_pending_country'

  // ── Auth state listener ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try { await reload(firebaseUser) } catch (_) {}
        const isVerified =
          firebaseUser.emailVerified ||
          firebaseUser.providerData?.some(p =>
            p.providerId === 'google.com' || p.providerId === 'facebook.com'
          )
        setUser(isVerified ? firebaseUser : null)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Handle redirect result on page load ───────────────
  // This runs once after the browser returns from Google/Facebook
  useEffect(() => {
    getRedirectResult(auth)
      .then(async result => {
        if (!result?.user) return

        const u = result.user

        // Read the country that was saved before the redirect
        let countryCode = '', countryName = '', countryFlag = '🌍'
        try {
          const saved = JSON.parse(sessionStorage.getItem(COUNTRY_KEY) || 'null')
          if (saved) {
            countryCode = saved.code  || ''
            countryName = saved.name  || ''
            countryFlag = saved.flag  || '🌍'
            sessionStorage.removeItem(COUNTRY_KEY)
          }
        } catch (_) {}

        // Create leaderboard entry if first time
        await ensureLeaderboardEntry(
          u.uid,
          u.displayName || u.email?.split('@')[0] || 'Student',
          u.email,
          countryCode, countryName, countryFlag
        )
      })
      .catch(err => {
        // Ignore redirect errors on pages where no redirect was initiated
        if (err.code !== 'auth/no-auth-event') {
          console.warn('getRedirectResult error:', err.code)
        }
      })
  }, [])

  // ── Create leaderboard entry (first-time OAuth) ────────
  async function ensureLeaderboardEntry(uid, name, email, countryCode, countryName, countryFlag) {
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
  }

  // ── Email / password signup ────────────────────────────
  async function signup(name, email, password, countryCode, countryName, countryFlag) {
    const domain = email.trim().toLowerCase().split('@')[1] || ''
    if (BLOCKED_DOMAINS.includes(domain)) {
      const e = new Error('Please use a real email address.')
      e.code  = 'auth/disposable-email'
      throw e
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })

    try { await sendEmailVerification(cred.user) } catch (_) {}

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

    await signOut(auth)
    return { status: 'pending_verification', email: email.trim() }
  }

  // ── Email / password login ─────────────────────────────
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    await reload(cred.user)

    if (!cred.user.emailVerified) {
      await signOut(auth)
      const e = new Error(
        'Your email is not verified yet. Please check your inbox and click the verification link.'
      )
      e.code = 'auth/email-not-verified'
      throw e
    }

    try { await updateDoc(doc(db, 'leaderboard', cred.user.uid), { emailVerified: true }) } catch (_) {}
    return cred.user
  }

  // ── Google sign in (redirect — no popup) ──────────────
  // Saves country to sessionStorage before redirect so it
  // can be retrieved when getRedirectResult fires on return.
  async function signInWithGoogle(countryCode, countryName, countryFlag) {
    if (countryCode) {
      sessionStorage.setItem(COUNTRY_KEY, JSON.stringify({
        code: countryCode, name: countryName, flag: countryFlag
      }))
    }
    setRedirecting(true)
    await signInWithRedirect(auth, googleProvider)
    // Browser will navigate away — nothing after this runs
  }

  // ── Facebook sign in (redirect — no popup) ────────────
  async function signInWithFacebook(countryCode, countryName, countryFlag) {
    if (countryCode) {
      sessionStorage.setItem(COUNTRY_KEY, JSON.stringify({
        code: countryCode, name: countryName, flag: countryFlag
      }))
    }
    setRedirecting(true)
    await signInWithRedirect(auth, facebookProvider)
    // Browser will navigate away — nothing after this runs
  }

  // ── Resend verification ────────────────────────────────
  async function resendVerification(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await reload(cred.user)
      if (!cred.user.emailVerified) await sendEmailVerification(cred.user)
      await signOut(auth)
      return true
    } catch (_) { return false }
  }

  // ── Sign out ───────────────────────────────────────────
  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, redirecting,
      signup, login,
      signInWithGoogle, signInWithFacebook,
      logout, resendVerification,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
