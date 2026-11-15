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
    // Move keyboard users toward the result after analysis
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
    setStatusText(`Loaded the ${example.label.toLowerCase()} example. Choose Check message to analyze it.`)
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
    <div className="bg-grid-soft min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <AppHeader />

        <main className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-5 rounded-[1.75rem] border border-line bg-panel/95 p-5 shadow-[0_18px_50px_-34px_rgba(15,76,70,0.55)] sm:p-6">
            <MessageInput
              value={message}
              onChange={(value) => {
                setMessage(value)
                setActiveExample(null)
              }}
              onCheck={handleCheck}
              onClear={handleClear}
            />
            <div className="border-t border-line pt-5">
              <ExampleButtons
                onLoad={handleLoadExample}
                activeId={activeExample}
              />
            </div>
          </section>

          <div className="space-y-5">
            <PrivacyNote
              onSaveScan={handleSaveScan}
              saveEnabled={Boolean(result)}
              saveStatus={saveStatus}
            />

            <section
              className="rounded-[1.75rem] border border-dashed border-brand/25 bg-brand-soft/35 p-5 sm:p-6"
              aria-labelledby="limitations-heading"
            >
              <h2
                id="limitations-heading"
                className="font-display text-base font-semibold text-ink"
              >
                Limitations
              </h2>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
                <li>
                  Rule-based checks catch common English phishing patterns; they
                  can miss new wording and can flag legitimate messages.
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
          </div>
        </main>

        <div
          ref={resultRef}
          tabIndex={-1}
          className="outline-none"
          aria-labelledby={result ? 'result-heading' : undefined}
        >
          {result ? (
            <RiskResult result={result} />
          ) : (
            <section
              className="rounded-[1.75rem] border border-line bg-panel/80 px-5 py-8 text-center shadow-[0_10px_40px_-28px_rgba(15,76,70,0.35)] sm:px-8"
              aria-label="Results placeholder"
            >
              <p className="font-display text-xl font-semibold text-ink">
                Results will appear here
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                After you check a message, you will see a risk level, a 0–100
                score meter, matched warning signs, and practical next steps.
              </p>
            </section>
          )}
        </div>

        <footer className="border-t border-line/80 pt-4 text-sm text-ink-soft">
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
