import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'
import AuthModal from './components/AuthModal'
import ContactModal from './components/ContactModal'
import Toast from './components/Toast'
import { useState } from 'react'

export default function App() {
  const [authModal, setAuthModal]       = useState(null)   // 'login' | 'signup' | null
  const [contactOpen, setContactOpen]   = useState(false)
  const [toast, setToast]               = useState(null)   // { msg, type }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onAuthClick={setAuthModal}
        onContactClick={() => setContactOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onAuthClick={setAuthModal}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/test/:testId"
            element={
              <TestPage
                onAuthClick={setAuthModal}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/result"
            element={<ResultPage showToast={showToast} />}
          />
        </Routes>
      </main>

      <Footer onContactClick={() => setContactOpen(true)} />

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
