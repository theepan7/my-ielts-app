import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTestWithQuestions, saveResult, calcBand } from '../firebase/services'
import QuestionRenderer from '../components/QuestionRenderer'

// ── AUDIO PLAYER ──────────────────────────────────────────
function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDur] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPlaying(false); setCurrent(0); setDur(0); setError(false)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.load() }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current || error) return
    playing ? audioRef.current.pause() : audioRef.current.play().catch(() => setError(true))
    setPlaying(!playing)
  }

  const fmt = (t) => {
    if (!t || isNaN(t)) return '0:00'
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-slate-900 px-6 py-3 flex items-center gap-4 border-b border-slate-700">
      <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg hover:bg-blue-700 transition-all">
        {playing ? '⏸' : '▶'}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          audioRef.current.currentTime = pct * duration;
        }}>
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(current / duration) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400 font-mono">{fmt(current)} / {fmt(duration)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">IELTS Listening Audio</span>
        </div>
      </div>
      <audio ref={audioRef} src={audioUrl} 
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDur(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />
    </div>
  )
}

// ── MAIN TEST PAGE ────────────────────────────────────────
export default function TestPage({ showToast }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partIdx, setPartIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [saving, setSaving] = useState(false);

  const startTime = useRef(Date.now());

  useEffect(() => {
    fetchTestWithQuestions(testId)
      .then(data => { setTest(data); setLoading(false) })
      .catch(err => { showToast(err.message, 'error'); setLoading(false) })
  }, [testId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleFinish(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setAnswer = (qNo, value) => setAnswers(prev => ({ ...prev, [qNo]: value }));

  const calculateScore = () => {
    let correct = 0, total = 40; // IELTS is standard 40
    test?.parts.forEach(part => {
      part.sections.forEach(sec => {
        const fields = getAllFields(sec);
        fields.forEach(f => {
          if (String(answers[f.qNo] || '').trim().toLowerCase() === String(f.answer || '').trim().toLowerCase()) correct++;
        });
      });
    });
    return { correct, total };
  };

  function getAllFields(section) {
    const f = [];
    if (section.questions) section.questions.forEach(q => f.push({ qNo: q.qNo, answer: q.answer }));
    if (section.fields) section.fields.forEach(field => f.push({ qNo: field.qNo, answer: field.answer }));
    return f;
  }

  async function handleFinish(auto = false) {
    if (!auto && !window.confirm("Finish and submit test?")) return;
    const { correct, total } = calculateScore();
    const band = calcBand(correct);
    if (user) {
      setSaving(true);
      await saveResult(user.uid, user.email, testId, test.id, correct, total, band);
      setSaving(false);
    }
    navigate('/result', { state: { test, answers, correct, total, band } });
  }

  if (loading) return <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center font-bold">Loading Test...</div>;

  const currentPart = test.parts[partIdx];
  const audioUrl = test.audioUrl || currentPart?.audioUrl;

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div>
          <h2 className="font-serif font-bold text-slate-800 text-lg">{test.title}</h2>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Part {partIdx + 1} of 4</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <span className="text-xs">⏱</span>
            <span className="font-mono font-bold text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">EXIT TEST</button>
        </div>
      </div>

      {/* 2. AUDIO BAR */}
      <AudioPlayer audioUrl={audioUrl} />

      {/* 3. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 pb-40">
        <div className="max-w-3xl mx-auto">
          {currentPart?.sections.map(section => (
            <QuestionRenderer 
              key={section.id} 
              section={section} 
              answers={answers} 
              onChange={setAnswer} 
            />
          ))}
          
          <div className="flex justify-between mt-12">
            <button 
              disabled={partIdx === 0}
              onClick={() => {setPartIdx(p => p - 1); document.querySelector('.overflow-y-auto').scrollTop = 0}}
              className="px-6 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 disabled:opacity-30"
            >← Previous Part</button>
            
            {partIdx < 3 ? (
              <button 
                onClick={() => {setPartIdx(p => p + 1); document.querySelector('.overflow-y-auto').scrollTop = 0}}
                className="px-8 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all"
              >Next Part →</button>
            ) : (
              <button 
                onClick={() => handleFinish()}
                className="px-8 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold shadow-lg shadow-blue-200"
              >Submit Test</button>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM QUESTION NAVIGATOR (Dynamic Shading) */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
          {[...Array(40)].map((_, i) => {
            const qNo = i + 1;
            const isAnswered = !!answers[qNo];
            const isCurrentPart = qNo > (partIdx * 10) && qNo <= (partIdx + 1) * 10;
            
            return (
              <button
                key={qNo}
                onClick={() => {
                  const targetPart = Math.floor(i / 10);
                  setPartIdx(targetPart);
                }}
                className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-200 border
                  ${isAnswered 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400'}
                  ${isCurrentPart && !isAnswered ? 'ring-2 ring-blue-100 border-blue-400 text-blue-600' : ''}
                `}
              >
                {qNo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  )
}
