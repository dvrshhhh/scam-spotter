import { AlertTriangle, Info } from 'lucide-react'
import type { DetectedSignal } from '../detection/types'

interface WarningListProps {
  signals: DetectedSignal[]
}

export function WarningList({ signals }: WarningListProps) {
  if (signals.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-brand-soft/40 px-4 py-4 text-sm text-ink-muted">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">No warning signs matched</p>
            <p className="mt-1 leading-relaxed">
              The rule-based checker did not find common scam patterns. Novel
              wording can still be harmful—verify unexpected requests yourself.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Detected warning signs">
      {signals.map((signal) => (
        <li
          key={signal.ruleId}
          className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-[0_1px_0_rgba(15,76,70,0.04)]"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-risk-mid-bg text-risk-mid"
              aria-hidden="true"
            >
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="font-display text-base font-semibold text-ink">
                  {signal.title}
                </h3>
                <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-ink-soft">
                  weight +{signal.weight}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {signal.explanation}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-ink">Matched: </span>
                <q className="break-words text-ink-muted">{signal.matchedText}</q>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
