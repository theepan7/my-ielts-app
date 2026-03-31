// src/App.jsx
import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar           from './components/Navbar'
import Footer           from './components/Footer'
import HomePage         from './pages/HomePage'
import TestPage         from './pages/TestPage'
import ResultPage       from './pages/ResultPage'
import BandScorePage    from './pages/BandScorePage'
import ListeningTipsPage from './pages/ListeningTipsPage'
import StudyPlansPage   from './pages/StudyPlansPage'
import FAQPage          from './pages/FAQPage'
import AboutPage        from './pages/AboutPage'
import AuthModal        from './components/AuthModal'
import ContactModal     from './components/ContactModal'
import Toast            from './components/Toast'

export default function App() {
  const [authModal,   setAuthModal]   = useState(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [toast,       setToast]       = useState(null)

  const location   = useLocation()
  const isTestPage = location.pathname.startsWith('/test/')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div style={{
      minHeight: isTestPage ? 'auto' : '100vh',
      display: 'flex', flexDirection: 'column',
    }}>
      <Navbar
        onAuthClick={setAuthModal}
        onContactClick={() => setContactOpen(true)}
      />

      <main style={{ flex: isTestPage ? 'none' : 1 }}>
        <Routes>
          {/* Main pages */}
          <Route path="/"
            element={<HomePage onAuthClick={setAuthModal} showToast={showToast} />}
          />
          <Route path="/test/:testId"
            element={<TestPage onAuthClick={setAuthModal} showToast={showToast} />}
          />
          <Route path="/result"
            element={<ResultPage showToast={showToast} />}
          />

          {/* Resource pages */}
          <Route path="/band-score-guide"  element={<BandScorePage />} />
          <Route path="/listening-tips"    element={<ListeningTipsPage />} />
          <Route path="/study-plans"       element={<StudyPlansPage />} />
          <Route path="/faq"               element={<FAQPage />} />
          <Route path="/about"             element={<AboutPage />} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer hidden on test page */}
      {!isTestPage && (
        <Footer onContactClick={() => setContactOpen(true)} />
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={setAuthModal}
          showToast={showToast}
        />
      )}
      {contactOpen && (
        <ContactModal
          onClose={() => setContactOpen(false)}
          showToast={showToast}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontFamily: 'Lora,serif', fontSize: '1.8rem', fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
        Page Not Found
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>
        The page you are looking for does not exist.
      </p>
      <a href="/" style={{
        display: 'inline-block', padding: '10px 24px', borderRadius: 8,
        background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
      }}>
        ← Back to Tests
      </a>
    </div>
  )
}
