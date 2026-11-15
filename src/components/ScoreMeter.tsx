import type { CSSProperties } from 'react'
import type { RiskLevel } from '../detection/types'

interface ScoreMeterProps {
  score: number
  riskLevel: RiskLevel
  riskLabel: string
}

const RISK_STROKE: Record<RiskLevel, string> = {
  low: '#1f7a4d',
  review: '#9a6b12',
  high: '#b42318',
}

/** SVG arc meter from 0–100. Color is reinforced by label text + icon pattern. */
export function ScoreMeter({ score, riskLevel, riskLabel }: ScoreMeterProps) {
  const size = 168
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // Show three-quarter arc for a gauge feel
  const arcLength = circumference * 0.75
  const progress = Math.max(0, Math.min(100, score)) / 100
  const dashOffset = arcLength * (1 - progress)

  return (
    <div
      className="relative mx-auto flex w-[168px] flex-col items-center"
      role="img"
      aria-label={`Risk score ${score} out of 100: ${riskLabel}`}
    >
      <svg
        width={size}
        height={size * 0.78}
        viewBox={`0 0 ${size} ${size * 0.78}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <g transform={`translate(${size / 2} ${size / 2}) rotate(135)`}>
          <circle
            r={radius}
            fill="none"
            stroke="#d5e2dd"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            r={radius}
            fill="none"
            stroke={RISK_STROKE[riskLevel]}
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="animate-meter"
            style={
              {
                '--meter-circumference': arcLength,
              } as CSSProperties
            }
          />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 text-center">
        <p className="font-display text-4xl font-bold tracking-tight text-ink">
          {score}
        </p>
        <p className="text-sm font-semibold text-ink-soft">/ 100</p>
      </div>
    </div>
  )
}
