import type { DetectedSignal, RiskLevel, SignalCategory } from './types'

/**
 * Scoring logic
 * -------------
 * 1. Sum raw weights of distinct rule hits.
 * 2. Apply a small category-diversity bonus when 3+ different categories fire
 *    (scams often combine pressure + ask + channel).
 * 3. Apply combo bonuses for known dangerous stacks
 *    (e.g. credentials + urgency, impersonation + links).
 * 4. Cap the final score at 100.
 * 5. Map to risk bands with conservative thresholds:
 *
 *    0 to 29   -> Low risk
 *    30 to 59  -> Review carefully
 *    60 to 100 -> High risk
 *
 * Guardrails:
 * - A single weak signal stays Low.
 * - A lone strong credential ask lands in Review carefully, not High,
 *   unless other supporting signals or combos push the total over 60.
 */

export const SCORE_CAP = 100
export const LOW_MAX = 29
export const REVIEW_MAX = 59

export const DIVERSITY_BONUS_THRESHOLD = 3
export const DIVERSITY_BONUS_POINTS = 8

/** Cap stacked combo bonuses so one message cannot over-escalate from overlaps alone. */
export const COMBO_BONUS_CAP = 16

interface ComboRule {
  id: string
  label: string
  points: number
  /** All listed categories must appear among hits. */
  requires: SignalCategory[]
}

const COMBO_RULES: ComboRule[] = [
  {
    id: 'credentials-urgency',
    label: 'Credential ask plus urgency',
    points: 10,
    requires: ['credentials', 'urgency'],
  },
  {
    id: 'impersonation-credentials',
    label: 'Trusted-brand impersonation plus credential ask',
    points: 10,
    requires: ['impersonation', 'credentials'],
  },
  {
    id: 'impersonation-links',
    label: 'Impersonation plus suspicious link',
    points: 4,
    requires: ['impersonation', 'links'],
  },
  {
    id: 'money-secrecy',
    label: 'Money ask plus secrecy pressure',
    points: 8,
    requires: ['money', 'secrecy'],
  },
  {
    id: 'prize-unusual-pay',
    label: 'Prize or refund bait plus unusual payment',
    points: 8,
    requires: ['prize', 'payment_unusual'],
  },
  {
    id: 'credentials-links',
    label: 'Credential ask plus link',
    points: 6,
    requires: ['credentials', 'links'],
  },
  {
    id: 'money-urgency',
    label: 'Money ask plus urgency',
    points: 8,
    requires: ['money', 'urgency'],
  },
  {
    id: 'prize-links',
    label: 'Prize or refund bait plus link',
    points: 6,
    requires: ['prize', 'links'],
  },
  {
    id: 'software-secrecy',
    label: 'Install or remote-access ask plus secrecy',
    points: 8,
    requires: ['software', 'secrecy'],
  },
  {
    id: 'impersonation-money',
    label: 'Impersonation plus money ask',
    points: 6,
    requires: ['impersonation', 'money'],
  },
]

export function computeRawScore(signals: DetectedSignal[]): {
  raw: number
  diversityBonus: number
  comboBonus: number
  comboNotes: string[]
  categories: SignalCategory[]
} {
  const raw = signals.reduce((sum, signal) => sum + signal.weight, 0)
  const categories = [
    ...new Set(signals.map((s) => s.category)),
  ] as SignalCategory[]

  const diversityBonus =
    categories.length >= DIVERSITY_BONUS_THRESHOLD
      ? DIVERSITY_BONUS_POINTS
      : 0

  const categorySet = new Set(categories)
  const comboNotes: string[] = []
  let comboBonus = 0

  for (const combo of COMBO_RULES) {
    if (combo.requires.every((needed) => categorySet.has(needed))) {
      comboBonus += combo.points
      comboNotes.push(`${combo.label} (+${combo.points})`)
    }
  }

  if (comboBonus > COMBO_BONUS_CAP) {
    comboNotes.push(
      `Combo bonus capped at +${COMBO_BONUS_CAP} (raw combos were +${comboBonus}).`,
    )
    comboBonus = COMBO_BONUS_CAP
  }

  return { raw, diversityBonus, comboBonus, comboNotes, categories }
}

export function finalizeScore(
  raw: number,
  diversityBonus: number,
  comboBonus = 0,
): number {
  return Math.min(SCORE_CAP, raw + diversityBonus + comboBonus)
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
        ? 'No common warning signs were detected. That does not prove the message is genuine. Stay cautious with unexpected requests.'
        : 'Only weak or limited warning signs were found. Treat unexpected requests carefully and verify through official channels.'
    case 'review':
      return 'Several warning signs appear in this message. Pause before clicking links, sharing codes, or sending money. Verify independently.'
    case 'high':
      return 'Strong scam-like warning signs were detected. Do not share codes, passwords, or payments from this message. Contact the organization only through a channel you already trust.'
  }
}

export function nextStepsFor(level: RiskLevel): string[] {
  const shared = [
    'Do not share passwords, PINs, one-time passwords, or verification codes from this message.',
    'Avoid tapping links in unexpected messages. Open the official app or type a website address you already trust.',
    'Contact the organization using a phone number or channel you already have, not one supplied only in the message.',
    'This tool flags common patterns and can be wrong. When unsure, ask a trusted person or official support.',
  ]

  if (level === 'high') {
    return [
      'Stop interacting with the message. Do not reply, click, install software, or send money.',
      ...shared,
      'If you already shared credentials or paid, contact your bank or the service official support immediately and change passwords from a device you trust.',
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
