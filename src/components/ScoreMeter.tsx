import type { RiskLevel } from '../detection/types'

interface ScoreMeterProps {
  score: number
  riskLevel: RiskLevel
  riskLabel: string
}

const RISK_FILL: Record<RiskLevel, string> = {
  low: 'bg-risk-low',
  review: 'bg-risk-mid',
  high: 'bg-risk-high',
}

const RISK_MARK: Record<RiskLevel, string> = {
  low: '■■□',
  review: '■■■',
  high: '▣▣▣',
}

/** Horizontal 0 to 100 meter. Color is paired with text label and mark pattern. */
export function ScoreMeter({ score, riskLevel, riskLabel }: ScoreMeterProps) {
  const progress = Math.max(0, Math.min(100, score))

  return (
    <div
      className="w-full max-w-sm"
      role="img"
      aria-label={`Risk score ${score} out of 100: ${riskLabel}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-extrabold tracking-tight text-ink tabular-nums sm:text-5xl">
            {score}
            <span className="ml-1 text-lg font-semibold text-ink-soft">/100</span>
          </p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-ink-soft">
            Score meter
          </p>
        </div>
        <p
          className="font-display text-lg font-bold tracking-widest text-ink-soft"
          aria-hidden="true"
        >
          {RISK_MARK[riskLevel]}
        </p>
      </div>
      <div className="mt-4 h-3 w-full origin-left bg-line">
        <div
          className={`animate-bar h-full origin-left ${RISK_FILL[riskLevel]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-medium text-ink-soft">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}
