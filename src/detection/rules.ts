import type { DetectionRule } from './types'

/**
 * Rule catalogue for Scam Message Checker.
 *
 * Scoring philosophy (see also score.ts):
 * - Weights are relative severity, not "percent scam".
 * - Several moderate signals can accumulate into "Review carefully".
 * - High risk usually needs either one strong credential/payment ask
 *   plus supporting pressure, or a stack of distinct categories.
 * - Patterns intentionally favor common English scam phrasing used in
 *   SMS / email / chat. They will miss novel wording and can false-flag
 *   legitimate messages that use similar language.
 */

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"')\]]+|bit\.ly\/\w+|t\.co\/\w+|tinyurl\.com\/\w+|goo\.gl\/\w+|rb\.gy\/\w+/gi

const SHORTENER_HOSTS =
  /(?:bit\.ly|t\.co|tinyurl\.com|goo\.gl|rb\.gy|ow\.ly|is\.gd|cutt\.ly|rebrand\.ly|shorturl\.at)\b/i

/** Domains that often appear in phishing lookalikes (typosquats / odd TLDs). */
const LOOKALIKE_HINT =
  /(?:[a-z0-9-]+\.)?(?:paypa1|micros0ft|app1e|amaz0n|netf1ix|faceb00k|go0gle|banks?[-]?secure|account[-]?verify|login[-]?secure)\.[a-z]{2,}/i

function findFirstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g')
      ? pattern.flags
      : `${pattern.flags}g`
    const re = new RegExp(pattern.source, flags)
    const match = re.exec(text)
    if (match?.[0]) {
      return match[0].trim()
    }
  }
  return null
}

function extractSuspiciousLinks(text: string): string | null {
  const urls = text.match(URL_PATTERN)
  if (!urls || urls.length === 0) return null

  for (const raw of urls) {
    const cleaned = raw.replace(/[.,;:!?)]+$/, '')
    if (SHORTENER_HOSTS.test(cleaned)) {
      return cleaned
    }
    if (LOOKALIKE_HINT.test(cleaned)) {
      return cleaned
    }
    // IP-literal or non-https looking login pages are higher concern
    if (/https?:\/\/\d{1,3}(?:\.\d{1,3}){3}/i.test(cleaned)) {
      return cleaned
    }
  }

  // Any link still matters as a weak signal when paired with other pressure
  return urls[0].replace(/[.,;:!?)]+$/, '')
}

