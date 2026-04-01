// src/pages/TermsOfUsePage.jsx
import { useNavigate } from 'react-router-dom'

const LAST_UPDATED  = 'March 30, 2026'
const APP_NAME      = 'IELTS Listening Pro'
const COMPANY_NAME  = 'IELTS Listening Pro'
const CONTACT_EMAIL = 'support@ieltslisteningpro.com'
const APP_URL       = 'https://ieltslisteningpro.com'

const SECTIONS = [
  {
    icon: '✅',
    title: 'Acceptance of Terms',
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: `By accessing or using ${APP_NAME} (the "Service"), you confirm that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use the Service.`,
      },
      {
        subtitle: 'Changes to Terms',
        text: 'We reserve the right to update or modify these Terms at any time. We will indicate the date of the most recent revision at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.',
      },
    ],
  },
  {
    icon: '🎓',
    title: 'Description of Service',
    content: [
      {
        subtitle: 'What We Offer',
        text: `${APP_NAME} is a free online platform providing IELTS-style listening practice tests, band score guidance, and study resources. The Service is designed to help learners prepare for the IELTS exam through self-directed practice.`,
      },
      {
        subtitle: 'Not Affiliated with the British Council or IDP',
        text: 'IELTS Listening Pro is an independent platform and is not affiliated with, endorsed by, or connected to the British Council, IDP Education, or Cambridge Assessment English — the official organisations that administer the IELTS examination.',
      },
      {
        subtitle: 'No Guarantee of Exam Results',
        text: 'Practice scores on this platform are estimates based on standard band conversion tables. They are provided for guidance only and do not guarantee any particular result in the official IELTS examination.',
      },
    ],
  },
  {
    icon: '👤',
    title: 'User Accounts',
    content: [
      {
        subtitle: 'Registration',
        text: 'You may use certain features of the Service without creating an account. To access personalised features such as score tracking and leaderboard participation, you must register using a valid email address or a supported OAuth provider (e.g. Google).',
      },
      {
        subtitle: 'Account Responsibility',
        text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at the contact email below if you suspect any unauthorised use of your account.',
      },
      {
        subtitle: 'Account Eligibility',
        text: 'You must be at least 13 years of age to create an account. By registering, you confirm that you meet this requirement. If you are under 18, you confirm that you have obtained parental or guardian consent.',
      },
      {
        subtitle: 'One Account Per User',
        text: 'Each user may maintain only one account. Creating multiple accounts to manipulate leaderboard rankings or abuse the Service is strictly prohibited and may result in all associated accounts being permanently suspended.',
      },
    ],
  },
  {
    icon: '📜',
    title: 'Acceptable Use',
    content: [
      {
        subtitle: 'Permitted Use',
        text: 'You may use the Service for personal, non-commercial study and exam preparation purposes only. You may access and complete practice tests, review your results, and share your scores for personal reference.',
      },
      {
        subtitle: 'Prohibited Conduct',
        text: 'You must not: (a) reproduce, distribute, or commercially exploit any test content; (b) use automated tools, bots, or scripts to complete tests or inflate scores; (c) attempt to reverse-engineer, scrape, or copy the platform\'s content or infrastructure; (d) upload or transmit malicious code; (e) harass, impersonate, or harm other users; or (f) use the Service for any unlawful purpose.',
      },
      {
        subtitle: 'Leaderboard Integrity',
        text: 'Any attempt to manipulate leaderboard rankings — including using automated scripts, exploiting bugs, or creating fake accounts — will result in immediate and permanent removal from the leaderboard and suspension of your account.',
      },
    ],
  },
  {
    icon: '©️',
    title: 'Intellectual Property',
    content: [
      {
        subtitle: 'Our Content',
        text: `All content on ${APP_NAME} — including but not limited to test questions, audio recordings, written passages, images, graphics, and software — is the property of ${COMPANY_NAME} or its content licensors and is protected by applicable copyright and intellectual property laws.`,
      },
      {
        subtitle: 'Limited Licence',
        text: 'We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for personal study purposes only. This licence does not permit you to reproduce, modify, distribute, or create derivative works from any content on the platform.',
      },
      {
        subtitle: 'User Feedback',
        text: 'If you submit feedback, suggestions, or ideas about the Service, you grant us a perpetual, irrevocable, royalty-free licence to use that feedback for any purpose without compensation or attribution to you.',
      },
    ],
  },
  {
    icon: '🔗',
    title: 'Third-Party Services',
    content: [
      {
        subtitle: 'Firebase & Google',
        text: 'The Service uses Google Firebase for authentication and data storage. Your use of these underlying services is also subject to Google\'s Terms of Service and Privacy Policy. We are not responsible for any changes to or issues arising from third-party services.',
      },
      {
        subtitle: 'External Links',
        text: 'The Service may contain links to third-party websites or resources for informational purposes. We do not endorse and are not responsible for the content, privacy practices, or availability of those external sites.',
      },
    ],
  },
  {
    icon: '⚠️',
    title: 'Disclaimers & Limitation of Liability',
    content: [
      {
        subtitle: 'Service Provided "As Is"',
        text: 'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.',
      },
      {
        subtitle: 'Accuracy of Content',
        text: 'While we strive to ensure that all test content and band score information is accurate and up to date, we make no representations or warranties regarding the completeness, accuracy, or suitability of the content for any particular purpose.',
      },
      {
        subtitle: 'Limitation of Liability',
        text: `To the maximum extent permitted by applicable law, ${COMPANY_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service, including but not limited to loss of data, loss of profits, or exam outcomes.`,
      },
    ],
  },
  {
    icon: '🚫',
    title: 'Termination',
    content: [
      {
        subtitle: 'Termination by Us',
        text: 'We reserve the right to suspend or permanently terminate your account and access to the Service at our sole discretion, without prior notice, if we believe you have violated these Terms or engaged in conduct harmful to the platform or other users.',
      },
      {
        subtitle: 'Termination by You',
        text: 'You may close your account at any time by contacting us at the email below. Upon termination, your personal data and scores will be deleted in accordance with our Privacy Policy.',
      },
      {
        subtitle: 'Effect of Termination',
        text: 'Upon termination, all licences granted to you under these Terms will immediately cease. Provisions that by their nature should survive termination — including intellectual property, disclaimers, and limitation of liability — will continue to apply.',
      },
    ],
  },
  {
    icon: '⚖️',
    title: 'Governing Law',
    content: [
      {
        subtitle: 'Applicable Law',
        text: 'These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of the applicable territory.',
      },
      {
        subtitle: 'Dispute Resolution',
        text: 'We encourage you to contact us first if you have any concern or dispute. We will make every reasonable effort to resolve disagreements amicably before any formal legal process is pursued.',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────
export default function TermsOfUsePage() {
  const navigate = useNavigate()

  return (
    <div style={{
      background: '#f4f6fb',
      minHeight: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      paddingBottom: 80,
    }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #4f46e5 100%)',
        padding: '52px 24px 44px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
        }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 20, left: 24,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', borderRadius: 8, padding: '6px 14px',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          ← Back
        </button>

        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,.12)',
          fontSize: 26, marginBottom: 16,
        }}>
          ⚖️
        </div>

        <h1 style={{
          fontFamily: 'Lora, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700, color: '#fff',
          margin: '0 0 10px', letterSpacing: '-.02em',
        }}>
          Terms of Use
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,.65)',
          maxWidth: 480, margin: '0 auto 18px', lineHeight: 1.6,
        }}>
          Please read these terms carefully before using {APP_NAME}.
        </p>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.18)',
          borderRadius: 20, padding: '5px 16px',
          fontSize: 12, color: 'rgba(255,255,255,.7)',
        }}>
          Last updated: {LAST_UPDATED}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 0' }}>

        {/* Quick nav */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(15,23,42,.07)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.07em', color: '#94a3b8', marginBottom: 12,
          }}>
            Contents
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '6px 16px',
          }}>
            {SECTIONS.map((s, i) => (
              <a
                key={s.title}
                href={`#section-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 12.5, color: '#2563eb', textDecoration: 'none',
                  fontWeight: 500, padding: '3px 0',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.color = '#2563eb'}
              >
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                {i + 1}. {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Intro card */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '20px 22px', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(15,23,42,.07)',
          borderLeft: '4px solid #4f46e5',
        }}>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.8, margin: 0 }}>
            Welcome to <strong style={{ color: '#0f172a' }}>{APP_NAME}</strong>. These Terms of
            Use govern your access to and use of our platform at{' '}
            <a href={APP_URL} style={{ color: '#2563eb' }}>{APP_URL}</a>. By using the Service
            you agree to these terms. We've written them in plain language wherever possible —
            if anything is unclear, please reach out to us.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div
            key={section.title}
            id={`section-${si}`}
            style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, marginBottom: 14, overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(15,23,42,.06)',
              scrollMarginTop: 80,
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 20px',
              borderBottom: '1px solid #f1f5f9',
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
                <div
                  key={item.subtitle}
                  style={{
                    padding: '12px 20px',
                    borderBottom: ii < section.content.length - 1
                      ? '1px solid #f8fafc' : 'none',
                  }}
                >
                  <div style={{
                    fontSize: 12.5, fontWeight: 700,
                    color: '#4f46e5', marginBottom: 5,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#4f46e5', display: 'inline-block', flexShrink: 0,
                    }} />
                    {item.subtitle}
                  </div>
                  <p style={{
                    fontSize: 13, color: '#475569',
                    lineHeight: 1.75, margin: 0,
                  }}>
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
              width: 34, height: 34, borderRadius: 9,
              background: '#fffbeb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              📬
            </div>
            <h2 style={{
              fontFamily: 'Lora, serif', fontSize: 15,
              fontWeight: 700, color: '#0f172a', margin: 0,
            }}>
              Questions About These Terms?
            </h2>
          </div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '0 0 14px' }}>
            If you have any questions, concerns, or requests related to these Terms of Use,
            please contact us. We aim to respond to all enquiries within 3 business days.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#eff4ff', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '9px 16px',
                fontSize: 13, fontWeight: 600, color: '#2563eb',
                textDecoration: 'none',
              }}
            >
              ✉️ {CONTACT_EMAIL}
            </a>
            <button
              onClick={() => navigate('/privacy')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '9px 16px',
                fontSize: 13, fontWeight: 600, color: '#475569',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              🔒 Privacy Policy
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          borderRadius: 14,
          background: 'linear-gradient(135deg,#0f172a,#4f46e5)',
          padding: '28px 24px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
          }} />
          <div style={{
            fontFamily: 'Lora, serif', fontSize: 18,
            fontWeight: 700, color: '#fff', marginBottom: 8,
          }}>
            Ready to start practising?
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginBottom: 18 }}>
            100 free IELTS-style listening tests. No credit card required.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 26px', borderRadius: 9, border: 'none',
              background: '#fff', color: '#1e3a8a',
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(0,0,0,.2)',
              transition: 'all .16s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Browse All Tests →
          </button>
        </div>

      </div>
    </div>
  )
}
