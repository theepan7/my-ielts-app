// src/components/AudioPlayer.jsx
import React, { useState, useRef, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, partTitle }) {
  const audioRef              = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDur]    = useState(0)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDur(0)
    setError(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
    }
  }, [audioUrl])

  function togglePlay() {
    if (!audioRef.current || error) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => setError(true))
    }
    setPlaying(p => !p)
  }

  function skip(sec) {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) + sec)
  }

  function seek(e) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  function fmt(t) {
    if (!t || isNaN(t)) return '0:00'
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`
  }

  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1e40af,#1d4ed8)',
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(255,255,255,.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>🔊</div>

      <div style={{ flex: 1 }}>
        {partTitle && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 5 }}>
            {partTitle}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Skip back */}
          <button onClick={() => skip(-10)} title="-10s" style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>↺</button>

          {/* Play / Pause */}
          <button onClick={togglePlay} disabled={error} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', border: 'none',
            color: '#1d4ed8', fontWeight: 700, fontSize: 13,
            cursor: error ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: error ? .4 : 1, flexShrink: 0,
          }}>
            {playing ? '⏸' : '▶'}
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} title="+10s" style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>↻</button>

          {/* Progress bar */}
          <div onClick={seek} style={{
            flex: 1, height: 5, background: 'rgba(255,255,255,.25)',
            borderRadius: 3, cursor: 'pointer',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: '#fff', borderRadius: 3,
              transition: 'width .3s',
            }} />
          </div>

          {/* Time */}
          <span style={{
            color: 'rgba(255,255,255,.8)', fontSize: 11,
            fontFamily: 'monospace', minWidth: 80, textAlign: 'right', flexShrink: 0,
          }}>
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>

        {error && (
          <p style={{ color: '#fca5a5', fontSize: 10.5, marginTop: 4 }}>
            ⚠ Audio file not found — check Firebase Storage URL
          </p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDur(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); setPlaying(false) }}
      />
    </div>
  )
}
