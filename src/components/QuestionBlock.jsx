export default function QuestionBlock({ question, answer, onChange, reviewMode }) {
  const isCorrect = reviewMode
    ? question.type === 'mcq'
      ? answer === Number(question.answer)
      : typeof answer === 'string' &&
        answer.trim().toLowerCase() === String(question.answer).toLowerCase()
    : null

  return (
    <div className={`card p-4 transition-all ${
      reviewMode
        ? isCorrect ? 'border-green-300 bg-green-50/40' : 'border-red-300 bg-red-50/30'
        : answer !== undefined && answer !== ''
          ? 'border-green-300'
          : 'border-slate-200'
    }`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Question {question.questionNo} of 40
        {reviewMode && (
          <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </p>
      <p className="text-[13.5px] text-slate-800 mb-3 leading-snug">{question.text}</p>

      {question.type === 'mcq' ? (
        <div className="space-y-2">
          {(question.options || []).map((opt, i) => {
            const isSelected = answer === i
            const isAnswerKey = reviewMode && i === Number(question.answer)
            const isWrong     = reviewMode && isSelected && !isCorrect

            return (
              <div
                key={i}
                onClick={() => !reviewMode && onChange(i)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-[1.5px] text-[13px] transition-all
                  ${reviewMode ? 'cursor-default' : 'cursor-pointer'}
                  ${isAnswerKey
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : isWrong
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isAnswerKey
                    ? 'border-green-500 bg-green-500'
                    : isWrong
                      ? 'border-red-500 bg-red-500'
                      : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                  }`}
                >
                  {(isSelected || isAnswerKey) && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span>{opt}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={answer || ''}
            onChange={e => !reviewMode && onChange(e.target.value)}
            readOnly={reviewMode}
            placeholder="Type your answer here…"
            className={`input ${
              reviewMode
                ? isCorrect
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : 'border-red-400 bg-red-50 text-red-700'
                : ''
            }`}
          />
          {reviewMode && !isCorrect && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ Correct answer: <span className="font-bold">{question.answer}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
