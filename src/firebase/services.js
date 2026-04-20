// src/firebase/services.js
import {
  collection, doc, getDoc, getDocs, addDoc,
  query, orderBy, limit, where,
  serverTimestamp, runTransaction
} from 'firebase/firestore'
import { db } from './config'

// ─────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────
export const MIN_ANSWERS_FOR_BAND = 11

export function calcBand(correct) {
  if (correct < MIN_ANSWERS_FOR_BAND) return null
  if (correct >= 39) return '9.0'; if (correct >= 37) return '8.5'
  if (correct >= 35) return '8.0'; if (correct >= 33) return '7.5'
  if (correct >= 30) return '7.0'; if (correct >= 27) return '6.5'
  if (correct >= 23) return '6.0'; if (correct >= 20) return '5.5'
  if (correct >= 16) return '5.0'; return '4.5'
}

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
//  FIX 1: testId is always stored as a NUMBER for consistency
//  FIX 2: country is read from the existing leaderboard doc
//         so it is never overwritten with empty strings
//  FIX 3: userName falls back to email prefix if displayName is null
// ─────────────────────────────────────────────────────────

export async function saveResult(
  userId,
  userDisplayName,   // may be null for some OAuth users
  userEmail,         // always available — used as fallback
  testDocId,
  testId,            // stored as number always
  correct,
  total,
  band,
  partScores,
  elapsed = 0
) {
  const qualifies = correct >= MIN_ANSWERS_FOR_BAND

  // Resolve a clean userName — never store null/undefined
  const userName = (
    userDisplayName?.trim() ||
    userEmail?.split('@')[0] ||
    'Student'
  )

  // Normalise testId to number
  const numericTestId = typeof testId === 'number' ? testId : parseInt(testId, 10) || 0

  // 1. Always save the attempt record
  await addDoc(collection(db, 'results'), {
    userId,
    userName,
    testDocId,
    testId:      numericTestId,
    correct,
    total,
    band:        qualifies ? band : null,
    elapsed,
    percentage:  Math.round((correct / total) * 100),
    partScores,
    qualifiesForLeaderboard: qualifies,
    completedAt: serverTimestamp(),
  })

  if (!qualifies) return

  // ── 2. Per-test leaderboard ────────────────────────────
  // Path: /testLeaderboard/{testId}/entries/{userId}
  // FIX: always use String(numericTestId) as the doc key
  const testLbRef = doc(
    db, 'testLeaderboard', String(numericTestId), 'entries', userId
  )

  await runTransaction(db, async tx => {
    const existing = await tx.get(testLbRef)
    if (!existing.exists()) {
      tx.set(testLbRef, {
        userId,
        userName,
        testId:  numericTestId,
        correct,
        total,
        band,
        elapsed,
        completedAt: serverTimestamp(),
      })
    } else {
      const d = existing.data()
      const betterScore     = correct > (d.correct || 0)
      const sameScoreFaster = correct === d.correct && elapsed < (d.elapsed || 9999)
      if (betterScore || sameScoreFaster) {
        // Also update userName in case they changed their display name
        tx.update(testLbRef, {
          userName,
          correct,
          band,
          elapsed,
          completedAt: serverTimestamp(),
        })
      }
    }
  })

  // ── 3. Overall leaderboard ─────────────────────────────
  // FIX: read existing doc first to preserve country fields
  const lbRef = doc(db, 'leaderboard', userId)

  await runTransaction(db, async tx => {
    const lbSnap = await tx.get(lbRef)

    if (!lbSnap.exists()) {
      // Brand new user in leaderboard — country will be empty here
      // but AuthContext.signup() already set it — this case only happens
      // if saveResult is called before the leaderboard doc exists (race).
      // We write minimal data; next login/action will fill country.
      tx.set(lbRef, {
        userId,
        userName,
        testsCompleted:  1,
        uniqueTestsDone: [numericTestId],
        bestScores:      { [String(numericTestId)]: correct },
        avgScore:        correct,
        avgBand:         band,
        bestBand:        band,
        bestScore:       correct,
        // country stays empty — already set by AuthContext signup
        countryCode:     '',
        countryName:     '',
        countryFlag:     '🌍',
        seed:            false,    // real user — never seed
        lastPlayed:      serverTimestamp(),
      })
    } else {
      // EXISTING user doc — read current data and update correctly
      const d           = lbSnap.data()
      const uniqueDone  = d.uniqueTestsDone || []
      const bestScores  = d.bestScores      || {}
      const key         = String(numericTestId)
      const alreadyDone = uniqueDone.includes(numericTestId)
      const prevBest    = bestScores[key] || 0
      const newBest     = Math.max(prevBest, correct)

      const newBestScores = newBest > prevBest
        ? { ...bestScores, [key]: newBest }
        : bestScores

      const newCount      = alreadyDone ? d.testsCompleted : (d.testsCompleted || 0) + 1
      const newUniqueDone = alreadyDone ? uniqueDone : [...uniqueDone, numericTestId]
      const totalBest     = Object.values(newBestScores).reduce((s, v) => s + v, 0)
      const newAvg        = parseFloat((totalBest / newUniqueDone.length).toFixed(1))
      const newAvgBand    = calcBand(Math.round(newAvg))
      const prevBestBand  = parseFloat(d.bestBand || '0')
      const currBandNum   = parseFloat(band || '0')

      tx.update(lbRef, {
        userName,             // keep display name in sync
        testsCompleted:  newCount,
        uniqueTestsDone: newUniqueDone,
        bestScores:      newBestScores,
        avgScore:        newAvg,
        avgBand:         newAvgBand,
        bestBand:        currBandNum > prevBestBand ? band : d.bestBand,
        bestScore:       Math.max(d.bestScore || 0, correct),
        seed:            false,   // ensure real users never have seed=true
        lastPlayed:      serverTimestamp(),
        // country fields are NOT touched here — they were set at signup
        // and should never be overwritten by a test result
      })
    }
  })
}

