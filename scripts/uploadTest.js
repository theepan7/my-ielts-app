// scripts/uploadTest.js
// Uploads one or all test JSON files to Firestore.
//
// USAGE:
//   node scripts/uploadTest.js tests/test-1.json        ← upload one test
//   node scripts/uploadTest.js tests/                   ← upload all tests in folder
//
// SETUP:
//   1. npm install firebase-admin
//   2. Download service account key from Firebase Console →
//      Project Settings → Service Accounts → Generate new private key
//   3. Save as scripts/serviceAccountKey.json

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }         from 'firebase-admin/firestore'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Init Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
)
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ─────────────────────────────────────────────────────────
//  UPLOAD ONE TEST
// ─────────────────────────────────────────────────────────
async function uploadTest(testData) {
  const testDocId = `test-${testData.id}`
  const testRef   = db.collection('tests').doc(testDocId)

  console.log(`\n📤 Uploading ${testDocId} — "${testData.topic}"`)

  // 1. Write test metadata (no parts/sections yet)
  await testRef.set({
    id:             testData.id,
    title:          testData.title,
    category:       testData.category,        // 'academic' | 'general'
    topic:          testData.topic,
    difficulty:     testData.difficulty,      // 'Intermediate' | 'Upper-Intermediate' | 'Advanced'
    duration:       testData.duration || 30,
    totalQuestions: testData.totalQuestions || 40,
    isFree:         testData.isFree || false,
    createdAt:      new Date(),
  })

  // 2. Write each part
  for (const part of testData.parts || []) {
    const partRef = testRef.collection('parts').doc(`part-${part.partNo}`)

    await partRef.set({
      partNo:   part.partNo,
      title:    part.title || `Part ${part.partNo}`,
      audioUrl: part.audioUrl || '',
    })

    console.log(`   ✓ Part ${part.partNo} (${(part.sections || []).length} sections)`)

    // 3. Write each section with its questions embedded
    for (let si = 0; si < (part.sections || []).length; si++) {
      const section    = part.sections[si]
      const sectionRef = partRef.collection('sections').doc(`section-${si + 1}`)

      await sectionRef.set({
        order:       si + 1,
        heading:     section.heading     || '',
        instruction: section.instruction || '',
        type:        section.type,
        // Embed all question data directly in the section document
        ...(section.type === 'form'     && { fields:    section.fields    }),
        ...(section.type === 'table'    && { caption:   section.caption,
                                             rows:      section.rows      }),
        ...(section.type === 'mcq'     && { questions: section.questions  }),
        ...(section.type === 'fill'    && { questions: section.questions  }),
        ...(section.type === 'notes'   && { title:     section.title,
                                             lines:     section.lines     }),
        ...(section.type === 'map'     && { imageUrl:  section.imageUrl,
                                             imageAlt:  section.imageAlt,
                                             questions: section.questions  }),
        ...(section.type === 'matching'&& { items:     section.items,
                                             options:   section.options    }),
      })
    }
  }

  console.log(`   ✅ ${testDocId} complete`)
}

// ─────────────────────────────────────────────────────────
//  MAIN — read path argument
// ─────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('❌  Usage: node scripts/uploadTest.js <file.json or folder/>')
    process.exit(1)
  }

  const stat = statSync(arg)

  if (stat.isDirectory()) {
    // Upload all JSON files in the folder
    const files = readdirSync(arg).filter(f => extname(f) === '.json')
    console.log(`📁 Found ${files.length} test files in ${arg}`)
    for (const file of files) {
      const data = JSON.parse(readFileSync(join(arg, file), 'utf8'))
      await uploadTest(data)
    }
  } else {
    // Upload single file
    const data = JSON.parse(readFileSync(arg, 'utf8'))
    await uploadTest(data)
  }

  console.log('\n🎉 All uploads complete!')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Upload failed:', err.message)
  process.exit(1)
})
