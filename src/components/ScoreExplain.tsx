import type { CheckResult } from '../detection/types'

interface ScoreExplainProps {
  result: CheckResult
}

export function ScoreExplain({ result }: ScoreExplainProps) {
  const { breakdown, improveTip, score } = result

  return (
    <div className="sheet animate-fade px-5 py-5 sm:px-6">
      <h3 className="font-display text-lg font-bold text-ink">
        Why this score
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Transparent breakdown of weights and bonuses
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-white px-3 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Raw weights
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold text-ink">
            {breakdown.raw}
          </dd>
        </div>
        <div className="border border-line bg-white px-3 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Diversity bonus
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold text-ink">
            +{breakdown.diversityBonus}
          </dd>
        </div>
        <div className="border border-line bg-white px-3 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Combo bonus
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold text-ink">
            +{breakdown.comboBonus}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm font-medium text-ink">
        Final: {score}/100
        {breakdown.categories.length > 0 && (
          <span className="font-normal text-ink-soft">
            {' '}
            across {breakdown.categories.join(', ')}
          </span>
        )}
      </p>

      {breakdown.comboHits.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink">Dangerous combos that fired</p>
          <ul className="mt-2 space-y-2">
            {breakdown.comboHits.map((hit) => (
              <li
                key={hit}
                className="border-l-4 border-signal bg-signal-soft/40 px-3 py-2 text-sm text-ink-muted"
              >
                {hit}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-muted">
          No dangerous combo bonus. Combos fire when known stacks appear together
          (for example credentials + urgency).
        </p>
      )}

      <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">What this means: </span>
        {improveTip}
      </p>
    </div>
  )
}
