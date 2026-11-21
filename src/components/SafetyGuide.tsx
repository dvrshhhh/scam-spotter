import { useState } from 'react'
import { SAFETY_PATHS, type SafetyPathId } from '../data/safetyGuide'

export function SafetyGuide() {
  const [activeId, setActiveId] = useState<SafetyPathId>('suspicious-message')
  const active = SAFETY_PATHS.find((path) => path.id === activeId) ?? SAFETY_PATHS[0]

  return (
    <section className="animate-rise space-y-6" aria-labelledby="safety-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <h2
          id="safety-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Safety guide
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Calm next steps for common situations. Contact organizations through
          official apps, websites, or numbers you already trust. This guide does
          not list emergency numbers because those vary by country.
        </p>
      </div>

      <div
        className="flex flex-col gap-0 border border-line sm:flex-row"
        role="tablist"
        aria-label="Safety situations"
      >
        {SAFETY_PATHS.map((path, index) => {
          const selected = path.id === active.id
          return (
            <button
              key={path.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(path.id)}
              className={`flex-1 px-4 py-3 text-left transition ${
                index > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : ''
              } ${
                selected
                  ? 'bg-brand text-sheet'
                  : 'bg-white text-ink hover:bg-paper'
              }`}
            >
              <span className="block font-display text-sm font-bold">
                {path.title}
              </span>
              <span
                className={`mt-1 block text-xs leading-snug ${
                  selected ? 'text-paper/85' : 'text-ink-soft'
                }`}
              >
                {path.summary}
              </span>
            </button>
          )
        })}
      </div>

      <article
        className="sheet px-5 py-6 sm:px-7"
        role="tabpanel"
        aria-labelledby="safety-path-title"
      >
        <h3
          id="safety-path-title"
          className="font-display text-xl font-bold text-ink"
        >
          {active.title}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">{active.summary}</p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-muted">
          {active.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">
          Prefer official apps and websites you open yourself. For possible
          account or payment exposure, contact your bank or service provider
          directly through a channel you already trust.
        </p>
      </article>
    </section>
  )
}
