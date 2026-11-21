import { EXAMPLE_MESSAGES, type ExampleKind } from '../data/examples'

interface ExampleButtonsProps {
  onLoad: (kind: ExampleKind) => void
  activeId?: ExampleKind | null
}

export function ExampleButtons({ onLoad, activeId }: ExampleButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="example-select" className="text-sm font-medium text-ink-muted">
        Try an example
      </label>
      <select
        id="example-select"
        value={activeId ?? ''}
        onChange={(event) => {
          const value = event.target.value as ExampleKind | ''
          if (!value) return
          onLoad(value)
        }}
        className="min-h-11 w-full max-w-md border border-line bg-white px-3 text-sm text-ink"
      >
        <option value="">Choose a sample message…</option>
        {EXAMPLE_MESSAGES.map((example) => (
          <option key={example.id} value={example.id}>
            {example.label}
            {example.region === 'india' ? ' (India)' : ''} — {example.description}
          </option>
        ))}
      </select>
    </div>
  )
}