export const DETECTION_RULES: DetectionRule[] = [
  {
    id: 'urgency-threat',
    category: 'urgency',
    title: 'Urgent pressure or threats',
    explanation:
      'Scammers push you to act before you can verify. Phrases about accounts being locked, legal action, or “act now” create panic.',
    weight: 14,
    patterns: [
      /\bact\s+now\b/i,
      /\bimmediately\b/i,
      /\bwithin\s+\d+\s*(?:hours?|mins?|minutes?|hrs?)\b/i,
      /\burgent(?:ly)?\b/i,
      /\bfinal\s+notice\b/i,
      /\baccount\s+(?:will\s+be\s+)?(?:suspended|locked|closed|blocked)\b/i,
      /\blegal\s+action\b/i,
      /\bwarrant\b/i,
      /\barrest\b/i,
      /\blast\s+chance\b/i,
      /\brespond\s+(?:within|immediately)\b/i,
    ],
  },
  {
    id: 'credentials-codes',
    category: 'credentials',
    title: 'Asks for passwords, PINs, or codes',
    explanation:
      'Banks, apps, and platforms that already know you rarely ask you to reply with a password, PIN, OTP, or verification code by message.',
    weight: 26,
    patterns: [
      /\b(?:password|passcode|pass\s*code)\b/i,
      /\b(?:pin|p\.i\.n\.?)\b/i,
      /\b(?:otp|one[-\s]?time\s+(?:password|passcode|code)|verification\s+code|security\s+code)\b/i,
      /\bconfirm\s+your\s+(?:password|pin|otp|credentials)\b/i,
      /\bsend\s+(?:me\s+)?(?:your\s+)?(?:password|pin|otp|code)\b/i,
      /\breply\s+with\s+(?:your\s+)?(?:password|pin|otp|code)\b/i,
      /\bshare\s+(?:your\s+)?(?:password|pin|otp|verification\s+code)\b/i,
    ],
  },
  {
    id: 'money-payment',
    category: 'money',
    title: 'Requests money, gift cards, or bank details',
    explanation:
      'Unexpected requests for money transfers, gift cards, crypto, or full bank/card details are classic scam tactics.',
    weight: 24,
    patterns: [
      /\bgift\s*cards?\b/i,
      /\biTunes\s+card\b/i,
      /\bgoogle\s+play\s+card\b/i,
      /\bcryptocurrency\b|\bbitcoin\b|\bBTC\b|\bUSDT\b|\bwallets?\s+address\b/i,
      /\bwire\s+transfer\b/i,
      /\bbank\s+(?:account|details|routing)\b/i,
      /\b(?:credit|debit)\s+card\s+(?:number|details)\b/i,
      /\bcvv\b|\bcvc\b/i,
      /\bsend\s+(?:money|funds|payment|cash)\b/i,
      /\bpay\s+(?:me|us|here|via|using)\b/i,
      /\bupi\s+(?:id|pin)\b/i,
      /\baccount\s+number\b/i,
    ],
  },
  {
    id: 'prize-refund',
    category: 'prize',
    title: 'Unexpected prize, refund, or reward',
    explanation:
      '“You won” / surprise refund messages often lure people into clicking links or sharing personal details.',
    weight: 16,
    patterns: [
      /\byou(?:'ve| have)?\s+won\b/i,
      /\bcongratulations\b/i,
      /\b(?:lottery|jackpot|prize|reward)\b/i,
      /\bfree\s+(?:gift|iphone|vacation|ticket)\b/i,
      /\bunclaimed\s+(?:funds?|prize|refund)\b/i,
      /\brefund\s+(?:pending|available|waiting)\b/i,
      /\bclaim\s+(?:your|the)\s+(?:prize|reward|refund)\b/i,
      /\bselected\s+(?:as\s+)?(?:a\s+)?(?:winner|lucky)\b/i,
    ],
  },
  {
    id: 'suspicious-links',
    category: 'links',
    title: 'Links or shortened / suspicious URLs',
    explanation:
      'Links in unexpected messages can lead to lookalike login pages. Shortened URLs hide the real destination.',
    weight: 12,
    patterns: [],
    test: (text) => extractSuspiciousLinks(text),
  },
  {
    id: 'software-attachments',
    category: 'software',
    title: 'Asks to install software or open attachments',
    explanation:
      'Scammers may push remote-access apps, unknown APKs, or attachments that install malware.',
    weight: 20,
    patterns: [
      /\binstall\s+(?:this|our|the)?\s*(?:app|software|apk|update)\b/i,
      /\bdownload\s+(?:this|the|our)\s+(?:app|file|attachment|update)\b/i,
      /\bremote\s+(?:access|desktop|support)\b/i,
      /\banydesk\b|\bteamviewer\b|\bultraviewer\b/i,
      /\bopen\s+(?:the\s+)?attachment\b/i,
      /\benable\s+macros?\b/i,
      /\bscan\s+(?:the\s+)?qr\s*code\b/i,
    ],
  },
  {
    id: 'impersonation',
    category: 'impersonation',
    title: 'Possible impersonation of a trusted organization',
    explanation:
      'Messages that claim to be from banks, delivery services, tax offices, or tech support (especially with odd wording) deserve extra scrutiny.',
    weight: 15,
    patterns: [
      /\b(?:this\s+is|we\s+are|calling\s+from)\s+(?:your\s+)?(?:bank|support|security\s+team)\b/i,
      /\b(?:microsoft|apple|google|amazon|paypal|irs|income\s+tax|customs|fedex|dhl|ups)\s+(?:support|security|team|alert)\b/i,
      /\bit\s+support\b|\btech\s+support\b/i,
      /\byour\s+(?:bank|account)\s+(?:security|fraud)\s+(?:department|team)\b/i,
      /\b(?:bank|account)\s+security\s+team\b/i,
      /\bon\s+behalf\s+of\b/i,
      /\bofficial\s+(?:notice|alert|warning)\s+from\b/i,
    ],
  },
  {
    id: 'secrecy',
    category: 'secrecy',
    title: 'Asks you to keep this secret',
    explanation:
      'Pressure to hide the conversation from family, friends, or coworkers is a common social-engineering tactic.',
    weight: 18,
    patterns: [
      /\bkeep\s+(?:this|it)\s+(?:a\s+)?secret\b/i,
      /\bkeep\s+this\s+confidential\b/i,
      /\bdon'?t\s+tell\s+(?:anyone|anybody|your\s+(?:family|friends|parents|spouse|partner))\b/i,
      /\bdo\s+not\s+tell\s+anyone\b/i,
      /\bdo\s+not\s+share\s+this\s+(?:with|message)\b/i,
      /\bbetween\s+us\b/i,
      /\bconfidential(?:ly)?\b.{0,40}\bdon'?t\s+tell\b/i,
    ],
  },
  {
    id: 'unusual-payment',
    category: 'payment_unusual',
    title: 'Unusual payment instructions',
    explanation:
      'Legitimate organizations rarely ask for payment via gift cards, crypto-only channels, or personal money-transfer apps for “fees” or “taxes on prizes”.',
    weight: 18,
    patterns: [
      /\bpay\s+(?:the\s+)?(?:fee|tax|duty|release\s+fee)\b/i,
      /\bprocessing\s+fee\b/i,
      /\bsend\s+(?:via|through)\s+(?:western\s+union|moneygram|cashapp|venmo|zelle)\b/i,
      /\bgift\s*card\s+(?:code|pin|numbers?)\b/i,
      /\btransfer\s+(?:to\s+)?(?:this\s+)?wallet\b/i,
      /\bpay\s+only\s+(?:with|via|using)\s+(?:bitcoin|crypto|gift\s*cards?)\b/i,
    ],
  },
]

/** Helper used by the checker to evaluate one rule against message text. */
export function evaluateRule(
  rule: DetectionRule,
  text: string,
): string | null {
  if (rule.test) {
    const custom = rule.test(text)
    if (custom) return custom
  }
  if (rule.patterns.length === 0) return null
  return findFirstMatch(text, rule.patterns)
}
