// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

// Disposable / throwaway email domains — blocked at signup
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
        // Only treat verified users as logged in
        setUser(firebaseUser.emailVerified ? firebaseUser : null)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── SIGN UP ─────────────────────────────────────────────
  // Creates account, sends verification email, signs out immediately.
  // User must verify email before they can sign in.
  async function signup(name, email, password, countryCode, countryName, countryFlag) {
    const domain = email.trim().toLowerCase().split('@')[1] || ''
    if (BLOCKED_DOMAINS.includes(domain)) {
      const e = new Error('Please use a real email address.')
      e.code  = 'auth/disposable-email'
      throw e
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })

    // Send verification email
    await sendEmailVerification(cred.user, {
      url: window.location.origin,
    })

    // Create leaderboard entry while auth is still active
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
      console.warn('Leaderboard entry error:', err.message)
    }

    // Sign out — user cannot access app until email verified
    await signOut(auth)
    return { status: 'pending_verification', email: email.trim() }
  }

  // ── SIGN IN ─────────────────────────────────────────────
  // Rejects login if email not verified
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    await reload(cred.user)

    if (!cred.user.emailVerified) {
      await signOut(auth)
      const e = new Error(
        'Your email is not verified yet. Please check your inbox and click the verification link before signing in.'
      )
      e.code = 'auth/email-not-verified'
      throw e
    }

    // Mark leaderboard as verified
    try {
      await updateDoc(doc(db, 'leaderboard', cred.user.uid), { emailVerified: true })
    } catch (_) {}

    return cred.user
  }

  // ── RESEND VERIFICATION ──────────────────────────────────
  async function resendVerification(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      if (!cred.user.emailVerified) {
        await sendEmailVerification(cred.user, { url: window.location.origin })
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
    <AuthContext.Provider value={{ user, loading, signup, login, logout, resendVerification }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
