// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── SIGN UP ──────────────────────────────────────────────
  async function signup(name, email, password) {
    // Step 1: Create Firebase auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Step 2: Set display name on the Firebase user profile
    await updateProfile(cred.user, { displayName: name })

    // Step 3: Create a leaderboard entry in Firestore
    // Wrapped in its own try/catch so a Firestore error
    // does NOT block the signup from succeeding
    try {
      await setDoc(doc(db, 'leaderboard', cred.user.uid), {
        userId:         cred.user.uid,
        userName:       name,
        email:          email.toLowerCase(),
        testsCompleted: 0,
        totalCorrect:   0,
        totalQuestions: 0,
        avgScore:       0,
        avgBand:        '—',
        bestBand:       '—',
        bestScore:      0,
        createdAt:      serverTimestamp(),
        lastPlayed:     null,
      })
    } catch (firestoreErr) {
      // Leaderboard entry failed but auth still succeeded
      console.warn('Leaderboard entry not created:', firestoreErr.message)
    }

    // Return the created user — onAuthStateChanged updates state automatically
    return cred.user
  }

  // ── SIGN IN ──────────────────────────────────────────────
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  // ── SIGN OUT ─────────────────────────────────────────────
  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
