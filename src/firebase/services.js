// src/firebase/services.js
import {
  collection, doc, getDoc, getDocs, addDoc,
  query, orderBy, limit, where,
  serverTimestamp, runTransaction, setDoc
} from 'firebase/firestore'
import { db } from './config'

// ─────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────
export const MIN_ANSWERS_FOR_BAND = 11

// ─────────────────────────────────────────────────────────
//  BAND HELPER
//  Returns null if correct < MIN_ANSWERS_FOR_BAND
// ─────────────────────────────────────────────────────────
export function calcBand(correct) {
  if (correct < MIN_ANSWERS_FOR_BAND) return null
  if (correct >= 39) return '9.0'; if (correct >= 37) return '8.5'
  if (correct >= 35) return '8.0'; if (correct >= 33) return '7.5'
  if (correct >= 30) return '7.0'; if (correct >= 27) return '6.5'
  if (correct >= 23) return '6.0'; if (correct >= 20) return '5.5'
  if (correct >= 16) return '5.0'; return '4.5'
}

// Format seconds → "mm:ss" for display
export function fmtTime(seconds) {
  if (!seconds || isNaN(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

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
//
//  Firestore structure:
//  /results/{auto}                    ← every attempt (for review history)
//  /testLeaderboard/{testId}/entries/{userId}  ← best score per user per test
//  /leaderboard/{userId}              ← overall user progress (unchanged)
//
//  Per-test leaderboard tiebreaker:
//    Primary sort:   correct DESC  (more correct = better)
//    Tiebreaker:     elapsed ASC   (faster = better when score is equal)
// ─────────────────────────────────────────────────────────

export async function saveResult(
  userId, userName, testDocId, testId,
  correct, total, band, partScores, elapsed = 0
) {
  const qualifies = correct >= MIN_ANSWERS_FOR_BAND

  // 1. Always save the attempt record
  await addDoc(collection(db, 'results'), {
    userId, userName, testDocId, testId,
    correct, total,
    band:        qualifies ? band : null,
    elapsed:     elapsed,
    percentage:  Math.round((correct / total) * 100),
    partScores,
    qualifiesForLeaderboard: qualifies,
    completedAt: serverTimestamp(),
  })

  if (!qualifies) return

  // 2. Update per-test leaderboard entry for this user
  //    Only keeps their BEST score — if tied on score, keeps FASTEST time
  const testLbRef = doc(db, 'testLeaderboard', String(testId), 'entries', userId)

  await runTransaction(db, async tx => {
    const existing = await tx.get(testLbRef)

    if (!existing.exists()) {
      // First attempt on this test
      tx.set(testLbRef, {
        userId,
        userName,
        testId,
        correct,
        total,
        band,
        elapsed,
        completedAt: serverTimestamp(),
      })
    } else {
      const d = existing.data()
      const prevCorrect = d.correct || 0
      const prevElapsed = d.elapsed || 9999

      // Update if: higher score OR same score but faster time
      const betterScore = correct > prevCorrect
      const sameScoreFaster = correct === prevCorrect && elapsed < prevElapsed

      if (betterScore || sameScoreFaster) {
        tx.update(testLbRef, {
          correct,
          band,
          elapsed,
          completedAt: serverTimestamp(),
        })
      }
    }
  })

  // 3. Update overall user leaderboard (progress tracking — unchanged)
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
      const totalBest     = Object.values(newBestScores).reduce((s, v) => s + v, 0)
      const newAvg        = parseFloat((totalBest / newUniqueDone.length).toFixed(1))

      tx.update(lbRef, {
        testsCompleted:  newCount,
        uniqueTestsDone: newUniqueDone,
        bestScores:      newBestScores,
        avgScore:        newAvg,
        avgBand:         calcBand(Math.round(newAvg)),
        bestBand:        parseFloat(band) > parseFloat(d.bestBand || '0') ? band : d.bestBand,
        bestScore:       Math.max(d.bestScore || 0, correct),
        lastPlayed:      serverTimestamp(),
      })
    }
  })
}

// ─────────────────────────────────────────────────────────
//  PER-TEST LEADERBOARD
//  Returns top 10 for a specific test
//  Sorted: correct DESC, then elapsed ASC (faster wins ties)
// ─────────────────────────────────────────────────────────

export async function fetchTestLeaderboard(testId) {
  const snap = await getDocs(
    query(
      collection(db, 'testLeaderboard', String(testId), 'entries'),
      orderBy('correct', 'desc'),
      orderBy('elapsed', 'asc'),
      limit(10)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

// Get a specific user's entry for a test (for showing their rank)
export async function fetchUserTestEntry(testId, userId) {
  const snap = await getDoc(
    doc(db, 'testLeaderboard', String(testId), 'entries', userId)
  )
  if (!snap.exists()) return null

  // Count how many entries have better rank (higher correct, or same correct faster)
  const entry     = snap.data()
  const higherSnap = await getDocs(
    query(
      collection(db, 'testLeaderboard', String(testId), 'entries'),
      where('correct', '>', entry.correct)
    )
  )
  const sameScoreFasterSnap = await getDocs(
    query(
      collection(db, 'testLeaderboard', String(testId), 'entries'),
      where('correct',  '==', entry.correct),
      where('elapsed',  '<',  entry.elapsed)
    )
  )

  const rank = higherSnap.size + sameScoreFasterSnap.size + 1
  return { rank, ...entry }
}

// ─────────────────────────────────────────────────────────
//  OVERALL USER PROGRESS LEADERBOARD (unchanged)
// ─────────────────────────────────────────────────────────

export async function fetchLeaderboard() {
  const snap = await getDocs(
    query(
      collection(db, 'leaderboard'),
      where('seed', '!=', true),
      orderBy('seed'),
      orderBy('avgScore', 'desc'),
      limit(10)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

export async function fetchCountryLeaderboard(countryCode) {
  if (!countryCode) return []
  const snap = await getDocs(
    query(
      collection(db, 'leaderboard'),
      where('countryCode', '==', countryCode),
      where('seed', '!=', true),
      orderBy('seed'),
      orderBy('avgScore', 'desc'),
      limit(10)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

export async function fetchUserRank(userId) {
  const userSnap = await getDoc(doc(db, 'leaderboard', userId))
  if (!userSnap.exists()) return null
  const data    = userSnap.data()
  const userAvg = data.avgScore || 0

  const [globalHigher, countryHigher, totalSnap] = await Promise.all([
    getDocs(query(collection(db, 'leaderboard'), where('avgScore', '>', userAvg))),
    data.countryCode
      ? getDocs(query(
          collection(db, 'leaderboard'),
          where('countryCode', '==', data.countryCode),
          where('avgScore',    '>',  userAvg)
        ))
      : Promise.resolve({ size: 0 }),
    getDocs(collection(db, 'leaderboard')),
  ])

  return {
    ...data,
    globalRank:    globalHigher.size + 1,
    countryRank:   countryHigher.size + 1,
    totalStudents: totalSnap.size,
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
