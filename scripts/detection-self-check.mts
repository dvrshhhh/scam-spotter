/**
 * Lightweight detection quality checks (no test runner required).
 * Run: npm run test:detection
 */
import { EXAMPLE_MESSAGES } from '../src/data/examples'
import { SAFETY_PATHS } from '../src/data/safetyGuide'
import { checkMessage } from '../src/detection/checkMessage'
import { classifyPatterns } from '../src/detection/classify'
import type { RiskLevel } from '../src/detection/types'
import {
  analyzeUrlsInText,
  URL_REASON_LABELS,
} from '../src/detection/urlSignals'

interface Expectation {
  id: string
  text: string
  risk: RiskLevel
  minScore?: number
  maxScore?: number
  mustIncludeRule?: string[]
  mustIncludePattern?: string[]
  mustIncludeHost?: string[]
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
    mustIncludeHost: ['bit.ly'],
  },
  {
    id: 'suspicious-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'suspicious')!.text,
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['credentials-codes', 'urgency-threat'],
    mustIncludePattern: ['account-impersonation', 'urgent-threat'],
  },
  {
    id: 'obfuscated-password',
    text: 'Please send your p a s s w o r d and OTP now or account will be locked within 1 hour. http://login-secure.paypa1-verify.ru/login',
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['credentials-codes'],
  },
  {
    id: 'underscore-obfuscation',
    text: 'Share your p_a_s_s_w_o_r_d and O_T_P immediately.',
    risk: 'review',
    minScore: 30,
    mustIncludeRule: ['credentials-codes'],
  },
  {
    id: 'kyc-upi-scam',
    text: 'Dear Customer, your KYC is pending with HDFC Bank Security Team. Complete KYC and confirm UPI pin at https://hdfc-verify.ru/kyc within 2 hours or account will be blocked.',
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['personal-kyc'],
    mustIncludeHost: ['hdfc-verify.ru'],
  },
  {
    id: 'single-weak-link',
    text: 'Here is the menu PDF we talked about: https://example.com/menu.pdf See you Friday.',
    risk: 'low',
    maxScore: 29,
  },
  {
    id: 'shortener-click-pressure',
    text: 'Click here to unlock your parcel: https://bit.ly/track991 immediately.',
    risk: 'review',
    minScore: 30,
    mustIncludeRule: ['suspicious-links', 'url-click-pressure'],
  },
  {
    id: 'brand-spoof-url',
    text: 'PayPal Security: confirm billing at https://paypa1-secure-login.xyz/verify',
    risk: 'review',
    minScore: 30,
    mustIncludeRule: ['suspicious-links'],
  },
  {
    id: 'multi-url-blast',
    text: 'Claim your refund now http://192.168.0.8/pay or use backup https://rb.gy/abc123 today.',
    risk: 'review',
    minScore: 30,
    mustIncludeRule: ['multiple-urls', 'suspicious-links'],
  },
  {
    id: 'job-offer-anydesk',
    text: 'Part-time online job: earn daily. Pay a small registration fee and install AnyDesk so HR can verify your laptop. Keep this confidential.',
    risk: 'high',
    minScore: 60,
    mustIncludeRule: ['job-offer-pressure', 'software-attachments', 'secrecy'],
    mustIncludePattern: ['suspicious-job-offer'],
  },
  {
    id: 'prize-gift-card',
    text: 'Congratulations! You have been selected as a lucky winner. Claim your prize and pay the release fee with gift cards here: https://bit.ly/prize-now',
    risk: 'high',
    minScore: 60,
    mustIncludePattern: ['unexpected-prize', 'payment-request'],
  },
  {
    id: 'fake-kyc-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'kyc')!.text,
    risk: 'high',
    minScore: 60,
  },
  {
    id: 'upi-collect-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'upi')!.text,
    risk: 'high',
    minScore: 60,
  },
  {
    id: 'courier-fee-example',
    text: EXAMPLE_MESSAGES.find((e) => e.id === 'courier')!.text,
    risk: 'high',
    minScore: 60,
    mustIncludePattern: ['payment-request', 'account-impersonation'],
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
  for (const patternId of testCase.mustIncludePattern ?? []) {
    if (!result.patterns.some((p) => p.id === patternId)) {
      problems.push(`missing pattern ${patternId}`)
    }
  }
  for (const host of testCase.mustIncludeHost ?? []) {
    if (!result.extractedHosts.includes(host)) {
      problems.push(`missing host ${host}`)
    }
  }

  if (problems.length > 0) {
    failed += 1
    console.error(`FAIL ${testCase.id}: ${problems.join('; ')} (score=${result.score})`)
    console.error(
      `  signals: ${result.signals.map((s) => s.ruleId).join(', ') || '(none)'}`,
    )
    console.error(
      `  patterns: ${result.patterns.map((p) => p.id).join(', ') || '(none)'}`,
    )
  } else {
    console.log(
      `PASS ${testCase.id}: ${result.riskLabel} ${result.score}/100 (${result.signals.length} signals)`,
    )
  }
}

// URL inspection feature checks
const urlCases: { id: string; text: string; expectEmpty?: boolean; mustReason?: string }[] = [
  {
    id: 'url-empty',
    text: 'No links here, just chat.',
    expectEmpty: true,
  },
  {
    id: 'url-shortener-reason',
    text: 'Open https://bit.ly/abc',
    mustReason: 'url-shortener',
  },
  {
    id: 'url-plain-http',
    text: 'Visit http://example.com/page',
    mustReason: 'plain-http',
  },
  {
    id: 'url-ip-host',
    text: 'Go to http://203.0.113.10/login',
    mustReason: 'ip-literal-host',
  },
]

for (const urlCase of urlCases) {
  const findings = analyzeUrlsInText(urlCase.text)
  const problems: string[] = []
  if (urlCase.expectEmpty && findings.length !== 0) {
    problems.push(`expected no URLs, got ${findings.length}`)
  }
  if (urlCase.mustReason) {
    const hit = findings.some((f) => f.reasons.includes(urlCase.mustReason!))
    if (!hit) problems.push(`missing reason ${urlCase.mustReason}`)
    if (!URL_REASON_LABELS[urlCase.mustReason]) {
      problems.push(`missing label for ${urlCase.mustReason}`)
    }
  }
  if (problems.length > 0) {
    failed += 1
    console.error(`FAIL ${urlCase.id}: ${problems.join('; ')}`)
  } else {
    console.log(`PASS ${urlCase.id}`)
  }
}

// Safety guide integrity
if (SAFETY_PATHS.length !== 4) {
  failed += 1
  console.error(`FAIL safety-paths: expected 4, got ${SAFETY_PATHS.length}`)
} else {
  console.log('PASS safety-paths: 4 paths present')
}

for (const path of SAFETY_PATHS) {
  if (path.steps.length < 3) {
    failed += 1
    console.error(`FAIL safety-${path.id}: too few steps`)
  }
}

// Classify helper smoke
const classified = classifyPatterns(
  checkMessage(EXAMPLE_MESSAGES.find((e) => e.id === 'suspicious')!.text).signals,
)
if (!classified.some((p) => p.id === 'urgent-threat')) {
  failed += 1
  console.error('FAIL classify-urgent')
} else {
  console.log('PASS classify-urgent')
}

if (failed > 0) {
  console.error(`\n${failed} detection check(s) failed`)
  process.exit(1)
}

console.log(`\nAll detection and feature integrity checks passed`)
