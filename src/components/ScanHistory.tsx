export interface SavedScanMeta {
  savedAt: string
  riskLevel: 'low' | 'review' | 'high'
  riskLabel: string
  score: number
  signalIds: string[]
  messagePreviewLength: number
}

interface ScanHistoryProps {
  scans: SavedScanMeta[]
  onClear: () => void
  onRefresh: () => void
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

export function ScanHistory({ scans, onClear, onRefresh }: ScanHistoryProps) {
  return (
    <section className="animate-rise space-y-6" aria-labelledby="history-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="history-heading"
              className="font-display text-2xl font-extrabold tracking-tight text-ink"
            >
              Saved scan history
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Only summaries you explicitly saved appear here. Full message text
              is not stored by default, only risk, score, rule ids, and length.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="min-h-10 border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={scans.length === 0}
              className="min-h-10 border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear history
            </button>
          </div>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="border border-dashed border-line bg-sheet/70 px-5 py-8">
          <p className="font-display text-xl font-bold text-ink">No saved scans yet</p>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Run the checker, then choose “Save this scan locally” on the Checker
            tab. History stays on this device only.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {scans.map((scan) => (
            <li key={`${scan.savedAt}-${scan.score}`} className="sheet px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`font-display text-lg font-bold ${RISK_TEXT[scan.riskLevel]}`}>
                  {scan.riskLabel} · {scan.score}/100
                </p>
                <p className="text-xs text-ink-soft">{formatWhen(scan.savedAt)}</p>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {scan.signalIds.length} warning sign
                {scan.signalIds.length === 1 ? '' : 's'}
                {scan.signalIds.length > 0
                  ? `: ${scan.signalIds.slice(0, 4).join(', ')}${
                      scan.signalIds.length > 4 ? '…' : ''
                    }`
                  : ''}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Original message length: {scan.messagePreviewLength} characters
                (text not stored)
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
