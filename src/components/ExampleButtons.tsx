import { EXAMPLE_MESSAGES, type ExampleKind } from '../data/examples'

interface ExampleButtonsProps {
  onLoad: (kind: ExampleKind) => void
  activeId?: ExampleKind | null
}

export function ExampleButtons({ onLoad, activeId }: ExampleButtonsProps) {
  return (
    <fieldset>
      <legend className="font-display text-base font-bold text-ink">
        Load example
      </legend>
      <p className="mt-1 text-sm text-ink-soft">
        Ordinary, suspicious, or uncertain sample messages.
      </p>
      <div
        className="mt-4 flex flex-col gap-0 border-y border-line sm:flex-row"
        role="group"
        aria-label="Example messages"
      >
        {EXAMPLE_MESSAGES.map((example, index) => {
          const isActive = activeId === example.id
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => onLoad(example.id)}
              aria-pressed={isActive}
              className={`flex-1 px-4 py-3 text-left transition ${
                index > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : ''
              } ${
                isActive
                  ? 'bg-brand text-sheet'
                  : 'bg-white text-ink hover:bg-paper'
              }`}
            >
              <span className="block font-display text-sm font-bold">
                {example.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-snug ${
                  isActive ? 'text-paper/85' : 'text-ink-soft'
                }`}
              >
                {example.description}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
