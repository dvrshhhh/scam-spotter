interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onCheck: () => void
  onClear: () => void
  disabled?: boolean
}

export function MessageInput({
  value,
  onChange,
  onCheck,
  onClear,
  disabled = false,
}: MessageInputProps) {
  const charCount = value.length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label
          htmlFor="message-input"
          className="font-display text-xl font-bold tracking-tight text-ink"
        >
          Paste a message
        </label>
        <span className="text-sm text-ink-muted" aria-live="polite">
          {charCount.toLocaleString()} characters
        </span>
      </div>

      <textarea
        id="message-input"
        name="message"
        rows={8}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an SMS, email, or chat message…"
        className="w-full resize-y border border-line bg-white px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-soft"
        spellCheck
        autoComplete="off"
        disabled={disabled}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Stays in your browser. Nothing is uploaded.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {value.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ink-muted transition hover:text-ink"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onCheck}
            disabled={disabled || value.trim().length === 0}
            className="inline-flex min-h-11 items-center justify-center bg-signal px-5 text-sm font-semibold text-brand-deep transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-ink-soft disabled:text-sheet"
          >
            Check message
          </button>
        </div>
      </div>
    </div>
  )
}
