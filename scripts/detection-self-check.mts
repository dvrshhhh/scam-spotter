/**
 * Lightweight detection quality checks (no test runner required).
 * Run: npm run test:detection
 */
import { EXAMPLE_MESSAGES } from '../src/data/examples'
import { checkMessage } from '../src/detection/checkMessage'
import type { RiskLevel } from '../src/detection/types'

interface Expectation {
  id: string
  text: string
  risk: RiskLevel
  minScore?: number
  maxScore?: number
  mustIncludeRule?: string[]
}

const cases: Expectation[] = [
  {
    id: 'ordinary-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'ordinary')!.text,
    risk: 'low',
    maxScore: 29,
  },
  {
    id: 'uncertain-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'uncertain')!.text,
    risk: 'review',
    minScore: 30,
    maxScore: 59,
  },
  {
    id: 'suspicious-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'suspicious')!.text,
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['credentials-codes', 'urgency-threat'],
  },
  {
    id: 'obfuscated-password',
    text: 'Please send your p a s s w o r d and OTP now or account will be locked within 1 hour. http://login-secure.paypa1-verify.ru/login',
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['credentials-codes'],
  },
  {
    id: 'kyc-upi-scam',
    text: 'Dear Customer, your KYC is pending with HDFC Bank Security Team. Complete KYC and confirm UPI pin at https://hdfc-verify.ru/kyc within 2 hours or account will be blocked.',
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['personal-kyc'],
  },
  {
    id: 'single-weak-link',
    text: 'Here is the menu PDF we talked about: https://example.com/menu.pdf See you Friday.',
    risk: 'low',
    maxScore: 29,
  },
]

let failed = 0

for (const testCase of cases) {
  const result = checkMessage(testCase.text)
  const problems: string[] = []

  if (result.riskLevel !== testCase.risk) {
    problems.push(`risk ${result.riskLevel} != ${testCase.risk}`)
  }
  if (testCase.minScore !== undefined && result.score < testCase.minScore) {
    problems.push(`score ${result.score} < min ${testCase.minScore}`)
  }
  if (testCase.maxScore !== undefined && result.score > testCase.maxScore) {
    problems.push(`score ${result.score} > max ${testCase.maxScore}`)
  }
  for (const ruleId of testCase.mustIncludeRule ?? []) {
    if (!result.signals.some((s) => s.ruleId === ruleId)) {
      problems.push(`missing rule ${ruleId}`)
    }
  }

  if (problems.length > 0) {
    failed += 1
    console.error(`FAIL ${testCase.id}: ${problems.join('; ')} (score=${result.score})`)
    console.error(
      `  signals: ${result.signals.map((s) => s.ruleId).join(', ') || '(none)'}`,
    )
  } else {
    console.log(
      `PASS ${testCase.id}: ${result.riskLabel} ${result.score}/100 (${result.signals.length} signals)`,
    )
  }
}

if (failed > 0) {
  console.error(`\n${failed} detection check(s) failed`)
  process.exit(1)
}

console.log(`\nAll ${cases.length} detection checks passed`)
