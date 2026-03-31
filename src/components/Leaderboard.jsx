// src/components/Leaderboard.jsx
import React, { useEffect, useState } from 'react'
import { useAuth }  from '../context/AuthContext'
import {
  fetchLeaderboard,
  fetchCountryLeaderboard,
  fetchUserRank,
} from '../firebase/services'

const AV_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#d97706','#dc2626',
  '#059669','#be185d','#0ea5e9','#65a30d','#7c3aed',
]

// ── Single leaderboard row ─────────────────────────────────
function LbRow({ e, i, isMe, showCountry }) {
  const icon = e.rank === 1 ? '👑' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 9px', borderRadius: 8,
      background: isMe
        ? '#eff4ff'
        : e.rank === 1
          ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
          : '#f8fafc',
      border: `1px solid ${isMe ? '#93c5fd' : e.rank === 1 ? '#fde68a' : 'transparent'}`,
      transition: 'all .15s',
    }}>

      {/* Rank */}
      <span style={{
        fontSize: 11, fontWeight: 700, minWidth: 18, textAlign: 'center',
        color: e.rank === 1 ? '#d97706' : e.rank === 2 ? '#64748b' : e.rank === 3 ? '#92400e' : '#94a3b8',
      }}>
        {icon}
      </span>

      {/* Avatar */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: AV_COLORS[i % AV_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff',
      }}>
        {(e.userName || 'U').slice(0, 2).toUpperCase()}
      </div>

      {/* Name + optional country */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {e.countryFlag && showCountry && (
            <span style={{ fontSize: 13 }}>{e.countryFlag}</span>
          )}
          {e.userName}
          {isMe && <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 500 }}>(you)</span>}
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
          {e.avgBand || '—'}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>avg</div>
      </div>
    </div>
  )
}

// ── Skeleton loader ────────────────────────────────────────
function SkeletonRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 42, background: '#f1f5f9', borderRadius: 8,
          opacity: 1 - i * 0.15,
        }} />
      ))}
    </div>
  )
}

// ── Main Leaderboard component ─────────────────────────────
export default function Leaderboard() {
  const { user } = useAuth()

  const [view,         setView]         = useState('country') // 'country' | 'global'
  const [globalLb,     setGlobalLb]     = useState([])
  const [countryLb,    setCountryLb]    = useState([])
  const [userRankData, setUserRankData] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [userCountry,  setUserCountry]  = useState(null)  // { code, name, flag }

  async function load() {
    setLoading(true)
    try {
      const [global, ur] = await Promise.all([
        fetchLeaderboard(),
        user ? fetchUserRank(user.uid) : Promise.resolve(null),
      ])
      setGlobalLb(global)
      setUserRankData(ur)

      // If user has a country, load country leaderboard
      if (ur?.countryCode) {
        setUserCountry({ code: ur.countryCode, name: ur.countryName, flag: ur.countryFlag })
        const country = await fetchCountryLeaderboard(ur.countryCode)
        setCountryLb(country)
        setView('country')   // default to country view when logged in
      } else {
        setView('global')    // no country → show global
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [user])

  const isLoggedIn    = !!user
  const hasCountry    = !!userCountry
  const showCountryTab = isLoggedIn && hasCountry
  const entries        = view === 'country' ? countryLb : globalLb
  const userInTop      = user && entries.some(e => e.userId === user.uid)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(15,23,42,.07)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8' }}>
          🏆 {view === 'country' && userCountry ? `${userCountry.flag} ${userCountry.name}` : 'Global'} Ranking
        </span>
        <button
          onClick={load}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#2563eb', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          ↻
        </button>
      </div>

      {/* ── Tab switcher — only shown when user has country ── */}
      {showCountryTab && (
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 12 }}>
          {[
            { key: 'country', label: `${userCountry.flag} ${userCountry.name}` },
            { key: 'global',  label: '🌍 Global Top 10' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: 6,
                background: view === tab.key ? '#fff' : 'transparent',
                border: 'none', fontSize: 11.5, fontWeight: 600,
                color: view === tab.key ? '#0f172a' : '#64748b',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: view === tab.key ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                transition: 'all .16s', whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Entries ── */}
      {loading ? (
        <SkeletonRows />
      ) : entries.length === 0 ? (
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
          {view === 'country'
            ? `No rankings for ${userCountry?.name} yet — be first! 🎯`
            : 'No scores yet — complete a test to be first! 🎯'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {entries.map((e, i) => (
            <LbRow
              key={e.userId || i}
              e={e} i={i}
              isMe={user && e.userId === user.uid}
              showCountry={view === 'global'}
            />
          ))}

          {/* Show user's row if not in top 10 */}
          {isLoggedIn && !userInTop && userRankData && (
            <>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: '2px 0' }}>· · ·</div>
              <LbRow
                e={{
                  ...userRankData,
                  rank: view === 'country' ? userRankData.countryRank : userRankData.globalRank,
                }}
                i={9}
                isMe={true}
                showCountry={view === 'global'}
              />
            </>
          )}
        </div>
      )}

      {/* ── Motivational CTA button ── */}
      {isLoggedIn && hasCountry && view === 'country' && (
        <button
          onClick={() => setView('global')}
          style={{
            width: '100%', marginTop: 12, padding: '10px 14px',
            borderRadius: 8, border: '1.5px solid #bfdbfe',
            background: 'linear-gradient(135deg,#eff4ff,#f5f3ff)',
            cursor: 'pointer', transition: 'all .18s',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff4ff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = 'linear-gradient(135deg,#eff4ff,#f5f3ff)' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
            🌍 Check Your Global Ranking
          </div>
          {userRankData?.globalRank && (
            <div style={{ fontSize: 11, color: '#64748b' }}>
              You are currently ranked{' '}
              <strong style={{ color: '#7c3aed' }}>#{userRankData.globalRank}</strong>
              {' '}worldwide
            </div>
          )}
        </button>
      )}

      {/* Back to country button */}
      {isLoggedIn && hasCountry && view === 'global' && (
        <button
          onClick={() => setView('country')}
          style={{
            width: '100%', marginTop: 12, padding: '9px',
            borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: '#f8fafc', cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 12, fontWeight: 600, color: '#475569',
            transition: 'all .16s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          {userCountry?.flag} Back to {userCountry?.name} Rankings
        </button>
      )}

      {/* Footer note */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 9, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
        {view === 'country'
          ? `Top 10 in ${userCountry?.name || 'your country'} · Ranked by avg band`
          : 'Top 10 worldwide · Ranked by average band score'}
      </div>
    </div>
  )
}
