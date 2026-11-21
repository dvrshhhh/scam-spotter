import { useState } from 'react'
import { SAFETY_TIPS, SCAM_GUIDE } from '../data/scamGuide'

export function LearnGuide() {
  const [openId, setOpenId] = useState<string | null>(SCAM_GUIDE[0]?.id ?? null)

  return (
    <section className="animate-rise space-y-8" aria-labelledby="learn-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <h2
          id="learn-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Common scam types
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          A quick guide for demos and viva: what these scams look like, red
          flags, and safer habits. Focus includes patterns often seen in India
          (KYC, UPI, courier fees) plus global phishing tactics.
        </p>
      </div>

      <div className="space-y-3">
        {SCAM_GUIDE.map((item) => {
          const open = openId === item.id
          return (
            <article key={item.id} className="sheet overflow-hidden">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-white sm:px-6"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>
                  <span className="font-display text-lg font-bold text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {item.summary}
                  </span>
                </span>
                <span className="mt-1 text-sm font-semibold text-signal" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="animate-fade border-t border-line bg-white px-5 py-5 sm:px-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                        Red flags
                      </h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-ink-muted">
                        {item.redFlags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                        Do this instead
                      </h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-ink-muted">
                        {item.doInstead.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      <aside className="border-l-4 border-signal bg-white px-5 py-5" aria-labelledby="tips-heading">
        <h2 id="tips-heading" className="font-display text-lg font-bold text-ink">
          Quick safety tips
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
          {SAFETY_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
