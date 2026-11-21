import { classifyPatterns } from './classify'
import { normalizeMessage } from './normalize'
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
  const { original, normalized } = normalizeMessage(rawText)
  const signals: DetectedSignal[] = []

  if (normalized.length > 0) {
    for (const rule of DETECTION_RULES) {
      const matched = evaluateRule(rule, normalized)
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

  const { raw, diversityBonus, comboBonus, comboNotes, categories } =
    computeRawScore(signals)
  const score = finalizeScore(raw, diversityBonus, comboBonus)
  const riskLevel = riskFromScore(score)

  const scoringNotes: string[] = [
    `Detected ${signals.length} warning sign${signals.length === 1 ? '' : 's'} across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}.`,
    `Raw weight sum: ${raw}.`,
  ]

  if (original !== normalized) {
    scoringNotes.push(
      'Message text was normalized first (spacing tricks, lookalike characters, light obfuscation) before matching.',
    )
  }

  if (diversityBonus > 0) {
    scoringNotes.push(
      `Category diversity bonus: +${DIVERSITY_BONUS_POINTS} (hits spanned ${categories.length} ≥ ${DIVERSITY_BONUS_THRESHOLD} categories).`,
    )
  } else {
    scoringNotes.push(
      `No diversity bonus (needs ${DIVERSITY_BONUS_THRESHOLD}+ categories).`,
    )
  }

  if (comboBonus > 0) {
    scoringNotes.push(
      `Dangerous combo bonus: +${comboBonus}. ${comboNotes.join('; ')}.`,
    )
  } else {
    scoringNotes.push('No dangerous combo bonus.')
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
    breakdown: {
      raw,
      diversityBonus,
      comboBonus,
      comboHits: comboNotes.filter((note) => !note.startsWith('Combo bonus capped')),
      categories,
    },
    improveTip: improveTipFor(signals, categories, score),
    patterns: classifyPatterns(signals),
  }
}

function improveTipFor(
  signals: DetectedSignal[],
  categories: string[],
  score: number,
): string {
  if (signals.length === 0) {
    return 'No warning signs matched. A clean score does not prove the message is safe. Still verify unexpected requests.'
  }
  if (score >= 60) {
    return 'This score is already high because strong asks and stacked tactics lined up. Do not interact. Verify only through official apps or numbers you already trust.'
  }
  const hasLinks = categories.includes('links')
  const hasCredentials = categories.includes('credentials')
  if (hasLinks && !hasCredentials) {
    return 'A credential or payment ask on top of this link would raise the score further. Avoid opening unexpected links.'
  }
  if (!hasLinks && (hasCredentials || categories.includes('money'))) {
    return 'Adding a suspicious or shortened link to this ask would usually push the score higher. Treat unexpected payment or OTP requests as high caution.'
  }
  if (categories.length < 3) {
    return 'More distinct scam categories (pressure + ask + channel) would increase the score via the diversity bonus.'
  }
  return 'Stacked social-engineering patterns raise the score. Pause and verify through a channel you already trust.'
}

function clipMatch(value: string, max = 80): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}...`
}
