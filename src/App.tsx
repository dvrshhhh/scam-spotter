import { useId, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppNav, type AppTab } from './components/AppNav'
import { ExampleButtons } from './components/ExampleButtons'
import { LinkChecker } from './components/LinkChecker'
import { MessageInput } from './components/MessageInput'
import { PrivacyNote } from './components/PrivacyNote'
import { RiskResult } from './components/RiskResult'
import { SafetyGuide } from './components/SafetyGuide'
import { EXAMPLE_MESSAGES, type ExampleKind } from './data/examples'
import { checkMessage } from './detection/checkMessage'
import type { CheckResult } from './detection/types'

export default function App() {
  const [tab, setTab] = useState<AppTab>('check')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [activeExample, setActiveExample] = useState<ExampleKind | null>(null)
  const [statusText, setStatusText] = useState(
    'Ready. Paste a message or choose an example, then check it.',
  )
  const resultRef = useRef<HTMLDivElement>(null)
  const liveRegionId = useId()

  function runCheck(sourceText: string) {
    const next = checkMessage(sourceText)
    setResult(next)
    setStatusText(
      `Result updated: ${next.riskLabel}, score ${next.score} out of 100.`,
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
    setStatusText('Message cleared.')
  }

  function handleLoadExample(kind: ExampleKind) {
    const example = EXAMPLE_MESSAGES.find((item) => item.id === kind)
    if (!example) return
    setMessage(example.text)
    setActiveExample(kind)
    setResult(null)
    setTab('check')
    setStatusText(`Loaded “${example.label}”. Check the message when ready.`)
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <AppNav active={tab} onChange={setTab} />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {tab === 'check' && (
          <>
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
              <div className="mt-8 border-t border-line pt-6">
                <ExampleButtons onLoad={handleLoadExample} activeId={activeExample} />
              </div>
            </main>

            <div className="mt-6 border-l-4 border-signal bg-white px-4 py-4 sm:px-5">
              <PrivacyNote />
            </div>

            <div
              ref={resultRef}
              tabIndex={-1}
              className="mt-10 outline-none"
              aria-labelledby={result ? 'result-heading' : undefined}
            >
              {result ? (
                <RiskResult
                  result={result}
                  onInspectLinks={() => setTab('links')}
                />
              ) : (
                <section
                  className="border border-dashed border-line bg-sheet/70 px-5 py-8 sm:px-7"
                  aria-label="Results placeholder"
                >
                  <p className="font-display text-xl font-bold text-ink">
                    Results appear after you check a message
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    You will see a risk level, matched warning signs, likely
                    patterns, and safer next steps. This cannot prove a message
                    is safe or fraudulent.
                  </p>
                </section>
              )}
            </div>
          </>
        )}

        {tab === 'links' && <LinkChecker seedText={message} />}
        {tab === 'safety' && <SafetyGuide />}

        <footer className="mt-12 border-t border-line pt-5 text-sm text-ink-muted">
          <p>
            Educational toolkit for a BTech Engineering Innovation Project.
            Flags common warning signs only — not a guarantee of safety, and not
            a substitute for official fraud guidance.
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
