import { useMemo, useState } from 'react'
import { QUIZ_SAMPLES } from '../data/quiz'

type Answer = 'suspicious' | 'ordinary' | null

export function LearnPractice() {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const sample = QUIZ_SAMPLES[index]
  const revealed = answer !== null
  const correct =
    answer === null
      ? null
      : (answer === 'suspicious') === sample.isSuspicious

  const progressLabel = useMemo(
    () => `Sample ${index + 1} of ${QUIZ_SAMPLES.length}`,
    [index],
  )

  function choose(choice: 'suspicious' | 'ordinary') {
    if (answer !== null || finished) return
    setAnswer(choice)
    const isCorrect = (choice === 'suspicious') === sample.isSuspicious
    setAnsweredCount((count) => count + 1)
    if (isCorrect) setScore((value) => value + 1)
  }

  function next() {
    if (index >= QUIZ_SAMPLES.length - 1) {
      setFinished(true)
      return
    }
    setIndex((value) => value + 1)
    setAnswer(null)
  }

  function restart() {
    setIndex(0)
    setAnswer(null)
    setScore(0)
    setAnsweredCount(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <section className="animate-rise space-y-6" aria-labelledby="learn-heading">
        <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
          <h2
            id="learn-heading"
            className="font-display text-2xl font-extrabold tracking-tight text-ink"
          >
            Practise results
          </h2>
          <p className="mt-3 font-display text-3xl font-bold text-ink">
            {score} / {QUIZ_SAMPLES.length}
          </p>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Educational score only. Real messages can be ambiguous, and this
            quiz cannot prove what is safe in the wild.
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-6 min-h-11 border border-brand bg-brand px-4 text-sm font-semibold text-sheet transition hover:bg-brand-deep"
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-rise space-y-6" aria-labelledby="learn-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <h2
          id="learn-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Learn and practise
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          All samples below are <strong className="text-ink">educational
          examples</strong>. Decide whether each one looks suspicious, then
          reveal the clues and reasoning.
        </p>
        <p className="mt-4 text-sm font-medium text-ink">
          {progressLabel}
          {answeredCount > 0 && (
            <span className="text-ink-soft">
              {' '}
              · Score so far {score}/{answeredCount}
            </span>
          )}
        </p>
      </div>

      <article className="sheet px-5 py-6 sm:px-7" aria-labelledby="sample-label">
        <p className="text-xs font-semibold uppercase tracking-wide text-signal">
          Educational example · {sample.label}
        </p>
        <h3 id="sample-label" className="sr-only">
          Sample message
        </h3>
        <blockquote className="mt-3 border-l-4 border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
          {sample.text}
        </blockquote>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-ink">
            Does this look suspicious?
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => choose('suspicious')}
              disabled={revealed}
              aria-pressed={answer === 'suspicious'}
              className="min-h-11 bg-brand px-4 text-sm font-semibold text-sheet transition hover:bg-brand-deep disabled:cursor-default disabled:opacity-70"
            >
              Suspicious
            </button>
            <button
              type="button"
              onClick={() => choose('ordinary')}
              disabled={revealed}
              aria-pressed={answer === 'ordinary'}
              className="min-h-11 border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink disabled:cursor-default disabled:opacity-70"
            >
              Ordinary
            </button>
          </div>
        </fieldset>

        {revealed && (
          <div className="animate-fade mt-6 border-t border-line pt-5" role="status">
            <p
              className={`font-display text-lg font-bold ${
                correct ? 'text-risk-low' : 'text-risk-mid'
              }`}
            >
              {correct ? 'Good read' : 'Not quite'} · Answer:{' '}
              {sample.isSuspicious ? 'suspicious' : 'ordinary'}
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              Pattern: {sample.patternLabel}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {sample.explanation}
            </p>
            <h4 className="mt-4 text-sm font-semibold text-ink">Clues</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {sample.clues.map((clue) => (
                <li key={clue}>{clue}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={next}
              className="mt-6 min-h-11 border border-brand bg-brand px-4 text-sm font-semibold text-sheet transition hover:bg-brand-deep"
            >
              {index >= QUIZ_SAMPLES.length - 1 ? 'See score' : 'Next sample'}
            </button>
          </div>
        )}
      </article>
    </section>
  )
}
