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
      className="border-l-4 border-signal bg-white px-4 py-4 sm:px-5"
      aria-labelledby="privacy-heading"
    >
      <h2
        id="privacy-heading"
        className="font-display text-base font-bold text-ink"
      >
        Privacy note
      </h2>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
        <li>
          Checking is <strong className="font-semibold text-ink">local</strong>.
          Text stays in this browser—no upload, no remote AI.
        </li>
        <li>
          Contents are{' '}
          <strong className="font-semibold text-ink">not stored</strong> unless
          you choose to save a scan summary on this device.
        </li>
        <li>
          The checker flags common warning signs and can be wrong. Low risk does
          not mean a message is safe.
        </li>
      </ul>

      {onSaveScan && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveScan}
            disabled={!saveEnabled}
            className="inline-flex min-h-10 items-center border border-line bg-sheet px-3 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save this scan locally
          </button>
          {saveStatus && (
            <p className="text-sm text-ink-muted" role="status">
              {saveStatus}
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
