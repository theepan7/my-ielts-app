// src/pages/PrivacyPolicyPage.jsx
import { useNavigate } from 'react-router-dom'

const LAST_UPDATED  = 'March 30, 2026'
const APP_NAME      = 'IELTS Listening Pro'
const CONTACT_EMAIL = 'support@ieltslisteningpro.com'

const SECTIONS = [
  {
    icon: '📋',
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your email address and display name via Firebase Authentication. You may sign up using Google OAuth or email/password. We do not store raw passwords — authentication is handled securely by Firebase.',
      },
      {
        subtitle: 'Test Results & Progress',
        text: 'When you complete a listening test, we store your score, band estimate, time taken, per-part breakdown, and the date of the attempt. This data is used to display your history, update the leaderboard, and show your progress over time.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We may collect anonymised usage data such as which tests are most attempted and general performance trends. This data cannot be traced back to individual users and is used solely to improve the platform.',
      },
    ],
  },
  {
    icon: '🔍',
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'To Provide the Service',
        text: 'Your account data and test results are used to power the core features of the app — saving your scores, displaying your position on the global leaderboard, and showing your personal progress history.',
      },
      {
        subtitle: 'To Improve the Platform',
        text: 'Aggregated and anonymised data helps us understand which question types or test sections users find most challenging, allowing us to improve content quality and the overall learning experience.',
      },
      {
        subtitle: 'To Communicate With You',
        text: 'We may occasionally send you important service-related emails such as account verification or security notices. We do not send marketing emails without your explicit consent.',
      },
    ],
  },
  {
    icon: '🔒',
    title: 'Data Security',
    content: [
      {
        subtitle: 'Firebase Infrastructure',
        text: 'All data is stored in Google Firebase (Firestore and Firebase Authentication), which provides industry-standard encryption in transit (TLS) and at rest. Firebase is compliant with ISO 27001, SOC 1, SOC 2, and SOC 3.',
      },
      {
        subtitle: 'Access Controls',
        text: 'Firestore security rules ensure that each user can only read and write their own result data. Leaderboard entries expose only your display name and average band score — no email addresses or identifiers are visible to other users.',
      },
      {
        subtitle: 'No Payment Data',
        text: 'IELTS Listening Pro is currently a free platform. We do not collect, store, or process any payment or financial information.',
      },
    ],
  },
  {
    icon: '🤝',
    title: 'Data Sharing & Third Parties',
    content: [
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'We never sell, rent, or trade your personal information to third parties for marketing or advertising purposes.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We use Google Firebase as our backend infrastructure provider. Firebase processes data on our behalf under Google\'s data processing terms. No other third-party services have access to your personal data.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law or in response to valid legal processes such as a court order or government request.',
      },
    ],
  },
  {
    icon: '👤',
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You have the right to request a copy of the personal data we hold about you at any time by contacting us at the email below.',
      },
      {
        subtitle: 'Deletion',
        text: 'You may request deletion of your account and all associated data at any time. Once deleted, your scores will be permanently removed from our database and the leaderboard within 30 days.',
      },
      {
        subtitle: 'Correction',
        text: 'If you believe any information we hold about you is inaccurate, you may contact us to request a correction.',
      },
    ],
  },
  {
    icon: '🍪',
    title: 'Cookies & Local Storage',
    content: [
      {
        subtitle: 'Authentication Tokens',
        text: 'Firebase Authentication uses browser local storage to persist your login session across page refreshes. This is essential for the app to function and cannot be opted out of while using an account.',
      },
      {
        subtitle: 'No Tracking Cookies',
        text: 'We do not use advertising cookies, third-party trackers, or analytics cookies. We do not use Google Analytics or any similar tracking service.',
      },
    ],
  },
  {
    icon: '👶',
    title: "Children's Privacy",
    content: [
      {
        subtitle: 'Age Requirement',
        text: 'IELTS Listening Pro is intended for users aged 13 and over. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.',
      },
    ],
  },
  {
    icon: '🔄',
    title: 'Changes to This Policy',
    content: [
      {
        subtitle: 'Policy Updates',
        text: 'We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of the app after changes constitutes your acceptance of the revised policy. For significant changes, we will notify registered users by email.',
      },
    ],
  },
]

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#4338ca)',
        height: 75, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
      }}>
        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 600,
          color: '#fff', margin: 0,
        }}>
          Privacy Policy
        </h1>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Last updated + intro */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '20px 22px', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(15,23,42,.07)',
          borderLeft: '4px solid #2563eb',
        }}>
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 10 }}>
            Last updated: {LAST_UPDATED}
          </div>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.8, margin: 0 }}>
            At <strong style={{ color: '#0f172a' }}>{APP_NAME}</strong>, we take your privacy
            seriously. This policy explains what data we collect when you use our IELTS listening
            practice platform, why we collect it, and how we keep it safe. We aim to be transparent
            and straightforward — no legal jargon where plain language will do.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div key={section.title} style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 12, marginBottom: 14, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15,23,42,.06)',
          }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: '#eff4ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {section.icon}
              </div>
              <h2 style={{
                fontFamily: 'Lora, serif', fontSize: 15,
                fontWeight: 700, color: '#0f172a', margin: 0,
              }}>
                {si + 1}. {section.title}
              </h2>
            </div>

            {/* Sub-sections */}
            <div style={{ padding: '4px 0 8px' }}>
              {section.content.map((item, ii) => (
                <div key={item.subtitle} style={{
                  padding: '12px 20px',
                  borderBottom: ii < section.content.length - 1 ? '1px solid #f8fafc' : 'none',
                }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 700, color: '#2563eb',
                    marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#2563eb', display: 'inline-block', flexShrink: 0,
                    }} />
                    {item.subtitle}
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact card */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '20px 22px', marginBottom: 24,
          boxShadow: '0 1px 3px rgba(15,23,42,.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: '#ecfdf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              📬
            </div>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Contact Us
            </h2>
          </div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '0 0 12px' }}>
            If you have any questions about this Privacy Policy, wish to exercise your data rights,
            or want to report a concern, please contact us at:
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#eff4ff', border: '1px solid #bfdbfe',
              borderRadius: 8, padding: '9px 16px',
              fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none',
            }}
          >
            ✉️ {CONTACT_EMAIL}
          </a>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a,#4338ca)',
          borderRadius: 14, padding: '28px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Lora,serif', fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to start practising?
          </h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, marginBottom: 18 }}>
            100 free IELTS-style listening tests. No credit card required.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '11px 28px', borderRadius: 8, border: 'none',
              background: '#fff', color: '#1d4ed8', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Browse All Tests →
          </button>
        </div>

      </div>
    </div>
  )
}
