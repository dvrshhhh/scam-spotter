import { useId, useState } from 'react'
import type { CheckResult } from '../detection/types'
import { NextSteps } from './NextSteps'
import { ScoreExplain } from './ScoreExplain'
import { ScoreMeter } from './ScoreMeter'
import { WarningList } from './WarningList'

interface RiskResultProps {
  result: CheckResult
  onInspectLinks?: () => void
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

export function RiskResult({ result, onInspectLinks }: RiskResultProps) {
  const [showDetails, setShowDetails] = useState(false)
  const detailsId = useId()
  const style = LEVEL_STYLES[result.riskLevel]

  return (
    <section className="animate-rise space-y-6" aria-labelledby="result-heading">
      <div className={`sheet overflow-hidden ${style.tint}`}>
        <div className={`h-1.5 w-full ${style.bar}`} aria-hidden="true" />
        <div className="grid gap-6 px-5 py-6 sm:grid-cols-[0.85fr_1.15fr] sm:items-center sm:px-6">
          <ScoreMeter
            score={result.score}
            riskLevel={result.riskLevel}
            riskLabel={result.riskLabel}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {style.mark}
            </p>
            <h2
              id="result-heading"
              className={`font-display mt-1 text-3xl font-extrabold tracking-tight ${style.text}`}
            >
              {result.riskLabel}
            </h2>
            <p className="sr-only">{style.patternLabel}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {result.summary}
            </p>
            <p className="mt-3 text-sm text-ink">
              Not proof the message is safe or a scam. Common warning signs only.
            </p>
          </div>
        </div>
      </div>

      {result.patterns.length > 0 && (
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Likely patterns
          </h3>
          <ul className="mt-2 space-y-2">
            {result.patterns.map((pattern) => (
              <li key={pattern.id} className="border-l-4 border-signal pl-3">
                <p className="text-sm font-semibold text-ink">{pattern.label}</p>
                <p className="text-sm text-ink-muted">{pattern.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.extractedHosts.length > 0 && (
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Hostnames found
          </h3>
          <p className="mt-1 font-mono text-sm text-ink-muted">
            {result.extractedHosts.join(' · ')}
          </p>
          {onInspectLinks && (
            <button
              type="button"
              onClick={onInspectLinks}
              className="mt-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Inspect these links
            </button>
          )}
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Warning signs
          </h3>
          <div className="mt-3">
            <WarningList signals={result.signals} />
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Next steps
          </h3>
          <div className="mt-3">
            <NextSteps steps={result.nextSteps} />
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          aria-expanded={showDetails}
          aria-controls={detailsId}
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? 'Hide score details' : 'Show score details'}
        </button>
        {showDetails && (
          <div id={detailsId} className="mt-4 space-y-4">
            <ScoreExplain result={result} />
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink-muted">
              {result.scoringNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
