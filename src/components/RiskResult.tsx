import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import type { CheckResult } from '../detection/types'
import { NextSteps } from './NextSteps'
import { ScoreMeter } from './ScoreMeter'
import { WarningList } from './WarningList'

interface RiskResultProps {
  result: CheckResult
}

const LEVEL_STYLES = {
  low: {
    bar: 'bg-risk-low',
    tint: 'bg-risk-low-bg',
    text: 'text-risk-low',
    mark: 'Low',
    patternLabel: 'Pattern mark: solid bar, low',
  },
  review: {
    bar: 'bg-risk-mid',
    tint: 'bg-risk-mid-bg',
    text: 'text-risk-mid',
    mark: 'Review',
    patternLabel: 'Pattern mark: hashed bar, review',
  },
  high: {
    bar: 'bg-risk-high',
    tint: 'bg-risk-high-bg',
    text: 'text-risk-high',
    mark: 'High',
    patternLabel: 'Pattern mark: dense bar, high',
  },
} as const

export function RiskResult({ result }: RiskResultProps) {
  const [showScoring, setShowScoring] = useState(false)
  const detailsId = useId()
  const style = LEVEL_STYLES[result.riskLevel]

  return (
    <section className="animate-rise space-y-8" aria-labelledby="result-heading">
      <div className={`sheet overflow-hidden ${style.tint}`}>
        <div className={`h-1.5 w-full ${style.bar}`} aria-hidden="true" />
        <div className="grid gap-8 px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <ScoreMeter
            score={result.score}
            riskLevel={result.riskLevel}
            riskLabel={result.riskLabel}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Assessment · {style.mark}
            </p>
            <h2
              id="result-heading"
              className={`font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${style.text}`}
            >
              {result.riskLabel}
            </h2>
            <p className="sr-only">{style.patternLabel}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              {result.summary}
            </p>
            <p className="mt-4 text-sm font-medium text-ink">
              Educational aid only. This is not proof a message is genuine or a scam.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            Warning signs
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Why each signal affected this score
          </p>
          <div className="mt-4">
            <WarningList signals={result.signals} />
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            Safe next steps
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Practical actions you can take now
          </p>
          <div className="mt-4">
            <NextSteps steps={result.nextSteps} />
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
              aria-expanded={showScoring}
              aria-controls={detailsId}
              onClick={() => setShowScoring((open) => !open)}
            >
              How scoring worked
              <ChevronDown
                className={`h-4 w-4 transition ${showScoring ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {showScoring && (
              <ul
                id={detailsId}
                className="animate-fade mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted"
              >
                {result.scoringNotes.map((note) => (
                  <li key={note} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
