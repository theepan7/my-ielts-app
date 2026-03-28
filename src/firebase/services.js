// src/firebase/services.js
// All Firestore read/write operations live here.

import {
  collection, doc, getDocs, getDoc,
  addDoc, query, orderBy, limit,
  where, serverTimestamp, updateDoc, increment
} from 'firebase/firestore'
import { db } from './config'

// ─── TESTS ───────────────────────────────────────────

// Fetch all tests (or filtered by category)
export async function fetchTests(category = null) {
  let q = collection(db, 'tests')
  if (category) {
    q = query(q, where('category', '==', category), orderBy('id'))
  } else {
    q = query(q, orderBy('id'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}

// Fetch a single test with all sections and questions
export async function fetchTestDetail(testDocId) {
  // Get sections
  const secSnap = await getDocs(
    query(collection(db, 'tests', testDocId, 'sections'), orderBy('sectionNo'))
  )

  const sections = await Promise.all(
    secSnap.docs.map(async secDoc => {
      // Get questions for each section
      const qSnap = await getDocs(
        query(collection(db, 'tests', testDocId, 'sections', secDoc.id, 'questions'), orderBy('questionNo'))
      )
      const questions = qSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() }))
      return { id: secDoc.id, ...secDoc.data(), questions }
    })
  )

  return sections
}

// ─── RESULTS ─────────────────────────────────────────

// Save a test result after submission
export async function saveResult(userId, testId, score, band, answers) {
  await addDoc(collection(db, 'results'), {
    userId,
    testId,
    score,
    band,
    answers,
    completedAt: serverTimestamp(),
  })

  // Update leaderboard entry for this user
  const lbRef = doc(db, 'leaderboard', userId)
  const lbSnap = await getDoc(lbRef)

  if (lbSnap.exists()) {
    const data = lbSnap.data()
    const newCount = data.testsCount + 1
    const newAvg = ((data.avgScore * data.testsCount) + score) / newCount
    await updateDoc(lbRef, {
      testsCount: increment(1),
      avgScore: parseFloat(newAvg.toFixed(1)),
      lastPlayed: serverTimestamp(),
    })
  }
  // Note: leaderboard doc is created on first result save via Cloud Function
  // (see firestore.rules and the seed script)
}

// Fetch completed test IDs for a user
export async function fetchUserResults(userId) {
  const snap = await getDocs(
    query(collection(db, 'results'), where('userId', '==', userId))
  )
  return snap.docs.map(d => d.data().testId)
}

// ─── LEADERBOARD ─────────────────────────────────────

// Fetch top 10 leaderboard entries
export async function fetchLeaderboard() {
  const snap = await getDocs(
    query(collection(db, 'leaderboard'), orderBy('avgScore', 'desc'), limit(10))
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, docId: d.id, ...d.data() }))
}

// ─── CONTACT ─────────────────────────────────────────

export async function sendContactMessage(name, email, subject, message) {
  await addDoc(collection(db, 'contactMessages'), {
    name, email, subject, message,
    sentAt: serverTimestamp(),
    read: false,
  })
}
