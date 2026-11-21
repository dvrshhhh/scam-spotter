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
  canSave: boolean
  saveStatus: string | null
  onEnable: () => void
  onDisable: () => void
  onSave: () => void
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
  canSave,
  saveStatus,
  onEnable,
  onDisable,
  onSave,
  onClear,
}: ScanHistoryProps) {
  return (
    <details className="border border-line bg-sheet/80 px-4 py-3">
      <summary className="cursor-pointer font-display text-sm font-bold text-ink">
        Optional local history
        <span className="ml-2 font-sans text-xs font-normal text-ink-soft">
          {enabled ? 'on' : 'off'}
        </span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-line pt-3">
        <p className="text-sm text-ink-muted">
          Stored only on this device. Never stores the pasted message text.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {!enabled ? (
            <button
              type="button"
              onClick={onEnable}
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Turn on
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={!canSave}
                className="font-semibold text-brand underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-soft disabled:no-underline"
              >
                Save this result
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={scans.length === 0}
                className="text-ink-muted underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onDisable}
                className="text-ink-muted underline-offset-4 hover:underline"
              >
                Turn off
              </button>
            </>
          )}
        </div>

        {saveStatus && (
          <p className="text-sm text-ink-muted" role="status">
            {saveStatus}
          </p>
        )}

        {enabled && scans.length === 0 && (
          <p className="text-sm text-ink-soft">No saved summaries yet.</p>
        )}

        {enabled && scans.length > 0 && (
          <ul className="space-y-2">
            {scans.map((scan) => (
              <li
                key={`${scan.savedAt}-${scan.riskLabel}`}
                className="border-l-2 border-line pl-3 text-sm"
              >
                <span className={`font-semibold ${RISK_TEXT[scan.riskLevel]}`}>
                  {scan.riskLabel}
                </span>
                <span className="text-ink-soft"> · {formatWhen(scan.savedAt)}</span>
                <p className="text-ink-muted">
                  {scan.categories.length > 0
                    ? scan.categories.join(', ')
                    : 'no categories'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}
