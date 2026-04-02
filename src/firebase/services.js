// src/firebase/services.js
import {
  collection, doc, getDoc, getDocs,
  addDoc, query, orderBy, limit,
  where, serverTimestamp, runTransaction,
} from 'firebase/firestore'
import { db } from './config'

// ─────────────────────────────────────────────────────────
//  TESTS
// ─────────────────────────────────────────────────────────

export async function fetchTests(category = null) {
  const q = category
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
//  - Every attempt saved to /results
//  - Progress counts UNIQUE tests only
//  - Average uses BEST score per test
//  - Country fields ALWAYS preserved on update
// ─────────────────────────────────────────────────────────

export async function saveResult(
  userId, userName, testDocId, testId,
  correct, total, band, partScores
) {
  // 1. Save attempt record
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
      tx.set(lbRef, {
        userId, userName,
        testsCompleted:  1,
        uniqueTestsDone: [testId],
        bestScores:      { [String(testId)]: correct },
        avgScore:        correct,
        avgBand:         band,
        bestBand:        band,
        bestScore:       correct,
        countryCode:     '',
        countryName:     '',
        countryFlag:     '🌍',
        lastPlayed:      serverTimestamp(),
      })
    } else {
      const d           = lbSnap.data()
      const uniqueDone  = d.uniqueTestsDone || []
      const bestScores  = d.bestScores      || {}
      const key         = String(testId)
      const alreadyDone = uniqueDone.includes(testId)
      const prevBest    = bestScores[key] || 0
      const newBest     = Math.max(prevBest, correct)

      const newBestScores = newBest > prevBest
        ? { ...bestScores, [key]: newBest }
        : bestScores

      const newCount      = alreadyDone ? d.testsCompleted : d.testsCompleted + 1
      const newUniqueDone = alreadyDone ? uniqueDone : [...uniqueDone, testId]

      const totalBest = Object.values(newBestScores).reduce((s, v) => s + v, 0)
      const newAvg    = parseFloat((totalBest / newUniqueDone.length).toFixed(1))

      tx.update(lbRef, {
        testsCompleted:  newCount,
        uniqueTestsDone: newUniqueDone,
        bestScores:      newBestScores,
        avgScore:        newAvg,
        avgBand:         calcBand(Math.round(newAvg)),
        bestBand:        parseFloat(band) > parseFloat(d.bestBand || '0') ? band : d.bestBand,
        bestScore:       Math.max(d.bestScore || 0, correct),
        lastPlayed:      serverTimestamp(),
        // ✅ Always carry country fields forward — never wipe them
        countryCode:     d.countryCode || '',
        countryName:     d.countryName || '',
        countryFlag:     d.countryFlag || '🌍',
      })
    }
  })
}

// ─────────────────────────────────────────────────────────
//  LEADERBOARD — top 10 global
//  Single orderBy — no composite index needed
// ─────────────────────────────────────────────────────────

export async function fetchLeaderboard() {
  const snap = await getDocs(
    query(collection(db, 'leaderboard'), orderBy('avgScore', 'desc'), limit(10))
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

// ─────────────────────────────────────────────────────────
//  COUNTRY LEADERBOARD — top 10 for a country
//  Fetches all docs for the country using only a single
//  where() clause (no composite index required), then
//  sorts and slices client-side.
// ─────────────────────────────────────────────────────────

export async function fetchCountryLeaderboard(countryCode) {
  if (!countryCode) return []

  // Single where() — no composite index needed
  const snap = await getDocs(
    query(
      collection(db, 'leaderboard'),
      where('countryCode', '==', countryCode)
    )
  )

  // Sort by avgScore descending and take top 10 client-side
  return snap.docs
    .map(d => d.data())
    .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
    .slice(0, 10)
    .map((d, i) => ({ rank: i + 1, ...d }))
}

// ─────────────────────────────────────────────────────────
//  USER RANK — global + country
//  Single full collection read, all counting done client-side.
//  No composite indexes required. Works for avgScore = 0.
// ─────────────────────────────────────────────────────────

export async function fetchUserRank(userId) {
  const userSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (!userSnap.exists()) return null

  const data    = userSnap.data()
  const userAvg = data.avgScore || 0

  // One read for everything — count ranks client-side
  const allSnap = await getDocs(collection(db, 'leaderboard'))
  const allDocs = allSnap.docs.map(d => d.data())

  const totalStudents = allDocs.length

  const globalRank = allDocs.filter(d => (d.avgScore || 0) > userAvg).length + 1

  let countryRank = null
  if (data.countryCode) {
    countryRank = allDocs.filter(
      d => d.countryCode === data.countryCode && (d.avgScore || 0) > userAvg
    ).length + 1
  }

  return {
    ...data,
    globalRank,
    countryRank,
    totalStudents,
  }
}

// ─────────────────────────────────────────────────────────
//  USER COMPLETED TESTS
// ─────────────────────────────────────────────────────────

export async function fetchUserCompletedTests(userId) {
  try {
    const lbSnap = await getDoc(doc(db, 'leaderboard', userId))
    if (lbSnap.exists() && lbSnap.data().uniqueTestsDone?.length) {
      return lbSnap.data().uniqueTestsDone
    }
  } catch (_) {}

  const snap = await getDocs(
    query(collection(db, 'results'), where('userId', '==', userId))
  )
  return [...new Set(snap.docs.map(d => d.data().testId))]
}

export const fetchUserResults = fetchUserCompletedTests

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
  if (correct >= 39) return '9.0'; if (correct >= 37) return '8.5'
  if (correct >= 35) return '8.0'; if (correct >= 33) return '7.5'
  if (correct >= 30) return '7.0'; if (correct >= 27) return '6.5'
  if (correct >= 23) return '6.0'; if (correct >= 20) return '5.5'
  if (correct >= 16) return '5.0'; return '4.5'
}
