// src/firebase/services.js
import {
  collection, doc, getDoc, getDocs,
  addDoc, query, orderBy, limit, where,
  serverTimestamp, runTransaction
} from 'firebase/firestore'
import { db } from './config'

// ─────────────────────────────────────────────────────────
//  TESTS
// ─────────────────────────────────────────────────────────

export async function fetchTests(category = null) {
  let q = category
    ? query(collection(db, 'tests'), where('category', '==', category), orderBy('id'))
    : query(collection(db, 'tests'), orderBy('id'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}

export async function fetchTestWithQuestions(testDocId) {
  const testSnap = await getDoc(doc(db, 'tests', testDocId))
  if (!testSnap.exists()) throw new Error('Test not found')
  const test = { docId: testSnap.id, ...testSnap.data() }

  const partsSnap = await getDocs(
    query(collection(db, 'tests', testDocId, 'parts'), orderBy('partNo'))
  )
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
//  SAVE RESULT
//
//  Rules applied here:
//  ✅ Every attempt saved to /results (for review history)
//  ✅ Progress (testsCompleted) counts UNIQUE tests only
//  ✅ Average score uses BEST score per unique test
//     so retrying only helps if you beat your previous best
// ─────────────────────────────────────────────────────────

export async function saveResult(
  userId, userName, testDocId, testId,
  correct, total, band, partScores
) {
  // 1. Always save the attempt record
  await addDoc(collection(db, 'results'), {
    userId, userName, testDocId, testId,
    correct, total, band,
    percentage:  Math.round((correct / total) * 100),
    partScores,
    completedAt: serverTimestamp(),
  })

  // 2. Update leaderboard atomically
  const lbRef = doc(db, 'leaderboard', userId)

  await runTransaction(db, async tx => {
    const lbSnap = await tx.get(lbRef)

    if (!lbSnap.exists()) {
      // First ever result for this user
      tx.set(lbRef, {
        userId,
        userName,
        testsCompleted:  1,
        uniqueTestsDone: [testId],
        // bestScores map: { testId: bestCorrectScore }
        bestScores:      { [String(testId)]: correct },
        avgScore:        correct,   // only 1 test so avg = this score
        avgBand:         band,
        bestBand:        band,
        bestScore:       correct,
        lastPlayed:      serverTimestamp(),
      })

    } else {
      const d = lbSnap.data()

      const uniqueDone    = d.uniqueTestsDone || []
      const bestScores    = d.bestScores      || {}
      const key           = String(testId)
      const alreadyDone   = uniqueDone.includes(testId)
      const prevBest      = bestScores[key] || 0
      const newBestForTest = Math.max(prevBest, correct)
      const scoreImproved  = newBestForTest > prevBest

      // Only update the bestScores map if score improved
      const newBestScores = scoreImproved
        ? { ...bestScores, [key]: newBestForTest }
        : bestScores

      // Progress: only count if this is a brand new test
      const newCount      = alreadyDone ? d.testsCompleted : d.testsCompleted + 1
      const newUniqueDone = alreadyDone ? uniqueDone : [...uniqueDone, testId]

      // Average = sum of best scores across all unique tests / (uniqueCount * 40) * 40
      // Simplified: sum of best scores / uniqueCount
      const totalBestCorrect = Object.values(newBestScores).reduce((s, v) => s + v, 0)
      const uniqueCount      = newUniqueDone.length
      const newAvgScore      = parseFloat((totalBestCorrect / uniqueCount).toFixed(1))

      // Overall best band and best score ever
      const newBestScore = Math.max(d.bestScore || 0, correct)
      const newBestBand  = parseFloat(band) > parseFloat(d.bestBand || '0')
        ? band : d.bestBand

      tx.update(lbRef, {
        testsCompleted:  newCount,
        uniqueTestsDone: newUniqueDone,
        bestScores:      newBestScores,
        avgScore:        newAvgScore,
        avgBand:         calcBand(Math.round(newAvgScore)),
        bestBand:        newBestBand,
        bestScore:       newBestScore,
        lastPlayed:      serverTimestamp(),
      })
    }
  })
}

// ─────────────────────────────────────────────────────────
//  FETCH USER DATA
// ─────────────────────────────────────────────────────────

export async function fetchUserCompletedTests(userId) {
  const lbSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (lbSnap.exists() && lbSnap.data().uniqueTestsDone) {
    return lbSnap.data().uniqueTestsDone
  }
  const snap = await getDocs(
    query(collection(db, 'results'), where('userId', '==', userId))
  )
  return [...new Set(snap.docs.map(d => d.data().testId))]
}

export const fetchUserResults = fetchUserCompletedTests

export async function fetchUserBestScores(userId) {
  const lbSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (lbSnap.exists() && lbSnap.data().bestScores) {
    return lbSnap.data().bestScores
  }
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
    query(
      collection(db, 'leaderboard'),
      orderBy('avgScore', 'desc'),
      limit(10)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

export async function fetchUserRank(userId) {
  const userSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (!userSnap.exists()) return null
  const userAvg    = userSnap.data().avgScore
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
    read:   false,
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
