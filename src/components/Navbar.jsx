import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar({ onAuthClick, onContactClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState('home')

  function handleNav(which) {
    setActive(which)
    if (which === 'contact') { onContactClick(); return }
    if (which === 'home')     { navigate('/');             return }
    if (which === 'academic') { navigate('/?cat=academic'); return }
    if (which === 'general')  { navigate('/?cat=general');  return }
  }

  const navLinks = [
    { id: 'home',     label: 'Home',     icon: '🏠' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'general',  label: 'General',  icon: '📺' },
    { id: 'contact',  label: 'Contact',  icon: '✉️'  },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm flex-shrink-0">
            🎧
          </div>
          <span className="font-serif font-semibold text-slate-900 text-[1.05rem] tracking-tight hidden sm:block">
            IELTS Listening Pro
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 border border-transparent
                ${active === link.id && link.id !== 'contact'
                  ? link.id === 'academic'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : link.id === 'general'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
            >
              <span className="text-xs">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-600 font-medium">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                  {(user.displayName || user.email).slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block">{(user.displayName || user.email).split(' ')[0]}</span>
              </div>
              <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onAuthClick('login')} className="btn-ghost text-xs px-3 py-1.5">
                Sign In
              </button>
              <button onClick={() => onAuthClick('signup')} className="btn-primary text-xs px-3 py-1.5">
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
