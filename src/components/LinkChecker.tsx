import { useId, useState } from 'react'
import {
  analyzeUrlsInText,
  URL_REASON_LABELS,
  type UrlFinding,
} from '../detection/urlSignals'

const SAMPLES = [
  'https://bit.ly/track991',
  'https://paypa1-secure-login.xyz/verify',
  'https://www.wikipedia.org/wiki/Phishing',
]

export function LinkChecker() {
  const [input, setInput] = useState('')
  const [findings, setFindings] = useState<UrlFinding[] | null>(null)
  const [status, setStatus] = useState(
    'Paste a link or a short message that contains a URL, then check it locally.',
  )
  const inputId = useId()
  const resultId = useId()

  function runCheck() {
    const trimmed = input.trim()
    if (!trimmed) {
      setFindings(null)
      setStatus('Enter a URL or text that includes a link first.')
      return
    }
    const next = analyzeUrlsInText(trimmed)
    setFindings(next)
    if (next.length === 0) {
      setStatus('No URL detected in that text.')
      return
    }
    const risky = next.filter((f) => f.reasons.length > 0).length
    setStatus(
      risky > 0
        ? `Found ${next.length} link${next.length === 1 ? '' : 's'}; ${risky} look suspicious under local heuristics.`
        : `Found ${next.length} link${next.length === 1 ? '' : 's'}; no high-risk heuristics matched. Still verify unexpected links.`,
    )
  }

  return (
    <section className="animate-rise space-y-6" aria-labelledby="link-check-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <h2
          id="link-check-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Link safety helper
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Inspect a URL with the same local heuristics used by the message
          checker. Nothing is uploaded. This does not visit the page or prove a
          site is safe.
        </p>

        <label htmlFor={inputId} className="mt-6 block text-sm font-semibold text-ink">
          URL or text containing a link
        </label>
        <textarea
          id={inputId}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-sm text-ink outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          placeholder="https://example.com/login or paste a short SMS with a link"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runCheck}
            className="min-h-11 border border-brand bg-brand px-4 text-sm font-semibold text-sheet transition hover:bg-brand-deep"
          >
            Check link
          </button>
          <button
            type="button"
            onClick={() => {
              setInput('')
              setFindings(null)
              setStatus('Cleared. Paste another link when ready.')
            }}
            className="min-h-11 border border-line bg-white px-4 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Sample links">
          {SAMPLES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setInput(sample)}
              className="border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink hover:text-ink"
            >
              {sample.replace(/^https?:\/\//, '')}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-soft" role="status">
        {status}
      </p>

      {findings && (
        <div id={resultId} className="space-y-4">
          {findings.map((finding) => {
            const risky = finding.reasons.length > 0
            return (
              <article
                key={finding.url}
                className={`sheet px-5 py-5 ${
                  risky ? 'bg-risk-mid-bg/50' : 'bg-risk-low-bg/40'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {risky ? 'Caution signals found' : 'No high-risk heuristics'}
                </p>
                <p className="mt-2 break-all font-display text-base font-bold text-ink">
                  {finding.url}
                </p>
                {risky ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
                    {finding.reasons.map((reason) => (
                      <li key={reason}>
                        {URL_REASON_LABELS[reason] ?? reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink-muted">
                    Local checks did not flag this host. That is not a safety
                    guarantee. Prefer official apps and typed addresses.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
