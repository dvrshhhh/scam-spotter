import { useId, useState } from 'react'
import {
  analyzeUrlsInText,
  URL_REASON_LABELS,
  type UrlFinding,
} from '../detection/urlSignals'

const SAMPLES = [
  'Click here to verify: https://bit.ly/track991',
  'Confirm billing at http://paypa1-secure-login.xyz/verify',
  'Read more at https://www.wikipedia.org/wiki/Phishing',
]

interface LinkCheckerProps {
  /** Optional text from the Check tab so users can inspect the same paste. */
  seedText?: string
}

export function LinkChecker({ seedText = '' }: LinkCheckerProps) {
  const [input, setInput] = useState(seedText)
  const [touched, setTouched] = useState(false)
  const [findings, setFindings] = useState<UrlFinding[] | null>(null)
  const [status, setStatus] = useState(
    'Paste a message or URL. Inspection stays in this browser and never visits the link.',
  )
  const inputId = useId()
  const displayValue = touched || input.trim() ? input : seedText

  function runCheck() {
    const trimmed = displayValue.trim()
    if (!trimmed) {
      setFindings(null)
      setStatus('Enter text that includes a URL first.')
      return
    }
    if (!touched) {
      setTouched(true)
      setInput(trimmed)
    }
    const next = analyzeUrlsInText(trimmed)
    setFindings(next)
    if (next.length === 0) {
      setStatus('No URL found in that text.')
      return
    }
    const flagged = next.filter((item) => item.reasons.length > 0).length
    setStatus(
      flagged > 0
        ? `Found ${next.length} URL${next.length === 1 ? '' : 's'}; ${flagged} show structural caution clues.`
        : `Found ${next.length} URL${next.length === 1 ? '' : 's'}; no structural caution clues matched. That does not prove a link is safe.`,
    )
  }

  return (
    <section className="animate-rise space-y-6" aria-labelledby="link-check-heading">
      <div className="sheet px-5 py-6 sm:px-7 sm:py-7">
        <h2
          id="link-check-heading"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Link inspection
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Extract URLs and review structural clues such as shorteners, IP hosts,
          lookalike spelling, deceptive structure, and plain HTTP. This tool
          never opens or sends a URL, and it cannot check live reputation.
        </p>

        <label htmlFor={inputId} className="mt-6 block text-sm font-semibold text-ink">
          Message text or URL
        </label>
        <textarea
          id={inputId}
          value={displayValue}
          onChange={(event) => {
            setTouched(true)
            setInput(event.target.value)
          }}
          rows={5}
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-sm text-ink"
          placeholder="Paste a message that contains a link, or a single URL"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runCheck}
            className="min-h-11 border border-brand bg-brand px-4 text-sm font-semibold text-sheet transition hover:bg-brand-deep"
          >
            Inspect links
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true)
              setInput('')
              setFindings(null)
              setStatus('Cleared. Paste another message or URL when ready.')
            }}
            className="min-h-11 border border-line bg-white px-4 text-sm font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Sample texts">
          {SAMPLES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setTouched(true)
                setInput(sample)
              }}
              className="max-w-full border border-line bg-paper px-2.5 py-1.5 text-left text-xs font-medium text-ink-muted transition hover:border-ink hover:text-ink"
            >
              {sample.length > 64 ? `${sample.slice(0, 61)}...` : sample}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-soft" role="status">
        {status}
      </p>

      {findings && findings.length === 0 && (
        <div className="border border-dashed border-line bg-sheet/70 px-5 py-8">
          <p className="font-display text-xl font-bold text-ink">No URL found</p>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Try pasting a full link starting with http:// or https://, or a short
            message that includes one. Shortener hosts without a scheme (for
            example bit.ly/...) are also detected.
          </p>
        </div>
      )}

      {findings && findings.length > 0 && (
        <ul className="space-y-4">
          {findings.map((finding) => {
            const flagged = finding.reasons.length > 0
            return (
              <li key={finding.url}>
                <article
                  className={`sheet px-5 py-5 ${
                    flagged ? 'bg-risk-mid-bg/45' : 'bg-risk-low-bg/35'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {flagged
                      ? 'Structural caution clues'
                      : 'No structural caution clues'}
                    {flagged ? ' · hashed marker' : ' · solid calm marker'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    Hostname:{' '}
                    <span className="font-display">
                      {finding.hostname ?? 'unknown'}
                    </span>
                  </p>
                  <p className="mt-1 break-all text-sm text-ink-muted">{finding.url}</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    Protocol: {finding.usesPlainHttp ? 'HTTP (not encrypted)' : 'HTTPS or unspecified short form'}
                  </p>
                  {flagged ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
                      {finding.reasons.map((reason) => (
                        <li key={reason}>
                          {URL_REASON_LABELS[reason] ?? reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-ink-muted">
                      Local structure checks did not flag this host. That is not
                      proof the destination is safe. Prefer official apps and
                      addresses you type yourself.
                    </p>
                  )}
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
