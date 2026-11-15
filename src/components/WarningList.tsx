import type { DetectedSignal } from '../detection/types'

interface WarningListProps {
  signals: DetectedSignal[]
}

export function WarningList({ signals }: WarningListProps) {
  if (signals.length === 0) {
    return (
      <div className="border border-dashed border-line bg-paper/60 px-4 py-4 text-sm text-ink-muted">
        <p className="font-semibold text-ink">No warning signs matched</p>
        <p className="mt-1 leading-relaxed">
          The rule-based checker did not find common scam patterns. Novel
          wording can still be harmful. Verify unexpected requests yourself.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-line border-y border-line" aria-label="Detected warning signs">
      {signals.map((signal) => (
        <li key={signal.ruleId} className="py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-bold text-ink">
              {signal.title}
            </h3>
            <span className="text-xs font-semibold tabular-nums text-ink-soft">
              weight +{signal.weight}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {signal.explanation}
          </p>
          <p className="mt-2 border-l-2 border-signal pl-3 text-sm">
            <span className="font-semibold text-ink">Matched: </span>
            <q className="break-words text-ink-muted">{signal.matchedText}</q>
          </p>
        </li>
      ))}
    </ul>
  )
}
