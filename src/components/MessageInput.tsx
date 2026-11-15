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
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <label
          htmlFor="message-input"
          className="font-display text-lg font-semibold text-ink"
        >
          Paste a message to check
        </label>
        <span className="text-xs font-medium text-ink-soft" aria-live="polite">
          {charCount.toLocaleString()} characters
        </span>
      </div>

      <textarea
        id="message-input"
        name="message"
        rows={8}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an SMS, email body, or chat message here…"
        className="w-full resize-y rounded-2xl border border-line bg-panel px-4 py-3 text-base leading-relaxed text-ink shadow-[inset_0_1px_2px_rgba(15,76,70,0.04)] placeholder:text-ink-soft/70 focus-visible:border-accent"
        spellCheck
        autoComplete="off"
        disabled={disabled}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Checking runs entirely in your browser. Nothing is uploaded.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-panel px-4 text-sm font-semibold text-ink-muted transition hover:border-brand/30 hover:text-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCheck}
            disabled={disabled || value.trim().length === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,76,70,0.8)] transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-brand/40 disabled:shadow-none"
          >
            Check message
          </button>
        </div>
      </div>
    </div>
  )
}
