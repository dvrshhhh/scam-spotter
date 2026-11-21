import { useState } from 'react'
import { SAFETY_PATHS, type SafetyPathId } from '../data/safetyGuide'

export function SafetyGuide() {
  const [activeId, setActiveId] = useState<SafetyPathId>('suspicious-message')
  const active = SAFETY_PATHS.find((path) => path.id === activeId) ?? SAFETY_PATHS[0]

  return (
    <section className="animate-rise space-y-6" aria-labelledby="safety-heading">
      <div className="sheet px-5 py-6 sm:px-6">
        <h2
          id="safety-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Safety guide
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Calm next steps. Contact organizations through official apps or sites
          you already trust. No emergency numbers are listed — those vary by country.
        </p>

        <label htmlFor="safety-path" className="mt-6 block text-sm font-semibold text-ink">
          What happened?
        </label>
        <select
          id="safety-path"
          value={active.id}
          onChange={(event) => setActiveId(event.target.value as SafetyPathId)}
          className="mt-2 min-h-11 w-full max-w-xl border border-line bg-white px-3 text-sm text-ink"
        >
          {SAFETY_PATHS.map((path) => (
            <option key={path.id} value={path.id}>
              {path.title}
            </option>
          ))}
        </select>
      </div>

      <article className="sheet px-5 py-6 sm:px-6" aria-labelledby="safety-path-title">
        <h3 id="safety-path-title" className="font-display text-xl font-bold text-ink">
          {active.title}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">{active.summary}</p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-muted">
          {active.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </article>
    </section>
  )
}
