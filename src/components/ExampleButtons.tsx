import { EXAMPLE_MESSAGES, type ExampleKind } from '../data/examples'

interface ExampleButtonsProps {
  onLoad: (kind: ExampleKind) => void
  activeId?: ExampleKind | null
}

export function ExampleButtons({ onLoad, activeId }: ExampleButtonsProps) {
  const general = EXAMPLE_MESSAGES.filter((item) => item.region !== 'india')
  const india = EXAMPLE_MESSAGES.filter((item) => item.region === 'india')

  return (
    <div className="space-y-6">
      <ExampleGroup
        title="Load example"
        description="Ordinary, uncertain, or clearly suspicious samples."
        examples={general}
        activeId={activeId}
        onLoad={onLoad}
      />
      <ExampleGroup
        title="India-focused examples"
        description="KYC, UPI, and courier fee patterns useful for local demos."
        examples={india}
        activeId={activeId}
        onLoad={onLoad}
      />
    </div>
  )
}

function ExampleGroup({
  title,
  description,
  examples,
  activeId,
  onLoad,
}: {
  title: string
  description: string
  examples: typeof EXAMPLE_MESSAGES
  activeId?: ExampleKind | null
  onLoad: (kind: ExampleKind) => void
}) {
  return (
    <fieldset>
      <legend className="font-display text-base font-bold text-ink">{title}</legend>
      <p className="mt-1 text-sm text-ink-soft">{description}</p>
      <div
        className="mt-4 flex flex-col gap-0 border-y border-line sm:flex-row sm:flex-wrap"
        role="group"
        aria-label={title}
      >
        {examples.map((example, index) => {
          const isActive = activeId === example.id
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => onLoad(example.id)}
              aria-pressed={isActive}
              className={`flex-1 min-w-[10rem] px-4 py-3 text-left transition ${
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
