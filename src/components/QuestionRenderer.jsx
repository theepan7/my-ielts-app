// src/components/QuestionRenderer.jsx
// Renders any IELTS question type from Firestore data.
// In reviewMode=true: always shows correct answer for every question,
// whether the user answered it or not.

export default function QuestionRenderer({ section, answers, onChange, reviewMode }) {
  const type = section.type
  if (type === 'form')     return <FormSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'table')    return <TableSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'mcq')      return <McqSection       section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'mcqgroup') return <McqGroupSection  section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'fill')     return <FillSection      section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'notes')    return <NotesSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'map')      return <MapSection       section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'matching') return <MatchingSection  section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  return <p style={{ color: '#dc2626', fontSize: 13 }}>Unknown section type: {type}</p>
}

// ─────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────

function norm(str) {
  return String(str || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Handles both string and array correct answers (case-sensitive)
function isCorrect(userAnswer, correctAnswer) {
  const ua = norm(userAnswer)
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(a => norm(a) === ua)
  }
  return norm(correctAnswer) === ua
}

// Returns the display value for correct answer (first item if array)
function displayAnswer(correctAnswer) {
  if (Array.isArray(correctAnswer)) return correctAnswer[0]
  return correctAnswer
}

// Returns styling for an answer input based on review state
function inputStyle(qNo, answers, correctAnswer, reviewMode) {
  const base = {
    display: 'inline-block',
    background: '#fff',
    borderBottom: '2px solid',
    outline: 'none',
    fontSize: 13,
    padding: '2px 4px',
    width: 140,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'all .18s',
  }

  if (!reviewMode) return { ...base, borderColor: '#94a3b8' }

  const val      = answers[qNo]
  const answered = val !== undefined && val !== ''

  if (!answered) return { ...base, borderColor: '#f87171', background: '#fff5f5' }
  if (isCorrect(val, correctAnswer)) {
    return { ...base, borderColor: '#4ade80', background: '#f0fdf4', color: '#166534' }
  }
  return { ...base, borderColor: '#f87171', background: '#fff5f5', color: '#991b1b' }
}

// Always shows correct answer in review mode for wrong/unanswered questions
function CorrectAnswer({ qNo, answers, correctAnswer, reviewMode }) {
  if (!reviewMode) return null

  const val      = answers[qNo]
  const answered = val !== undefined && val !== ''
  const correct  = answered && isCorrect(val, correctAnswer)

  // Show green tick if correct
if (correct) return (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 3,
    marginLeft: 6,
    fontSize: 11.5, fontWeight: 600,
    color: '#059669',
    background: '#ecfdf5', border: '1px solid #a7f3d0',
    borderRadius: 5, padding: '1px 7px',
  }}>
    ✓ {displayAnswer(correctAnswer)}
  </span>
)

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      marginLeft: 6,
      fontSize: 11.5, fontWeight: 600,
      color: '#059669',
      background: '#ecfdf5', border: '1px solid #a7f3d0',
      borderRadius: 5, padding: '1px 7px',
    }}>
      ✓ {displayAnswer(correctAnswer)}
    </span>
  )
}

