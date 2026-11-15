import { EXAMPLE_MESSAGES, type ExampleKind } from '../data/examples'

interface ExampleButtonsProps {
  onLoad: (kind: ExampleKind) => void
  activeId?: ExampleKind | null
}

export function ExampleButtons({ onLoad, activeId }: ExampleButtonsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-base font-semibold text-ink">
        Load example
      </legend>
      <p className="text-sm text-ink-soft">
        Try one of three sample messages: ordinary, suspicious, or uncertain.
      </p>
      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Example messages">
        {EXAMPLE_MESSAGES.map((example) => {
          const isActive = activeId === example.id
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => onLoad(example.id)}
              aria-pressed={isActive}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-brand bg-brand-soft shadow-[0_0_0_1px_rgba(15,76,70,0.15)]'
                  : 'border-line bg-panel hover:border-brand/35'
              }`}
            >
              <span className="block font-display text-sm font-semibold text-ink">
                {example.label}
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink-soft">
                {example.description}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
