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
        <span className="text-sm text-ink-soft" aria-live="polite">
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
        className="w-full resize-y border border-line bg-white px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-soft/80"
        spellCheck
        autoComplete="off"
        disabled={disabled}
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onCheck}
          disabled={disabled || value.trim().length === 0}
          className="inline-flex min-h-11 items-center justify-center bg-brand px-5 text-sm font-semibold text-sheet transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-ink-soft"
        >
          Check message
        </button>
        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            Clear
          </button>
        )}
        <p className="text-sm text-ink-soft">Stays in your browser. Nothing is uploaded.</p>
      </div>
    </div>
  )
}
