import { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, sectionTitle, topic }) {
  const audioRef  = useRef(null)
  const [playing, setPlaying]   = useState(false)
  const [current, setCurrent]   = useState(0)
  const [duration, setDuration] = useState(0)

  // Reset player when audio URL changes (section switch)
  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
    }
  }, [audioUrl])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
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
    <div className="card p-4 mb-4">
      <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Audio Playback — {sectionTitle}
      </p>

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-base">
          🔊
        </div>

        <div className="flex-1">
          <p className="text-[12.5px] font-semibold text-slate-700 mb-2 truncate">{sectionTitle} — {topic}</p>

          {/* Controls + progress */}
          <div className="flex items-center gap-2">
            {/* Skip back */}
            <button
              onClick={() => skip(-10)}
              className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all text-xs"
              title="-10s"
            >
              ↺
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white text-sm transition-all shadow-sm hover:shadow-md"
            >
              {playing ? '⏸' : '▶'}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(10)}
              className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all text-xs"
              title="+10s"
            >
              ↻
            </button>

            {/* Progress bar */}
            <div
              className="flex-1 h-1.5 bg-slate-200 rounded-full cursor-pointer audio-progress relative"
              onClick={seek}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time */}
            <span className="text-[11px] text-slate-400 min-w-[72px] text-right tabular-nums">
              {fmt(current)} / {fmt(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}