// Wrapper card for each section
function SectionCard({ section, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
      boxShadow: '0 1px 3px rgba(15,23,42,.06)',
    }}>
      <div style={{
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
        padding: '10px 16px',
      }}>
        {section.heading && (
          <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, marginBottom: 2 }}>
            {section.heading}
          </p>
        )}
        {section.instruction && (
          <p style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
            {section.instruction}
          </p>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  1. FORM SECTION
// ─────────────────────────────────────────────────────────
function FormSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(section.fields || []).map(field => (
          <div key={field.qNo} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 18 }}>
              {field.qNo}.
            </span>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 500, minWidth: 120 }}>
              {field.label}
              {field.prefix && <span style={{ color: '#64748b', marginLeft: 4 }}>{field.prefix}</span>}
            </span>
            <input
              type="text"
              value={answers[field.qNo] || ''}
              onChange={e => onChange(field.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder={reviewMode && !answers[field.qNo] ? '(not answered)' : '…'}
              style={inputStyle(field.qNo, answers, field.answer, reviewMode)}
            />
            {field.suffix && <span style={{ fontSize: 12, color: '#64748b' }}>{field.suffix}</span>}
            <CorrectAnswer qNo={field.qNo} answers={answers} correctAnswer={field.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  2. TABLE SECTION
// ─────────────────────────────────────────────────────────
function TableSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      {section.caption && (
        <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>
          {section.caption}
        </p>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {(section.rows || []).map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#f8fafc' : '#fff' }}>
                {row.rowLabel !== undefined && (
                  <td style={{
                    border: '1px solid #e2e8f0', padding: '9px 12px',
                    fontWeight: 600, color: '#334155', minWidth: 90,
                  }}>
                    {row.rowLabel}
                  </td>
                )}
                {(row.cells || []).map((cell, ci) => (
                  <td key={ci} style={{ border: '1px solid #e2e8f0', padding: '9px 12px' }}>
                    {cell.static ? (
                      <span style={{ color: '#475569' }}>{cell.static}</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        {cell.label && <span style={{ color: '#64748b', fontSize: 11.5 }}>{cell.label}:</span>}
                        {cell.prefix && <span style={{ color: '#64748b', fontSize: 11.5 }}>{cell.prefix}</span>}
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{cell.qNo}.</span>
                        <input
                          type="text"
                          value={answers[cell.qNo] || ''}
                          onChange={e => onChange(cell.qNo, e.target.value)}
                          readOnly={reviewMode}
                          placeholder={reviewMode && !answers[cell.qNo] ? '(not answered)' : '…'}
                          style={inputStyle(cell.qNo, answers, cell.answer, reviewMode)}
                        />
                        {cell.suffix && <span style={{ fontSize: 11.5, color: '#64748b' }}>{cell.suffix}</span>}
                        <CorrectAnswer qNo={cell.qNo} answers={answers} correctAnswer={cell.answer} reviewMode={reviewMode} />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  3. MCQ SECTION
// ─────────────────────────────────────────────────────────
function McqSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(section.questions || []).map(q => {

          const isMulti       = Array.isArray(q.answers)
          const selected      = answers[q.qNo] || (isMulti ? [] : '')
          const correctAnswers = isMulti ? q.answers : [q.answer]

          function toggle(letter) {
            if (reviewMode) return
            if (!isMulti) { onChange(q.qNo, letter); return }
            let updated = [...selected]
            if (updated.includes(letter)) {
              updated = updated.filter(l => l !== letter)
            } else {
              if (q.maxSelect && updated.length >= q.maxSelect) return
              updated.push(letter)
            }
            onChange(q.qNo, updated)
          }

          return (
            <div key={q.qNo}>
              <p style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>{q.qNo}.</span>
                {q.text}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 16 }}>
                {(q.options || []).map((opt, i) => {
                  const letter       = String.fromCharCode(65 + i)
                  const isSel        = isMulti ? selected.includes(letter) : selected === letter
                  const isAns        = correctAnswers.includes(letter)
                  const isCorrectSel = reviewMode && isSel && isAns
                  const isWrongSel   = reviewMode && isSel && !isAns
                  const isMissed     = reviewMode && !isSel && isAns

                  const bg =
                    isCorrectSel ? '#f0fdf4' :
                    isWrongSel   ? '#fff5f5' :
                    isMissed     ? '#fefce8' :
                    isSel        ? '#eff4ff' : '#f8fafc'

                  const border =
                    isCorrectSel ? '#4ade80' :
                    isWrongSel   ? '#f87171' :
                    isMissed     ? '#facc15' :
                    isSel        ? '#93c5fd' : '#e2e8f0'

                  return (
                    <div
                      key={letter}
                      onClick={() => toggle(letter)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 8,
                        border: `1.5px solid ${border}`,
                        background: bg,
                        cursor: reviewMode ? 'default' : 'pointer',
                        fontSize: 13,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: `2px solid ${border}`,
                        background: isSel ? border : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {isSel ? '✓' : letter}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {reviewMode && isCorrectSel && <span style={{ color: '#059669', fontSize: 11 }}>✓ Correct</span>}
                      {reviewMode && isWrongSel   && <span style={{ color: '#dc2626', fontSize: 11 }}>✗ Wrong</span>}
                      {reviewMode && isMissed     && <span style={{ color: '#ca8a04', fontSize: 11 }}>Missed</span>}
                    </div>
                  )
                })}
              </div>

              {reviewMode && (
                <p style={{ fontSize: 11.5, marginTop: 6, marginLeft: 16, color: '#475569' }}>
                  Correct answer: <strong style={{ color: '#059669' }}>
                    {correctAnswers.join(', ')}
                  </strong>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  4. MCQ GROUP SECTION (choose multiple from one list)
// ─────────────────────────────────────────────────────────
function McqGroupSection({ section, answers, onChange, reviewMode }) {
  const letters = (section.options || []).map((_, i) => String.fromCharCode(65 + i))
  const correctAnswers = (section.questions || []).map(q => q.answer)

  return (
    <SectionCard section={section}>
      {/* Options list */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '10px 14px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
          Options
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {(section.options || []).map((opt, i) => (
            <p key={i} style={{ fontSize: 13, color: '#475569' }}>
              <span style={{ fontWeight: 700, color: '#64748b', marginRight: 6 }}>{letters[i]}.</span>
              {opt}
            </p>
          ))}
        </div>
      </div>

      {/* Answer slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(section.questions || []).map(q => {
          const selected = answers[q.qNo] || ''
          const correct  = reviewMode && selected === q.answer
          const wrong    = reviewMode && selected && selected !== q.answer
          const noAnswer = reviewMode && !selected

          return (
            <div key={q.qNo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 20 }}>{q.qNo}.</span>
              <select
                value={selected}
                onChange={e => !reviewMode && onChange(q.qNo, e.target.value)}
                disabled={reviewMode}
                style={{
                  fontSize: 13, padding: '6px 10px', borderRadius: 7,
                  border: `1.5px solid ${correct ? '#4ade80' : wrong || noAnswer ? '#f87171' : selected ? '#93c5fd' : '#e2e8f0'}`,
                  background: correct ? '#f0fdf4' : wrong || noAnswer ? '#fff5f5' : selected ? '#eff4ff' : '#fff',
                  color: correct ? '#166534' : wrong ? '#991b1b' : '#475569',
                  outline: 'none',
                }}
              >
                <option value="">{noAnswer ? '(not answered)' : 'Select…'}</option>
                {letters.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {reviewMode && (wrong || noAnswer) && (
                <span style={{
                  fontSize: 11.5, fontWeight: 600, color: '#059669',
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 5, padding: '1px 7px',
                }}>
                  ✓ {q.answer}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  5. FILL IN THE BLANK SECTION
// ─────────────────────────────────────────────────────────
function FillSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(section.questions || []).map(q => (
          <div key={q.qNo} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, fontSize: 13, color: '#334155' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{q.qNo}.</span>
            {q.before && <span>{q.before}</span>}
            <input
              type="text"
              value={answers[q.qNo] || ''}
              onChange={e => onChange(q.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder={reviewMode && !answers[q.qNo] ? '(not answered)' : '…'}
              style={inputStyle(q.qNo, answers, q.answer, reviewMode)}
            />
            {q.after && <span>{q.after}</span>}
            <CorrectAnswer qNo={q.qNo} answers={answers} correctAnswer={q.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  6. NOTES SECTION
// ─────────────────────────────────────────────────────────
function NotesSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      {section.title && (
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, textDecoration: 'underline', marginBottom: 10 }}>
          {section.title}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(section.lines || []).map((line, li) => {
          // Static line (no question number)
          if (!line.qNo) {
            return (
              <p key={li} style={{ fontSize: 13, color: '#475569', marginLeft: 8, fontWeight: line.bold ? 700 : 400 }}>
                {line.before || line.text || ''}
              </p>
            )
          }

          // Line with a blank
          return (
            <div key={li} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, fontSize: 13, color: '#334155', marginLeft: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{line.qNo}.</span>
              {line.before && <span>{line.before}</span>}
              <input
                type="text"
                value={answers[line.qNo] || ''}
                onChange={e => onChange(line.qNo, e.target.value)}
                readOnly={reviewMode}
                placeholder={reviewMode && !answers[line.qNo] ? '(not answered)' : '…'}
                style={inputStyle(line.qNo, answers, line.answer, reviewMode)}
              />
              {line.after && <span>{line.after}</span>}
              <CorrectAnswer qNo={line.qNo} answers={answers} correctAnswer={line.answer} reviewMode={reviewMode} />
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  7. MAP / DIAGRAM SECTION
// ─────────────────────────────────────────────────────────
function MapSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionCard section={section}>
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.imageAlt || 'Diagram'}
          style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14 }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(section.questions || []).map(q => (
          <div key={q.qNo} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 20 }}>{q.qNo}.</span>
            {q.label && <span style={{ color: '#475569', minWidth: 70 }}>{q.label}</span>}
            <input
              type="text"
              value={answers[q.qNo] || ''}
              onChange={e => onChange(q.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder={reviewMode && !answers[q.qNo] ? '(not answered)' : '…'}
              style={inputStyle(q.qNo, answers, q.answer, reviewMode)}
            />
            <CorrectAnswer qNo={q.qNo} answers={answers} correctAnswer={q.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─────────────────────────────────────────────────────────
//  8. MATCHING SECTION
// ─────────────────────────────────────────────────────────
function MatchingSection({ section, answers, onChange, reviewMode }) {
  // Support both plain string options and object options {letter, text}
  const options = (section.options || []).map((opt, i) =>
    typeof opt === 'object'
      ? { letter: opt.letter || String.fromCharCode(65 + i), label: opt.text || opt.label || '' }
      : { letter: String.fromCharCode(65 + i), label: opt }
  )
  const letters = options.map(o => o.letter)

  return (
    <SectionCard section={section}>
      {/* Options */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '10px 14px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
          Options
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {options.map(opt => (
            <p key={opt.letter} style={{ fontSize: 13, color: '#475569' }}>
              <span style={{ fontWeight: 700, color: '#64748b', marginRight: 6 }}>{opt.letter}.</span>
              {opt.label}
            </p>
          ))}
        </div>
      </div>

      {/* Items — supports both section.items and section.questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(section.items || section.questions || []).map(item => {
          const selected = answers[item.qNo]
          const correct  = reviewMode && selected === item.answer
          const wrong    = reviewMode && selected && selected !== item.answer
          const noAnswer = reviewMode && !selected

          return (
            <div key={item.qNo} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 20 }}>{item.qNo}.</span>
              <span style={{ fontSize: 13, color: '#475569', flex: 1, minWidth: 130 }}>{item.label}</span>
              <select
                value={selected || ''}
                onChange={e => !reviewMode && onChange(item.qNo, e.target.value)}
                disabled={reviewMode}
                style={{
                  fontSize: 13, padding: '6px 10px', borderRadius: 7,
                  border: `1.5px solid ${correct ? '#4ade80' : wrong || noAnswer ? '#f87171' : selected ? '#93c5fd' : '#e2e8f0'}`,
                  background: correct ? '#f0fdf4' : wrong || noAnswer ? '#fff5f5' : selected ? '#eff4ff' : '#fff',
                  color: correct ? '#166534' : wrong ? '#991b1b' : '#475569',
                  outline: 'none',
                }}
              >
                <option value="">{noAnswer ? '(not answered)' : 'Select…'}</option>
                {letters.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {reviewMode && (wrong || noAnswer) && (
                <span style={{
                  fontSize: 11.5, fontWeight: 600, color: '#059669',
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 5, padding: '1px 7px',
                }}>
                  ✓ {item.answer}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
