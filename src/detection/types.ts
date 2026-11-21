/**
 * Shared types for the rule-based scam message checker.
 *
 * Design goals:
 * - Transparent: every hit maps to an explainable rule.
 * - Extensible: add rules in rules.ts without changing the scorer API.
 * - Conservative: weak/single signals should not force "High risk".
 */

export type RiskLevel = 'low' | 'review' | 'high'

export type SignalCategory =
  | 'urgency'
  | 'credentials'
  | 'money'
  | 'prize'
  | 'links'
  | 'software'
  | 'impersonation'
  | 'secrecy'
  | 'payment_unusual'

export interface DetectionRule {
  /** Stable id used in UI keys and saved-scan metadata (not message text). */
  id: string
  category: SignalCategory
  /** Short label shown to the user. */
  title: string
  /** Why this pattern matters. */
  explanation: string
  /**
   * Relative weight (roughly 8 to 28).
   * Stronger scam hallmarks (credential asks, gift cards) score higher.
   * Weaker cues (a single generic "urgent") score lower.
   */
  weight: number
  /**
   * Optional regex patterns. Matching is case-insensitive.
   * Prefer specific phrases over ultra-broad keywords.
   */
  patterns: RegExp[]
  /**
   * Optional custom matcher for structural checks (URLs, domains, etc.).
   * Return a short matched snippet or null.
   */
  test?: (text: string) => string | null
}

export interface DetectedSignal {
  ruleId: string
  category: SignalCategory
  title: string
  explanation: string
  weight: number
  /** Excerpt from the message or a short structural description. */
  matchedText: string
}

export interface ScoreBreakdown {
  raw: number
  diversityBonus: number
  comboBonus: number
  /** Fired combo labels for the UI, e.g. "Credential ask plus urgency (+10)". */
  comboHits: string[]
  categories: SignalCategory[]
}

/** High-level educational pattern labels (not a definitive scam verdict). */
export interface ScamPattern {
  id: string
  label: string
  reason: string
}

export interface CheckResult {
  score: number
  riskLevel: RiskLevel
  riskLabel: string
  summary: string
  signals: DetectedSignal[]
  nextSteps: string[]
  /**
   * Human-readable scoring notes for transparency
   * (weights, caps, and threshold decisions).
   */
  scoringNotes: string[]
  /** Structured explainability for the score panel. */
  breakdown: ScoreBreakdown
  /** Short tip describing what would most change this score. */
  improveTip: string
  /** Likely patterns suggested by the detected clues. */
  patterns: ScamPattern[]
}
