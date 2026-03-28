import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTests, fetchUserResults } from '../firebase/services'
import TestCard from '../components/TestCard'
import Leaderboard from '../components/Leaderboard'
import UserProgress from '../components/UserProgress'

// ── Fallback mock tests (used until real Firestore data is seeded) ──
const ACAD_TOPICS = [
  'University Enrolment','Academic Library Services','Campus Research Facilities',
  'Student Housing Application','Lab Safety Procedures','Climate Change Lecture',
  'Museum Tour & Archaeology','Medical Research Talk','Engineering Seminar',
  'Environmental Science','Marine Biology Fieldwork','Psychology Methods',
  'History of Architecture','Philosophy Seminar','Urban Planning Discussion',
  'Astrophysics Lecture','Literature Review','Sociology Research',
  'Economics Policy Debate','Computer Science Talk','Geology Field Study',
  'Linguistics Research','Art History Lecture','Chemistry Lab Work','Biology Cell Study'
]
const GEN_TOPICS = [
  'Local Community Centre','Job Application Process','Public Transport Routes',
  'Home Renovation Planning','Sports Club Registration','Telephone Banking',
  'Holiday Travel Booking','Supermarket Loyalty Scheme','Health Clinic Appointment',
  'Local Council Services','Car Insurance Enquiry','Restaurant Reservation',
  'Gym Membership Options','Library Book Return','Rental Property Viewing',
  'Customer Complaints','Workplace Safety Talk','Shopping Mall Info',
  'Post Office Services','Emergency Services','Hotel Booking','Language School',
  'Driving Licence Renewal','Dental Appointment','Pharmacy Services'
]
const DIFFS = ['Intermediate','Intermediate','Upper-Intermediate','Upper-Intermediate','Advanced']

function buildMockTests() {
  return Array.from({ length: 100 }, (_, i) => {
    const id = i + 1
    const isA = id <= 50
    return {
      id,
      docId: `test-${id}`,
      title: `IELTS Listening Test ${id}`,
      category: isA ? 'academic' : 'general',
      topic: isA ? ACAD_TOPICS[(id - 1) % 25] : GEN_TOPICS[(id - 1) % 25],
      duration: 30,
      questions: 40,
      difficulty: DIFFS[i % DIFFS.length],
      isFree: id === 1,
    }
  })
}

const PER_PAGE = 12

export default function HomePage({ onAuthClick, showToast }) {
  const { user }          = useAuth()
  const navigate          = useNavigate()
  const [params]          = useSearchParams()
  const initCat           = params.get('cat') || 'all'

  const [allTests,   setAllTests]   = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [completed,  setCompleted]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [cat,        setCat]        = useState(initCat)
  const [search,     setSearch]     = useState('')
  const [diff,       setDiff]       = useState('')
  const [status,     setStatus]     = useState('')
  const [page,       setPage]       = useState(1)

  // Load tests from Firestore (falls back to mock if empty)
  useEffect(() => {
    fetchTests()
      .then(data => {
        const tests = data.length > 0 ? data : buildMockTests()
        setAllTests(tests)
        setFiltered(tests)
      })
      .catch(() => {
        const mock = buildMockTests()
        setAllTests(mock)
        setFiltered(mock)
      })
      .finally(() => setLoading(false))
  }, [])

  // Load completed tests for logged-in user
  useEffect(() => {
    if (user) {
      fetchUserResults(user.uid).then(setCompleted).catch(() => {})
    } else {
      const local = JSON.parse(localStorage.getItem('ielts_guest_done') || '[]')
      setCompleted(local)
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    let list = [...allTests]
    if (cat !== 'all')  list = list.filter(t => t.category === cat)
    if (search)         list = list.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.topic.toLowerCase().includes(search.toLowerCase())
    )
    if (diff)   list = list.filter(t => t.difficulty === diff)
    if (status === 'free')      list = list.filter(t => t.isFree)
    if (status === 'completed') list = list.filter(t => completed.includes(t.id))
    setFiltered(list)
    setPage(1)
  }, [cat, search, diff, status, allTests, completed])

  // Sync cat from URL param
  useEffect(() => {
    const c = params.get('cat') || 'all'
    setCat(c)
  }, [params])

  function handleTestClick(test) {
    if (!test.isFree && !user) {
      showToast('Sign up free to unlock all 100 tests', 'error')
      onAuthClick('signup')
      return
    }
    navigate(`/test/${test.docId || test.id}`)
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const catCounts = {
    all:      allTests.length,
    academic: allTests.filter(t => t.category === 'academic').length,
    general:  allTests.filter(t => t.category === 'general').length,
  }

  const catLabel = cat === 'all' ? 'All Tests'
    : cat === 'academic' ? 'Academic Tests' : 'General Training Tests'

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-violet-700 py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_60%,rgba(255,255,255,.06),transparent_55%)]" />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/85 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            ✦ 100 Full-Length Practice Tests
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white mb-2 tracking-tight">
            Master IELTS Listening
          </h1>
          <p className="text-blue-200 text-sm mb-6">Authentic recordings · Real exam questions · Instant band score results</p>
          <div className="flex justify-center gap-8 flex-wrap">
            {[['100', 'Tests Available'], ['4,000+', 'Questions'], ['50K+', 'Students'], ['9.0', 'Max Band']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-serif text-2xl font-bold text-white">{n}</div>
                <div className="text-[11px] text-blue-300 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-7 grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 items-start">
        <div>
          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { id: 'all',      label: 'All Tests',         icon: '📋' },
              { id: 'academic', label: 'Academic',          icon: '📚' },
              { id: 'general',  label: 'General Training',  icon: '📺' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold border-[1.5px] transition-all
                  ${cat === c.id
                    ? c.id === 'academic'
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : c.id === 'general'
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <span>{c.icon}</span>
                {c.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${cat === c.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {catCounts[c.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            <input
              className="input flex-1 min-w-[160px] text-sm"
              placeholder="🔍  Search by topic or test name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="input w-auto text-sm" value={diff} onChange={e => setDiff(e.target.value)}>
              <option value="">All Difficulties</option>
              <option>Intermediate</option>
              <option>Upper-Intermediate</option>
              <option>Advanced</option>
            </select>
            <select className="input w-auto text-sm" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="free">Free Only</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {catLabel} — {filtered.length} available
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No tests match your search.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
              {slice.map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  isCompleted={completed.includes(test.id)}
                  onClick={Object.assign(handleTestClick, { isLoggedIn: !!user })}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 flex-wrap mt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="pbn disabled:opacity-30 w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 transition-all disabled:cursor-not-allowed"
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '…'
                    ? <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                    : <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg border text-sm font-semibold transition-all ${
                          page === n
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >{n}</button>
                )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >›</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <Leaderboard />
          <UserProgress completedIds={completed} onAuthClick={onAuthClick} />
        </aside>
      </div>
    </div>
  )
}
