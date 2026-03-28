// src/components/AudioPlayer.jsx
import { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, partTitle }) {
  const audioRef              = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDur]    = useState(0)
  const [error, setError]     = useState(false)

  // Reset when URL changes
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
    const bar  = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  function fmt(t) {
    if (!t || isNaN(t)) return '0:00'
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`
  }

  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl px-5 py-3.5 mb-4 shadow-md">
      <div className="flex items-center gap-3">

        {/* Icon */}
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white text-base flex-shrink-0">
          🔊
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold mb-2 opacity-90">
            {partTitle} — Audio
          </p>

          <div className="flex items-center gap-2">
            {/* Skip back */}
            <button
              onClick={() => skip(-10)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xs transition-all"
              title="−10s"
            >
              ↺
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={error}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-sm transition-all hover:bg-blue-50 disabled:opacity-40"
            >
              {playing ? '⏸' : '▶'}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(10)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xs transition-all"
              title="+10s"
            >
              ↻
            </button>

            {/* Progress bar */}
            <div
              className="flex-1 h-1.5 bg-white/25 rounded-full cursor-pointer"
              onClick={seek}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time */}
            <span className="text-white/70 text-[11px] tabular-nums min-w-[72px] text-right">
              {fmt(current)} / {fmt(duration)}
            </span>
          </div>

          {error && (
            <p className="text-red-300 text-[11px] mt-1">
              ⚠ Audio file not found — check your Firebase Storage URL
            </p>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
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
