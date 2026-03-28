// scripts/seedFirestore.js
// Run this ONCE to populate your Firestore with all 100 tests.
// Usage: node scripts/seedFirestore.js
//
// Before running:
//   1. npm install firebase-admin
//   2. Download your service account key from Firebase Console →
//      Project Settings → Service Accounts → Generate new private key
//   3. Save it as scripts/serviceAccountKey.json

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }         from 'firebase-admin/firestore'
import { readFileSync }         from 'fs'

const serviceAccount = JSON.parse(readFileSync('./scripts/serviceAccountKey.json', 'utf8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ── Topic lists ──────────────────────────────────
const ACAD_TOPICS = [
  'University Enrolment Process','Academic Library Services','Campus Research Facilities',
  'Student Housing Application','Laboratory Safety Procedures','Lecture on Climate Change',
  'Museum Tour & Archaeology','Medical Research Discussion','Engineering Project Seminar',
  'Environmental Science Talk','Marine Biology Fieldwork','Psychology Study Methods',
  'History of Architecture','Philosophy Seminar Notes','Urban Planning Discussion',
  'Astrophysics Lecture','Literature Review Session','Sociology Research Methods',
  'Economics Policy Debate','Computer Science Seminar','Geology Field Study',
  'Linguistics Research Talk','Art History Presentation','Chemistry Lab Procedures',
  'Biology Cell Study',
]
const GEN_TOPICS = [
  'Local Community Centre','Job Application Process','Public Transport Routes',
  'Home Renovation Planning','Sports Club Registration','Telephone Banking Service',
  'Holiday Travel Booking','Supermarket Loyalty Scheme','Health Clinic Appointment',
  'Local Council Services','Car Insurance Enquiry','Restaurant Reservation System',
  'Gym Membership Options','Library Book Return Policy','Rental Property Viewing',
  'Customer Complaints Process','Workplace Safety Briefing','Shopping Mall Information',
  'Post Office Services','Emergency Services Guide','Hotel Accommodation Booking',
  'Language School Enrolment','Driving Licence Renewal','Dental Clinic Appointment',
  'Pharmacy Services Guide',
]
const DIFFS = ['Intermediate','Intermediate','Upper-Intermediate','Upper-Intermediate','Advanced']

const MCQ_OPTIONS = [
  'A — A key fact mentioned at the start of the recording',
  'B — Information provided by the second participant',
  'C — A detail stated clearly near the end',
  'D — An implied suggestion based on context',
]

async function seed() {
  console.log('🌱 Starting Firestore seed...\n')
  const batch = []

  for (let i = 1; i <= 100; i++) {
    const isAcad = i <= 50
    const topic  = isAcad ? ACAD_TOPICS[(i - 1) % 25] : GEN_TOPICS[(i - 1) % 25]

    // Create test document
    const testRef = db.collection('tests').doc(`test-${i}`)
    batch.push(testRef.set({
      id:         i,
      title:      `IELTS Listening Test ${i}`,
      category:   isAcad ? 'academic' : 'general',
      topic,
      difficulty: DIFFS[(i - 1) % DIFFS.length],
      duration:   30,
      questions:  40,
      isFree:     i === 1,
      createdAt:  new Date(),
    }))

    // Create 4 sections per test
    for (let s = 1; s <= 4; s++) {
      const secRef = testRef.collection('sections').doc(`sec-${s}`)
      // IMPORTANT: Replace this URL with your real Firebase Storage bucket name
      const audioUrl = `https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET.appspot.com/o/ielts-audio%2Ftest-${i}-sec-${s}.mp3?alt=media`

      batch.push(secRef.set({
        sectionNo: s,
        title:     `Section ${s}`,
        audioUrl,
      }))

      // Create 10 questions per section
      for (let q = 1; q <= 10; q++) {
        const qNo    = (s - 1) * 10 + q
        const isMCQ  = qNo % 5 !== 0
        const qRef   = secRef.collection('questions').doc(`q-${qNo}`)

        batch.push(qRef.set({
          questionNo: qNo,
          type:       isMCQ ? 'mcq' : 'fill',
          text:       isMCQ
            ? `What does the ${['speaker','lecturer','presenter','interviewer'][s-1]} state about point ${qNo}?`
            : `Complete the sentence: The __________ is the most important factor mentioned. (Q${qNo})`,
          options: isMCQ ? MCQ_OPTIONS : null,
          answer:  isMCQ ? String(qNo % 4) : 'key factor',
        }))
      }
    }

    if (i % 10 === 0) console.log(`  ✓ Prepared test ${i}/100`)
  }

  // Execute all writes
  console.log('\n⏳ Writing to Firestore...')
  await Promise.all(batch)
  console.log('\n✅ Seed complete! 100 tests created in Firestore.')
  console.log('   Remember to update audioUrl values with your real Firebase Storage URLs.')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
