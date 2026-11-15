import {
  BadgeAlert,
  BadgeCheck,
  BadgeInfo,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react'
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
    wrap: 'border-risk-low/30 bg-risk-low-bg',
    text: 'text-risk-low',
    Icon: BadgeCheck,
    patternLabel: 'Pattern: checkmark',
  },
  review: {
    wrap: 'border-risk-mid/35 bg-risk-mid-bg',
    text: 'text-risk-mid',
    Icon: BadgeInfo,
    patternLabel: 'Pattern: info',
  },
  high: {
    wrap: 'border-risk-high/35 bg-risk-high-bg',
    text: 'text-risk-high',
    Icon: BadgeAlert,
    patternLabel: 'Pattern: alert',
  },
} as const

export function RiskResult({ result }: RiskResultProps) {
  const [showScoring, setShowScoring] = useState(false)
  const detailsId = useId()
  const style = LEVEL_STYLES[result.riskLevel]
  const Icon = style.Icon

  return (
    <section
      className="animate-rise space-y-5"
      aria-labelledby="result-heading"
    >
      <div className={`rounded-3xl border px-5 py-5 sm:px-6 ${style.wrap}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreMeter
            score={result.score}
            riskLevel={result.riskLevel}
            riskLabel={result.riskLabel}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Assessment
            </p>
            <div className={`mt-2 flex flex-wrap items-center gap-2 ${style.text}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
              <h2
                id="result-heading"
                className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {result.riskLabel}
              </h2>
            </div>
            <p className="sr-only">{style.patternLabel}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              {result.summary}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-panel/70 px-3 py-1 text-xs font-semibold text-ink-soft">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Educational aid — not proof a message is genuine or a scam
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel p-5 shadow-[0_10px_40px_-28px_rgba(15,76,70,0.45)]">
          <h3 className="font-display text-lg font-semibold text-ink">
            Warning signs
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Why each signal affected this score
          </p>
          <div className="mt-4">
            <WarningList signals={result.signals} />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-panel p-5 shadow-[0_10px_40px_-28px_rgba(15,76,70,0.45)]">
          <h3 className="font-display text-lg font-semibold text-ink">
            Safe next steps
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Practical actions you can take right now
          </p>
          <div className="mt-4">
            <NextSteps steps={result.nextSteps} />
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-deep"
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
                className="animate-fade mt-3 space-y-2 text-sm text-ink-muted"
              >
                {result.scoringNotes.map((note) => (
                  <li key={note} className="leading-relaxed">
                    • {note}
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
