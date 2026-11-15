import { DETECTION_RULES, evaluateRule } from './rules'
import {
  computeRawScore,
  finalizeScore,
  nextStepsFor,
  riskFromScore,
  riskLabel,
  summaryFor,
  DIVERSITY_BONUS_POINTS,
  DIVERSITY_BONUS_THRESHOLD,
  LOW_MAX,
  REVIEW_MAX,
} from './score'
import type { CheckResult, DetectedSignal } from './types'

/**
 * Run the full local, rule-based check.
 * Message text never leaves the browser in this function.
 */
export function checkMessage(rawText: string): CheckResult {
  const text = rawText.trim()
  const signals: DetectedSignal[] = []

  if (text.length > 0) {
    for (const rule of DETECTION_RULES) {
      const matched = evaluateRule(rule, text)
      if (!matched) continue

      signals.push({
        ruleId: rule.id,
        category: rule.category,
        title: rule.title,
        explanation: rule.explanation,
        weight: rule.weight,
        matchedText: clipMatch(matched),
      })
    }
  }

  // Sort strongest signals first for the UI
  signals.sort((a, b) => b.weight - a.weight)

  const { raw, diversityBonus, categories } = computeRawScore(signals)
  const score = finalizeScore(raw, diversityBonus)
  const riskLevel = riskFromScore(score)

  const scoringNotes: string[] = [
    `Detected ${signals.length} warning sign${signals.length === 1 ? '' : 's'} across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}.`,
    `Raw weight sum: ${raw}.`,
  ]

  if (diversityBonus > 0) {
    scoringNotes.push(
      `Category diversity bonus: +${DIVERSITY_BONUS_POINTS} (hits spanned ${categories.length} ≥ ${DIVERSITY_BONUS_THRESHOLD} categories).`,
    )
  } else {
    scoringNotes.push(
      `No diversity bonus (needs ${DIVERSITY_BONUS_THRESHOLD}+ categories).`,
    )
  }

  scoringNotes.push(
    `Final score: ${score}/100 -> ${riskLabel(riskLevel)} (bands: 0 to ${LOW_MAX} low, ${LOW_MAX + 1} to ${REVIEW_MAX} review, ${REVIEW_MAX + 1} to 100 high).`,
  )

  if (signals.length === 1 && riskLevel !== 'high') {
    scoringNotes.push(
      'A single signal alone is intentionally limited so weak cues do not auto-escalate to High risk.',
    )
  }

  return {
    score,
    riskLevel,
    riskLabel: riskLabel(riskLevel),
    summary: summaryFor(riskLevel, signals.length),
    signals,
    nextSteps: nextStepsFor(riskLevel),
    scoringNotes,
  }
}

function clipMatch(value: string, max = 80): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}...`
}
