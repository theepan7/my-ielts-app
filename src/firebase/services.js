// src/firebase/services.js
import {
  collection, doc, getDoc, getDocs,
  addDoc, setDoc, updateDoc,
  query, orderBy, limit, where,
  serverTimestamp, runTransaction
} from 'firebase/firestore'
import { db } from './config'

// ─────────────────────────────────────────────────────────
//  TESTS
// ─────────────────────────────────────────────────────────

// Fetch all tests metadata (no questions)
export async function fetchTests(category = null) {
  let q = category
    ? query(collection(db, 'tests'), where('category', '==', category), orderBy('id'))
    : query(collection(db, 'tests'), orderBy('id'))

  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}

// Fetch one test's parts and sections with questions
export async function fetchTestWithQuestions(testDocId) {
  // 1. Get test metadata
  const testSnap = await getDoc(doc(db, 'tests', testDocId))
  if (!testSnap.exists()) throw new Error('Test not found')
  const test = { docId: testSnap.id, ...testSnap.data() }

  // 2. Get parts
  const partsSnap = await getDocs(
    query(collection(db, 'tests', testDocId, 'parts'), orderBy('partNo'))
  )

  // 3. Get sections for each part
  test.parts = await Promise.all(
    partsSnap.docs.map(async partDoc => {
      const part = { id: partDoc.id, ...partDoc.data() }

      const sectionsSnap = await getDocs(
        query(
          collection(db, 'tests', testDocId, 'parts', partDoc.id, 'sections'),
          orderBy('order')
        )
      )
      part.sections = sectionsSnap.docs.map(s => ({ id: s.id, ...s.data() }))
      return part
    })
  )

  return test
}

// ─────────────────────────────────────────────────────────
//  RESULTS
// ─────────────────────────────────────────────────────────

export async function saveResult(userId, userName, testDocId, testId, correct, total, band, partScores) {
  // 1. Save result document
  await addDoc(collection(db, 'results'), {
    userId,
    userName,
    testDocId,
    testId,
    correct,
    total,
    band,
    percentage: Math.round((correct / total) * 100),
    partScores,
    completedAt: serverTimestamp(),
  })

  // 2. Update leaderboard atomically
  const lbRef = doc(db, 'leaderboard', userId)
  await runTransaction(db, async tx => {
    const lbSnap = await tx.get(lbRef)

    if (!lbSnap.exists()) {
      tx.set(lbRef, {
        userId, userName,
        testsCompleted: 1,
        totalCorrect: correct,
        totalQuestions: total,
        avgScore: parseFloat(((correct / total) * 40).toFixed(1)),
        avgBand: band,
        bestBand: band,
        bestScore: correct,
        lastPlayed: serverTimestamp(),
      })
    } else {
      const d = lbSnap.data()
      const newCount  = d.testsCompleted + 1
      const newCorr   = d.totalCorrect + correct
      const newTotal  = d.totalQuestions + total
      const newAvg    = parseFloat(((newCorr / newTotal) * 40).toFixed(1))
      const newBest   = correct > d.bestScore ? correct : d.bestScore
      const newBestBand = parseFloat(band) > parseFloat(d.bestBand || 0)
        ? band : d.bestBand

      tx.update(lbRef, {
        testsCompleted:  newCount,
        totalCorrect:    newCorr,
        totalQuestions:  newTotal,
        avgScore:        newAvg,
        avgBand:         calcBand(newAvg),
        bestBand:        newBestBand,
        bestScore:       newBest,
        lastPlayed:      serverTimestamp(),
      })
    }
  })
}

// Fetch completed test IDs for a user
export async function fetchUserCompletedTests(userId) {
  const snap = await getDocs(
    query(collection(db, 'results'), where('userId', '==', userId))
  )
  return snap.docs.map(d => d.data().testId)
}

// Fetch user's best score per test
export async function fetchUserBestScores(userId) {
  const snap = await getDocs(
    query(collection(db, 'results'), where('userId', '==', userId))
  )
  const best = {}
  snap.docs.forEach(d => {
    const data = d.data()
    if (!best[data.testId] || data.correct > best[data.testId].correct) {
      best[data.testId] = { correct: data.correct, total: data.total, band: data.band }
    }
  })
  return best
}

// ─────────────────────────────────────────────────────────
//  LEADERBOARD
// ─────────────────────────────────────────────────────────

export async function fetchLeaderboard() {
  const snap = await getDocs(
    query(collection(db, 'leaderboard'), orderBy('avgScore', 'desc'), limit(10))
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

export async function fetchUserRank(userId) {
  const userSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (!userSnap.exists()) return null

  const userAvg = userSnap.data().avgScore
  const higherSnap = await getDocs(
    query(collection(db, 'leaderboard'), where('avgScore', '>', userAvg))
  )
  return { rank: higherSnap.size + 1, ...userSnap.data() }
}

// ─────────────────────────────────────────────────────────
//  CONTACT
// ─────────────────────────────────────────────────────────

export async function sendContactMessage(name, email, subject, message) {
  await addDoc(collection(db, 'contactMessages'), {
    name, email, subject, message,
    sentAt: serverTimestamp(),
    read: false,
  })
}

// ─────────────────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────────────────

export function calcBand(correct) {
  if (correct >= 39) return '9.0'
  if (correct >= 37) return '8.5'
  if (correct >= 35) return '8.0'
  if (correct >= 33) return '7.5'
  if (correct >= 30) return '7.0'
  if (correct >= 27) return '6.5'
  if (correct >= 23) return '6.0'
  if (correct >= 20) return '5.5'
  if (correct >= 16) return '5.0'
  return '4.5'
}
