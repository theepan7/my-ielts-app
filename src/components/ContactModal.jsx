import { useState } from 'react'
import { sendContactMessage } from '../firebase/services'

const SUBJECTS = [
  'General Enquiry',
  'Technical Support',
  'Account & Billing',
  'Content Feedback',
  'Partnership / Press',
]

export default function ContactModal({ onClose, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handle(e) {
    e.preventDefault()
    const { name, email, subject, message } = form
    if (!name || !email || !subject || !message) {
      showToast('Please fill in all fields', 'error'); return
    }
    setBusy(true)
    try {
      await sendContactMessage(name, email, subject, message)
      showToast("Message sent! We'll reply within 24 hours ✉")
      onClose()
    } catch {
      showToast('Failed to send — please try again', 'error')
    }
    setBusy(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeUp_.22s_ease]">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-700 to-violet-700 px-6 py-5 relative">
          <h2 className="font-serif text-xl font-semibold text-white">Get in Touch</h2>
          <p className="text-blue-200 text-xs mt-1">We respond within 24 hours on weekdays</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 text-xs transition-all"
          >✕</button>
        </div>

        <div className="p-6">
          {/* Info tiles */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: '📧', label: 'Email',     val: 'support@ieltslistening.pro' },
              { icon: '💬', label: 'Live Chat', val: 'Mon–Fri 9am–6pm' },
              { icon: '📍', label: 'Based in',  val: 'London, UK' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{item.label}</div>
                <div className="text-[10.5px] text-slate-700 font-semibold mt-0.5 leading-tight">{item.val}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Your Name</label>
                <input className="input" type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)}>
                <option value="">Select a topic…</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Write your message here…"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send Message ✉'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
