// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

// Add scopes
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
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try { await reload(firebaseUser) } catch (_) {}
        // OAuth users (Google/Facebook) are always verified
        // Email/password users must verify email
        const isVerified = firebaseUser.emailVerified ||
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

  // ── Create or update leaderboard entry ──────────────────
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
        emailVerified:   true,
        createdAt:       serverTimestamp(),
        lastPlayed:      null,
      })
    }
  }

  // ── EMAIL / PASSWORD SIGNUP ──────────────────────────────
  async function signup(name, email, password, countryCode, countryName, countryFlag) {
    const domain = email.trim().toLowerCase().split('@')[1] || ''
    if (BLOCKED_DOMAINS.includes(domain)) {
      const e = new Error('Please use a real email address.')
      e.code  = 'auth/disposable-email'
      throw e
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })

    // Send verification email (no url option — avoids UNAUTHORIZED_DOMAIN)
    try {
      await sendEmailVerification(cred.user)
    } catch (err) {
      console.warn('Verification email failed:', err.code)
    }

    // Create leaderboard entry
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
        emailVerified:   false,
        createdAt:       serverTimestamp(),
        lastPlayed:      null,
      })
    } catch (err) {
      console.warn('Leaderboard error:', err.message)
    }

    // Sign out — must verify email before accessing app
    await signOut(auth)
    return { status: 'pending_verification', email: email.trim() }
  }

  // ── EMAIL / PASSWORD LOGIN ───────────────────────────────
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

    try {
      await updateDoc(doc(db, 'leaderboard', cred.user.uid), { emailVerified: true })
    } catch (_) {}

    return cred.user
  }

  // ── GOOGLE SIGN IN ───────────────────────────────────────
  // Opens a popup — user picks their Google account
  // No email verification needed — Google accounts are already verified
  async function signInWithGoogle(countryCode, countryName, countryFlag) {
    const cred = await signInWithPopup(auth, googleProvider)
    const u    = cred.user

    // Create leaderboard entry if first time
    await ensureLeaderboardEntry(
      u.uid,
      u.displayName || u.email?.split('@')[0] || 'Student',
      u.email,
      countryCode, countryName, countryFlag
    )

    return u
  }

  // ── FACEBOOK SIGN IN ─────────────────────────────────────
  // Opens a popup — user picks their Facebook account
  async function signInWithFacebook(countryCode, countryName, countryFlag) {
    const cred = await signInWithPopup(auth, facebookProvider)
    const u    = cred.user

    await ensureLeaderboardEntry(
      u.uid,
      u.displayName || 'Student',
      u.email,
      countryCode, countryName, countryFlag
    )

    return u
  }

  // ── RESEND VERIFICATION ──────────────────────────────────
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

  // ── SIGN OUT ─────────────────────────────────────────────
  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
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
