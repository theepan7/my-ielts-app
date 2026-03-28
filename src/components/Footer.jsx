import { useNavigate } from 'react-router-dom'

export default function Footer({ onContactClick }) {
  const navigate = useNavigate()

  const cols = [
    {
      title: 'Practice',
      links: [
        { label: 'Academic Tests',    action: () => navigate('/?cat=academic') },
        { label: 'General Training',  action: () => navigate('/?cat=general')  },
        { label: 'All 100 Tests',     action: () => navigate('/')              },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Band Score Guide', action: () => {} },
        { label: 'Listening Tips',   action: () => {} },
        { label: 'Study Plans',      action: () => {} },
        { label: 'FAQ',              action: () => {} },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us',       action: () => {}          },
        { label: 'Contact Us',     action: onContactClick    },
        { label: 'Privacy Policy', action: () => {}          },
        { label: 'Terms of Use',   action: () => {}          },
      ],
    },
  ]

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-100">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm">🎧</div>
              <span className="font-serif font-semibold text-slate-900">IELTS Listening Pro</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The most comprehensive IELTS Listening practice platform — 100 full tests with authentic audio and instant band score results.
            </p>
            <div className="flex gap-2">
              {['𝕏', 'f', '▶', '◈'].map((s, i) => (
                <button key={i} className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 text-slate-400 text-xs flex items-center justify-center transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <button onClick={link.action} className="text-[13px] text-slate-500 hover:text-blue-600 transition-colors text-left">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5">
          <p className="text-[11.5px] text-slate-400">
            © 2025 IELTS Listening Pro. Not affiliated with British Council, IDP or Cambridge Assessment.
          </p>
          <div className="flex gap-2">
            {['🔒 Secure', '✓ Verified', '🌍 Global'].map(b => (
              <span key={b} className="text-[10.5px] text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
