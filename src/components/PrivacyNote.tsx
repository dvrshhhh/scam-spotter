import { Lock, Save } from 'lucide-react'

interface PrivacyNoteProps {
  onSaveScan?: () => void
  saveEnabled?: boolean
  saveStatus?: string | null
}

export function PrivacyNote({
  onSaveScan,
  saveEnabled = false,
  saveStatus = null,
}: PrivacyNoteProps) {
  return (
    <aside
      className="rounded-3xl border border-line bg-panel/90 p-5 shadow-[0_10px_40px_-28px_rgba(15,76,70,0.35)]"
      aria-labelledby="privacy-heading"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"
          aria-hidden="true"
        >
          <Lock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="privacy-heading"
            className="font-display text-lg font-semibold text-ink"
          >
            Privacy note
          </h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
            <li>
              Message checking is <strong className="font-semibold text-ink">local</strong>.
              Your text is analyzed in this browser with open rule-based logic—no
              server upload and no remote AI call.
            </li>
            <li>
              Contents are <strong className="font-semibold text-ink">not stored</strong> unless
              you explicitly choose to save a scan summary to this device.
            </li>
            <li>
              This checker flags common warning signs and can make mistakes. A
              low-risk result does <em>not</em> mean a message is safe.
            </li>
          </ul>

          {onSaveScan && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSaveScan}
                disabled={!saveEnabled}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink-muted transition hover:border-brand/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save this scan locally
              </button>
              {saveStatus && (
                <p className="text-sm text-brand" role="status">
                  {saveStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
