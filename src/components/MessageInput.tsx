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
          Paste a message to check
        </label>
        <span className="text-sm text-ink-soft" aria-live="polite">
          {charCount.toLocaleString()} characters
        </span>
      </div>

      <textarea
        id="message-input"
        name="message"
        rows={9}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an SMS, email body, or chat message here…"
        className="w-full resize-y border border-line bg-white px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-soft/80"
        spellCheck
        autoComplete="off"
        disabled={disabled}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Checking runs in your browser. Nothing is uploaded.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center justify-center border border-line bg-white px-4 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCheck}
            disabled={disabled || value.trim().length === 0}
            className="inline-flex min-h-11 items-center justify-center bg-brand px-5 text-sm font-semibold text-sheet transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-ink-soft"
          >
            Check message
          </button>
        </div>
      </div>
    </div>
  )
}
