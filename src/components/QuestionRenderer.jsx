// src/components/QuestionRenderer.jsx
// Renders any question type stored in Firestore.
// Supported types: form, table, mcq, fill, notes, map, matching

export default function QuestionRenderer({ section, answers, onChange, reviewMode }) {
  const type = section.type

  if (type === 'form')     return <FormSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'table')    return <TableSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'mcq')      return <McqSection       section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'fill')     return <FillSection      section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'notes')    return <NotesSection     section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'map')      return <MapSection       section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />
  if (type === 'matching') return <MatchingSection  section={section} answers={answers} onChange={onChange} reviewMode={reviewMode} />

  return <p className="text-red-400 text-sm">Unknown section type: {type}</p>
}

// ─── SHARED HELPERS ───────────────────────────────────────────────

function normalize(str) {
  return String(str || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function isCorrect(userAnswer, correctAnswer) {
  return normalize(userAnswer) === normalize(correctAnswer)
}

function inputClass(qNo, answers, correctAnswer, reviewMode) {
  const val = answers[qNo]
  if (!reviewMode) return 'ielts-input'
  if (!val) return 'ielts-input border-slate-300'
  return isCorrect(val, correctAnswer)
    ? 'ielts-input border-green-400 bg-green-50 text-green-800'
    : 'ielts-input border-red-400 bg-red-50 text-red-700'
}

function SectionWrapper({ section, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* Section heading */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
        <p className="font-semibold text-slate-800 text-sm">{section.heading}</p>
        {section.instruction && (
          <p className="text-slate-500 text-xs mt-0.5 italic">{section.instruction}</p>
        )}
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}

function CorrectAnswerHint({ qNo, answers, correctAnswer, reviewMode }) {
  if (!reviewMode) return null
  const val = answers[qNo]
  if (!val || isCorrect(val, correctAnswer)) return null
  return (
    <span className="text-green-600 text-xs font-semibold ml-2">
      ✓ {correctAnswer}
    </span>
  )
}

// ─── 1. FORM SECTION ──────────────────────────────────────────────
// Renders label: [input] pairs
// Firestore shape:
// { type: "form", heading, instruction, fields: [{ qNo, label, prefix, suffix, answer }] }

function FormSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      <div className="space-y-3">
        {(section.fields || []).map(field => (
          <div key={field.qNo} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 w-4">{field.qNo}.</span>
            <span className="text-sm text-slate-700 font-medium min-w-[120px]">
              {field.label}
              {field.prefix && <span className="text-slate-500 ml-1">{field.prefix}</span>}
            </span>
            <input
              type="text"
              value={answers[field.qNo] || ''}
              onChange={e => onChange(field.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder="…"
              className={inputClass(field.qNo, answers, field.answer, reviewMode)}
            />
            {field.suffix && <span className="text-sm text-slate-500">{field.suffix}</span>}
            <CorrectAnswerHint qNo={field.qNo} answers={answers} correctAnswer={field.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

// ─── 2. TABLE SECTION ─────────────────────────────────────────────
// Renders a table with static text and input cells
// Firestore shape:
// { type: "table", heading, instruction, caption, rows: [{ rowLabel, cells: [{ static? | qNo, label?, prefix?, answer }] }] }

function TableSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      {section.caption && (
        <p className="text-sm font-bold text-slate-700 mb-3">{section.caption}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {(section.rows || []).map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                {/* Row label column */}
                {row.rowLabel !== undefined && (
                  <td className="border border-slate-200 px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap w-28">
                    {row.rowLabel}
                  </td>
                )}
                {/* Data cells */}
                {(row.cells || []).map((cell, ci) => (
                  <td key={ci} className="border border-slate-200 px-3 py-2.5">
                    {cell.static ? (
                      <span className="text-slate-600">{cell.static}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {cell.label && (
                          <span className="text-slate-600 text-xs">{cell.label}:</span>
                        )}
                        {cell.prefix && (
                          <span className="text-slate-500 text-xs">{cell.prefix}</span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">{cell.qNo}.</span>
                        <input
                          type="text"
                          value={answers[cell.qNo] || ''}
                          onChange={e => onChange(cell.qNo, e.target.value)}
                          readOnly={reviewMode}
                          placeholder="…"
                          className={inputClass(cell.qNo, answers, cell.answer, reviewMode)}
                        />
                        {cell.suffix && (
                          <span className="text-slate-500 text-xs">{cell.suffix}</span>
                        )}
                        <CorrectAnswerHint qNo={cell.qNo} answers={answers} correctAnswer={cell.answer} reviewMode={reviewMode} />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  )
}

// ─── 3. MCQ SECTION ───────────────────────────────────────────────
// Multiple choice A B C D
// Firestore shape:
// { type: "mcq", heading, instruction, questions: [{ qNo, text, options: ["A — ...", ...], answer: "A" }] }

function McqSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      <div className="space-y-5">
        {(section.questions || []).map(q => {
          const selected = answers[q.qNo]
          return (
            <div key={q.qNo}>
              <p className="text-sm font-medium text-slate-800 mb-2">
                <span className="font-bold text-slate-400 mr-1.5">{q.qNo}.</span>
                {q.text}
              </p>
              <div className="space-y-1.5 ml-4">
                {(q.options || []).map((opt, i) => {
                  const letter   = String.fromCharCode(65 + i) // A B C D
                  const isSel    = selected === letter
                  const isAns    = reviewMode && letter === q.answer
                  const isWrong  = reviewMode && isSel && letter !== q.answer

                  return (
                    <div
                      key={letter}
                      onClick={() => !reviewMode && onChange(q.qNo, letter)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border-[1.5px] text-sm transition-all
                        ${reviewMode ? 'cursor-default' : 'cursor-pointer'}
                        ${isAns   ? 'bg-green-50 border-green-400 text-green-800'
                        : isWrong ? 'bg-red-50 border-red-400 text-red-700'
                        : isSel   ? 'bg-blue-50 border-blue-400 text-blue-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all
                        ${isAns   ? 'border-green-500 bg-green-500 text-white'
                        : isWrong ? 'border-red-500 bg-red-500 text-white'
                        : isSel   ? 'border-blue-500 bg-blue-500 text-white'
                                  : 'border-slate-300 text-slate-400'}`}>
                        {letter}
                      </div>
                      <span>{opt}</span>
                      {isAns && !isSel && (
                        <span className="ml-auto text-green-600 text-xs font-bold">✓ Correct</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </SectionWrapper>
  )
}

// ─── 4. FILL SECTION ──────────────────────────────────────────────
// Complete a sentence with one blank
// Firestore shape:
// { type: "fill", heading, instruction, questions: [{ qNo, before, after, answer }] }
// Example: before="The student's number is", after="on the register", answer="A4872"

function FillSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      <div className="space-y-3">
        {(section.questions || []).map(q => (
          <div key={q.qNo} className="flex items-center gap-1.5 flex-wrap text-sm text-slate-700">
            <span className="text-xs font-bold text-slate-400">{q.qNo}.</span>
            {q.before && <span>{q.before}</span>}
            <input
              type="text"
              value={answers[q.qNo] || ''}
              onChange={e => onChange(q.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder="…"
              className={inputClass(q.qNo, answers, q.answer, reviewMode)}
            />
            {q.after && <span>{q.after}</span>}
            <CorrectAnswerHint qNo={q.qNo} answers={answers} correctAnswer={q.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

// ─── 5. NOTES SECTION ─────────────────────────────────────────────
// Note/summary completion — free text with gaps marked as blanks
// Firestore shape:
// { type: "notes", heading, instruction, title, lines: [{ text, fields: [{ qNo, answer, position }] }] }

function NotesSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      {section.title && (
        <p className="font-bold text-slate-700 text-sm mb-3 underline">{section.title}</p>
      )}
      <div className="space-y-2">
        {(section.lines || []).map((line, li) => (
          <NoteLine
            key={li}
            line={line}
            answers={answers}
            onChange={onChange}
            reviewMode={reviewMode}
          />
        ))}
      </div>
    </SectionWrapper>
  )
}

function NoteLine({ line, answers, onChange, reviewMode }) {
  // A line can be plain text mixed with input gaps
  // fields array: [{ qNo, answer, placeholder }]
  if (!line.fields || line.fields.length === 0) {
    return <p className="text-sm text-slate-700 ml-3">{line.text}</p>
  }

  // Split text around __ markers and inject inputs
  const parts = (line.text || '').split('__')
  return (
    <div className="flex items-center flex-wrap gap-1 text-sm text-slate-700 ml-3">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          <span>{part}</span>
          {i < line.fields.length && (() => {
            const field = line.fields[i]
            return (
              <>
                <span className="text-[10px] font-bold text-slate-400">{field.qNo}.</span>
                <input
                  type="text"
                  value={answers[field.qNo] || ''}
                  onChange={e => onChange(field.qNo, e.target.value)}
                  readOnly={reviewMode}
                  placeholder="…"
                  className={inputClass(field.qNo, answers, field.answer, reviewMode)}
                />
                <CorrectAnswerHint qNo={field.qNo} answers={answers} correctAnswer={field.answer} reviewMode={reviewMode} />
              </>
            )
          })()}
        </span>
      ))}
    </div>
  )
}

// ─── 6. MAP / DIAGRAM SECTION ─────────────────────────────────────
// Image with labeled inputs below
// Firestore shape:
// { type: "map", heading, instruction, imageUrl, imageAlt, questions: [{ qNo, label, answer }] }

function MapSection({ section, answers, onChange, reviewMode }) {
  return (
    <SectionWrapper section={section}>
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.imageAlt || 'Diagram'}
          className="max-w-full rounded-lg border border-slate-200 mb-4"
        />
      )}
      <div className="space-y-2">
        {(section.questions || []).map(q => (
          <div key={q.qNo} className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-xs font-bold text-slate-400 w-5">{q.qNo}.</span>
            {q.label && (
              <span className="text-slate-600 min-w-[80px]">{q.label}</span>
            )}
            <input
              type="text"
              value={answers[q.qNo] || ''}
              onChange={e => onChange(q.qNo, e.target.value)}
              readOnly={reviewMode}
              placeholder="…"
              className={inputClass(q.qNo, answers, q.answer, reviewMode)}
            />
            <CorrectAnswerHint qNo={q.qNo} answers={answers} correctAnswer={q.answer} reviewMode={reviewMode} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

// ─── 7. MATCHING SECTION ──────────────────────────────────────────
// Match items on the left to options on the right
// Firestore shape:
// { type: "matching", heading, instruction,
//   items: [{ qNo, label }],
//   options: ["A — ...", "B — ...", ...] }

function MatchingSection({ section, answers, onChange, reviewMode }) {
  const letters = (section.options || []).map((_, i) => String.fromCharCode(65 + i))

  return (
    <SectionWrapper section={section}>
      {/* Options box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Options</p>
        <div className="space-y-1">
          {(section.options || []).map((opt, i) => (
            <p key={i} className="text-sm text-slate-700">
              <span className="font-bold text-slate-500 mr-1">{letters[i]}.</span>
              {opt}
            </p>
          ))}
        </div>
      </div>

      {/* Items to match */}
      <div className="space-y-2.5">
        {(section.items || []).map(item => {
          const selected = answers[item.qNo]
          const correct  = reviewMode && selected === item.answer
          const wrong    = reviewMode && selected && selected !== item.answer

          return (
            <div key={item.qNo} className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-400 w-5">{item.qNo}.</span>
              <span className="text-sm text-slate-700 flex-1 min-w-[140px]">{item.label}</span>

              {/* Dropdown to pick letter */}
              <select
                value={selected || ''}
                onChange={e => !reviewMode && onChange(item.qNo, e.target.value)}
                disabled={reviewMode}
                className={`text-sm px-3 py-1.5 rounded-lg border-[1.5px] outline-none transition-all
                  ${correct ? 'border-green-400 bg-green-50 text-green-800'
                  : wrong   ? 'border-red-400 bg-red-50 text-red-700'
                  : selected ? 'border-blue-400 bg-blue-50 text-blue-800'
                              : 'border-slate-200 bg-white text-slate-700'}`}
              >
                <option value="">Select…</option>
                {letters.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {reviewMode && wrong && (
                <span className="text-green-600 text-xs font-semibold">
                  ✓ {item.answer}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
