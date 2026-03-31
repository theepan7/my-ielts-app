// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── SIGN UP — now includes country ───────────────────────
  async function signup(name, email, password, countryCode, countryName, countryFlag) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Store name in Firebase Auth profile
    await updateProfile(cred.user, { displayName: name })

    // Create leaderboard entry with country info
    try {
      await setDoc(doc(db, 'leaderboard', cred.user.uid), {
        userId:          cred.user.uid,
        userName:        name,
        email:           email.toLowerCase(),
        countryCode:     countryCode  || '',
        countryName:     countryName  || '',
        countryFlag:     countryFlag  || '🌍',
        testsCompleted:  0,
        uniqueTestsDone: [],
        bestScores:      {},
        totalCorrect:    0,
        totalQuestions:  0,
        avgScore:        0,
        avgBand:         '—',
        bestBand:        '—',
        bestScore:       0,
        createdAt:       serverTimestamp(),
        lastPlayed:      null,
      })
    } catch (err) {
      // Firestore error doesn't block auth success
      console.warn('Leaderboard entry not created:', err.message)
    }

    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

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