// ─────────────────────────────────────────────────────────
//  PER-TEST LEADERBOARD
// ─────────────────────────────────────────────────────────

export async function fetchTestLeaderboard(testId, count = 10) {
  const numId = typeof testId === 'number' ? testId : parseInt(testId, 10) || 0
  const snap = await getDocs(
    query(
      collection(db, 'testLeaderboard', String(numId), 'entries'),
      orderBy('correct', 'desc'),
      orderBy('elapsed', 'asc'),
      limit(count)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

export async function fetchUserTestEntry(testId, userId) {
  const numId = typeof testId === 'number' ? testId : parseInt(testId, 10) || 0
  const snap = await getDoc(
    doc(db, 'testLeaderboard', String(numId), 'entries', userId)
  )
  if (!snap.exists()) return null
  const entry = snap.data()

  const [higherSnap, fasterSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'testLeaderboard', String(numId), 'entries'),
      where('correct', '>', entry.correct)
    )),
    getDocs(query(
      collection(db, 'testLeaderboard', String(numId), 'entries'),
      where('correct', '==', entry.correct),
      where('elapsed', '<',  entry.elapsed)
    )),
  ])

  return { rank: higherSnap.size + fasterSnap.size + 1, ...entry }
}

// ─────────────────────────────────────────────────────────
//  HOME LEADERBOARD  — top 5 real users by avg score
// ─────────────────────────────────────────────────────────
export async function fetchHomeLeaderboard() {
  const snap = await getDocs(
    query(
      collection(db, 'leaderboard'),
      where('testsCompleted', '>', 0),
      orderBy('testsCompleted', 'desc'),
      limit(5)
    )
  )
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }))
}

// ─────────────────────────────────────────────────────────
//  USER OVERALL RANK
// ─────────────────────────────────────────────────────────

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
          where('avgScore', '>', userAvg)
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
