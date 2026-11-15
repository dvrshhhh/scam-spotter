import type { DetectedSignal, RiskLevel } from './types'

/**
 * Scoring logic
 * -------------
 * 1. Sum raw weights of distinct rule hits.
 * 2. Apply a small category-diversity bonus when 3+ different categories fire
 *    (scams often combine pressure + ask + channel).
 * 3. Cap the final score at 100.
 * 4. Map to risk bands with conservative thresholds:
 *
 *    0–29  → Low risk          (few/weak signals; still not a guarantee of safety)
 *    30–59 → Review carefully  (enough to warrant caution and manual verification)
 *    60–100→ High risk         (strong credential/payment asks and/or stacked signals)
 *
 * Important guardrails:
 * - A single weak signal (e.g. only a generic link, weight ~12) stays Low.
 * - A lone strong credential ask (~26) lands in Review carefully, not High,
 *   unless other supporting signals push the total over 60.
 */

export const SCORE_CAP = 100
export const LOW_MAX = 29
export const REVIEW_MAX = 59

/** Bonus when hits span many categories — stacked social engineering. */
export const DIVERSITY_BONUS_THRESHOLD = 3
export const DIVERSITY_BONUS_POINTS = 8

export function computeRawScore(signals: DetectedSignal[]): {
  raw: number
  diversityBonus: number
  categories: string[]
} {
  const raw = signals.reduce((sum, signal) => sum + signal.weight, 0)
  const categories = [...new Set(signals.map((s) => s.category))]
  const diversityBonus =
    categories.length >= DIVERSITY_BONUS_THRESHOLD
      ? DIVERSITY_BONUS_POINTS
      : 0

  return { raw, diversityBonus, categories }
}

export function finalizeScore(raw: number, diversityBonus: number): number {
  return Math.min(SCORE_CAP, raw + diversityBonus)
}

export function riskFromScore(score: number): RiskLevel {
  if (score >= REVIEW_MAX + 1) return 'high'
  if (score >= LOW_MAX + 1) return 'review'
  return 'low'
}

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low risk'
    case 'review':
      return 'Review carefully'
    case 'high':
      return 'High risk'
  }
}

export function summaryFor(
  level: RiskLevel,
  signalCount: number,
): string {
  switch (level) {
    case 'low':
      return signalCount === 0
        ? 'No common warning signs were detected. That does not prove the message is genuine—stay cautious with unexpected requests.'
        : 'Only weak or limited warning signs were found. Treat unexpected requests carefully and verify through official channels.'
    case 'review':
      return 'Several warning signs appear in this message. Pause before clicking links, sharing codes, or sending money—verify independently.'
    case 'high':
      return 'Strong scam-like warning signs were detected. Do not share codes, passwords, or payments from this message. Contact the organization only through a channel you already trust.'
  }
}

export function nextStepsFor(level: RiskLevel): string[] {
  const shared = [
    'Do not share passwords, PINs, one-time passwords, or verification codes from this message.',
    'Avoid tapping links in unexpected messages. Open the official app or type a website address you already trust.',
    'Contact the organization using a phone number or channel you already have—not one supplied only in the message.',
    'This tool flags common patterns and can be wrong. When unsure, ask a trusted person or official support.',
  ]

  if (level === 'high') {
    return [
      'Stop interacting with the message. Do not reply, click, install software, or send money.',
      ...shared,
      'If you already shared credentials or paid, contact your bank or the service’s official support immediately and change passwords from a device you trust.',
    ]
  }

  if (level === 'review') {
    return [
      'Pause and verify before taking any action suggested in the message.',
      ...shared,
    ]
  }

  return [
    'Stay alert: a low-risk result is not a guarantee that a message is safe.',
    ...shared,
  ]
}
