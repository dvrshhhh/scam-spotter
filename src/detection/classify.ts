import type { DetectedSignal, ScamPattern } from './types'

/**
 * Map detected signals to likely high-level patterns for the UI.
 * Patterns are educational labels, not definitive verdicts.
 */
export function classifyPatterns(signals: DetectedSignal[]): ScamPattern[] {
  if (signals.length === 0) return []

  const categories = new Set(signals.map((s) => s.category))
  const ruleIds = new Set(signals.map((s) => s.ruleId))
  const patterns: ScamPattern[] = []

  if (categories.has('impersonation')) {
    patterns.push({
      id: 'account-impersonation',
      label: 'Account impersonation',
      reason:
        'The message claims to speak for a bank, brand, courier, or support team.',
    })
  }

  if (categories.has('money') || categories.has('payment_unusual')) {
    patterns.push({
      id: 'payment-request',
      label: 'Payment request',
      reason:
        'It asks for money, gift cards, UPI or bank details, or unusual payment channels.',
    })
  }

  if (categories.has('prize')) {
    patterns.push({
      id: 'unexpected-prize',
      label: 'Unexpected prize',
      reason:
        'It promises a prize, refund, lottery win, or similar unsolicited reward.',
    })
  }

  const jobLike = signals.some((s) =>
    /work from home|part[-\s]?time job|online job|registration fee|training fee|anydesk|teamviewer|remote access|install/i.test(
      `${s.matchedText} ${s.title} ${s.ruleId}`,
    ),
  )
  if (
    jobLike ||
    (ruleIds.has('software-attachments') &&
      (categories.has('money') ||
        categories.has('secrecy') ||
        categories.has('urgency') ||
        categories.has('payment_unusual')))
  ) {
    patterns.push({
      id: 'suspicious-job-offer',
      label: 'Suspicious job offer',
      reason:
        'It shows job, fee, or remote-access pressure often used in fake hiring and “support” scams.',
    })
  }

  if (categories.has('urgency')) {
    patterns.push({
      id: 'urgent-threat',
      label: 'Urgent threat',
      reason:
        'It uses deadlines, lockouts, legal threats, or other panic language.',
    })
  }

  return patterns
}
