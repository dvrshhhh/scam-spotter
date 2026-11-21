import type { RiskLevel, SignalCategory } from '../detection/types'

export interface SavedScanMeta {
  savedAt: string
  riskLevel: RiskLevel
  riskLabel: string
  /** Warning-sign categories only. Never store message text. */
  categories: SignalCategory[]
}

interface ScanHistoryProps {
  enabled: boolean
  scans: SavedScanMeta[]
  onEnable: () => void
  onDisable: () => void
  onClear: () => void
}

const RISK_TEXT = {
  low: 'text-risk-low',
  review: 'text-risk-mid',
  high: 'text-risk-high',
} as const

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ScanHistory({
  enabled,
  scans,
  onEnable,
  onDisable,
  onClear,
}: ScanHistoryProps) {
  return (
    <section
      className="sheet px-5 py-5 sm:px-6"
      aria-labelledby="history-heading"
    >
      <h2 id="history-heading" className="font-display text-lg font-bold text-ink">
        Optional scan history
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        History is <strong className="text-ink">off by default</strong>. When
        you enable it, this browser stores only the date, risk level, and
        warning-sign categories. The original message text is never saved.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {!enabled ? (
          <button
            type="button"
            onClick={onEnable}
            className="min-h-10 border border-brand bg-brand px-3 text-sm font-semibold text-sheet transition hover:bg-brand-deep"
          >
            Enable local history
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onDisable}
              className="min-h-10 border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
            >
              Disable history
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={scans.length === 0}
              className="min-h-10 border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear history
            </button>
          </>
        )}
      </div>

      {enabled && scans.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          No saved summaries yet. After a check, use “Save this scan locally”.
        </p>
      )}

      {enabled && scans.length > 0 && (
        <ul className="mt-4 space-y-3">
          {scans.map((scan) => (
            <li
              key={`${scan.savedAt}-${scan.riskLabel}`}
              className="border border-line bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`font-display text-base font-bold ${RISK_TEXT[scan.riskLevel]}`}>
                  {scan.riskLabel}
                </p>
                <p className="text-xs text-ink-soft">{formatWhen(scan.savedAt)}</p>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Categories:{' '}
                {scan.categories.length > 0
                  ? scan.categories.join(', ')
                  : 'none'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
