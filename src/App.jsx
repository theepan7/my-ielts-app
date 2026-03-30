import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import HomePage      from './pages/HomePage'
import TestPage      from './pages/TestPage'
import ResultPage    from './pages/ResultPage'
import AuthModal     from './components/AuthModal'
import ContactModal  from './components/ContactModal'
import Toast         from './components/Toast'
import { useState }  from 'react'

export default function App() {
  const [authModal,    setAuthModal]   = useState(null)
  const [contactOpen,  setContactOpen] = useState(false)
  const [toast,        setToast]       = useState(null)

  const location   = useLocation()
  const isTestPage = location.pathname.startsWith('/test/')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    /*
      On the test page we must NOT constrain <main> to a flex-child height.
      flex-1 inside a flex-col parent gives <main> a fixed height and makes it
      the scroll container — that breaks position:sticky inside TestPage because
      sticky positions relative to its nearest scrollable ancestor (the <main>),
      not the viewport.  Switching to a plain block element on the test route
      lets the page scroll naturally so the TestPage sticky header works.
    */
    <div className={isTestPage ? '' : 'min-h-screen flex flex-col'}>
      <Navbar
        onAuthClick={setAuthModal}
        onContactClick={() => setContactOpen(true)}
      />

      <main className={isTestPage ? 'block' : 'flex-1'}>
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

      {/* Footer is already hidden by TestPage's own useEffect while a test is open */}
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
