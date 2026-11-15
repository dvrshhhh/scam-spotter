import { useId, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ExampleButtons } from './components/ExampleButtons'
import { MessageInput } from './components/MessageInput'
import { PrivacyNote } from './components/PrivacyNote'
import { RiskResult } from './components/RiskResult'
import { EXAMPLE_MESSAGES, type ExampleKind } from './data/examples'
import { checkMessage } from './detection/checkMessage'
import type { CheckResult } from './detection/types'

const SAVE_KEY = 'scam-message-checker:saved-scans'

interface SavedScanMeta {
  savedAt: string
  riskLevel: CheckResult['riskLevel']
  riskLabel: string
  score: number
  signalIds: string[]
  /** Intentionally omit raw message text from default persistence. */
  messagePreviewLength: number
}

export default function App() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [activeExample, setActiveExample] = useState<ExampleKind | null>(null)
  const [statusText, setStatusText] = useState(
    'Ready. Paste a message or load an example, then choose Check message.',
  )
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const liveRegionId = useId()

  function runCheck(sourceText: string) {
    const next = checkMessage(sourceText)
    setResult(next)
    setSaveStatus(null)
    setStatusText(
      `Result updated: ${next.riskLabel}, score ${next.score} out of 100, ${next.signals.length} warning sign${next.signals.length === 1 ? '' : 's'} detected.`,
    )
    window.requestAnimationFrame(() => {
      resultRef.current?.focus()
    })
  }

  function handleCheck() {
    if (!message.trim()) {
      setStatusText('Enter a message before checking.')
      return
    }
    runCheck(message)
  }

  function handleClear() {
    setMessage('')
    setResult(null)
    setActiveExample(null)
    setSaveStatus(null)
    setStatusText('Message cleared. Ready for a new check.')
  }

  function handleLoadExample(kind: ExampleKind) {
    const example = EXAMPLE_MESSAGES.find((item) => item.id === kind)
    if (!example) return
    setMessage(example.text)
    setActiveExample(kind)
    setResult(null)
    setSaveStatus(null)
    setStatusText(
      `Loaded the ${example.label.toLowerCase()} example. Choose Check message to analyze it.`,
    )
  }

  function handleSaveScan() {
    if (!result) return

    const entry: SavedScanMeta = {
      savedAt: new Date().toISOString(),
      riskLevel: result.riskLevel,
      riskLabel: result.riskLabel,
      score: result.score,
      signalIds: result.signals.map((signal) => signal.ruleId),
      messagePreviewLength: message.trim().length,
    }

    try {
      const existingRaw = window.localStorage.getItem(SAVE_KEY)
      const existing: SavedScanMeta[] = existingRaw
        ? (JSON.parse(existingRaw) as SavedScanMeta[])
        : []
      const next = [entry, ...existing].slice(0, 20)
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(next))
      setSaveStatus(
        'Saved a scan summary on this device (risk, score, rule ids—not the full message text).',
      )
      setStatusText('Scan summary saved locally on this device.')
    } catch {
      setSaveStatus('Could not save on this device. Storage may be blocked.')
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <main className="sheet px-5 py-6 sm:px-7 sm:py-8">
          <MessageInput
            value={message}
            onChange={(value) => {
              setMessage(value)
              setActiveExample(null)
            }}
            onCheck={handleCheck}
            onClear={handleClear}
          />

          <div className="mt-8">
            <ExampleButtons onLoad={handleLoadExample} activeId={activeExample} />
          </div>
        </main>

        <div className="mt-6">
          <PrivacyNote
            onSaveScan={handleSaveScan}
            saveEnabled={Boolean(result)}
            saveStatus={saveStatus}
          />
        </div>

        <div
          ref={resultRef}
          tabIndex={-1}
          className="mt-10 outline-none"
          aria-labelledby={result ? 'result-heading' : undefined}
        >
          {result ? (
            <RiskResult result={result} />
          ) : (
            <section
              className="border border-dashed border-line bg-sheet/70 px-5 py-8 sm:px-7"
              aria-label="Results placeholder"
            >
              <p className="font-display text-xl font-bold text-ink">
                Results appear after you check a message
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                You will get a risk level, a 0–100 score, matched warning signs,
                and practical next steps.
              </p>
            </section>
          )}
        </div>

        <section
          className="mt-10 border-t border-line pt-6"
          aria-labelledby="limitations-heading"
        >
          <h2
            id="limitations-heading"
            className="font-display text-base font-bold text-ink"
          >
            Limitations
          </h2>
          <ul className="mt-2 max-w-3xl space-y-2 text-sm leading-relaxed text-ink-muted">
            <li>
              Rule-based checks catch common English phishing patterns; they can
              miss new wording and can flag legitimate messages.
            </li>
            <li>
              No remote AI is used. Core checking works offline after
              dependencies are installed.
            </li>
            <li>
              Always verify through official apps, websites, or numbers you
              already trust.
            </li>
          </ul>
        </section>

        <footer className="mt-8 border-t border-line pt-4 text-sm text-ink-soft">
          <p>
            Scam Message Checker — educational aid for a third-year BTech
            Engineering Innovation Project. Not a substitute for official fraud
            guidance.
          </p>
        </footer>
      </div>

      <div
        id={liveRegionId}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </div>
    </div>
  )
}
