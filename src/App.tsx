import { useId, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppNav, type AppTab } from './components/AppNav'
import { ExampleButtons } from './components/ExampleButtons'
import { LearnPractice } from './components/LearnPractice'
import { LinkChecker } from './components/LinkChecker'
import { MessageInput } from './components/MessageInput'
import { PrivacyNote } from './components/PrivacyNote'
import { RiskResult } from './components/RiskResult'
import { SafetyGuide } from './components/SafetyGuide'
import {
  ScanHistory,
  type SavedScanMeta,
} from './components/ScanHistory'
import { EXAMPLE_MESSAGES, type ExampleKind } from './data/examples'
import { checkMessage } from './detection/checkMessage'
import type { CheckResult } from './detection/types'

const SAVE_KEY = 'scam-message-checker:saved-scans'
const HISTORY_ENABLED_KEY = 'scam-message-checker:history-enabled'

function readHistoryEnabled(): boolean {
  try {
    return window.localStorage.getItem(HISTORY_ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

function readSavedScans(): SavedScanMeta[] {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedScanMeta[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [tab, setTab] = useState<AppTab>('check')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [activeExample, setActiveExample] = useState<ExampleKind | null>(null)
  const [statusText, setStatusText] = useState(
    'Ready. Paste a message or load an example, then choose Check message.',
  )
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [historyEnabled, setHistoryEnabled] = useState(() =>
    typeof window === 'undefined' ? false : readHistoryEnabled(),
  )
  const [savedScans, setSavedScans] = useState<SavedScanMeta[]>(() =>
    typeof window === 'undefined' ? [] : readSavedScans(),
  )
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
    setTab('check')
    setStatusText(
      `Loaded the ${example.label.toLowerCase()} example. Choose Check message to analyze it.`,
    )
  }

  function enableHistory() {
    try {
      window.localStorage.setItem(HISTORY_ENABLED_KEY, '1')
      setHistoryEnabled(true)
      setStatusText('Local scan history enabled on this device.')
    } catch {
      setStatusText('Could not enable history. Storage may be blocked.')
    }
  }

  function disableHistory() {
    try {
      window.localStorage.setItem(HISTORY_ENABLED_KEY, '0')
      setHistoryEnabled(false)
      setStatusText('Local scan history disabled. Existing summaries were kept until cleared.')
    } catch {
      setStatusText('Could not update history setting.')
    }
  }

  function handleSaveScan() {
    if (!result) return
    if (!historyEnabled) {
      setSaveStatus('Enable optional history below before saving a summary.')
      return
    }

    const entry: SavedScanMeta = {
      savedAt: new Date().toISOString(),
      riskLevel: result.riskLevel,
      riskLabel: result.riskLabel,
      categories: result.breakdown.categories,
    }

    try {
      const next = [entry, ...readSavedScans()].slice(0, 20)
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(next))
      setSavedScans(next)
      setSaveStatus(
        'Saved date, risk level, and warning-sign categories on this device. Message text was not stored.',
      )
      setStatusText('Scan summary saved locally on this device.')
    } catch {
      setSaveStatus('Could not save on this device. Storage may be blocked.')
    }
  }

  function handleClearHistory() {
    try {
      window.localStorage.removeItem(SAVE_KEY)
      setSavedScans([])
      setStatusText('Local scan history cleared.')
    } catch {
      setStatusText('Could not clear history on this device.')
    }
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

              <div className="mt-8">
                <ExampleButtons onLoad={handleLoadExample} activeId={activeExample} />
              </div>
            </main>

            <div className="mt-6">
              <PrivacyNote
                onSaveScan={handleSaveScan}
                saveEnabled={Boolean(result) && historyEnabled}
                saveStatus={saveStatus}
              />
            </div>

            <div className="mt-6">
              <ScanHistory
                enabled={historyEnabled}
                scans={savedScans}
                onEnable={enableHistory}
                onDisable={disableHistory}
                onClear={handleClearHistory}
              />
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
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    You will get a risk level, a transparent score, matched
                    warning signs, likely pattern labels, and safer next steps.
                    This cannot prove a message is safe or fraudulent.
                  </p>
                </section>
              )}
            </div>
          </>
        )}

        {tab === 'links' && <LinkChecker seedText={message} />}
        {tab === 'safety' && <SafetyGuide />}
        {tab === 'learn' && <LearnPractice />}

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
              The checker flags common warning signs and can make mistakes. A
              low score is not a guarantee of safety.
            </li>
            <li>
              Link inspection only reviews URL structure locally. It never
              visits links and cannot check live reputation.
            </li>
            <li>
              No remote AI or paid API is used. Core tools work offline after
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
            Scam Message Checker is an educational scam-safety toolkit for a
            third-year BTech Engineering Innovation Project. It is not a
            substitute for official fraud guidance.
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
