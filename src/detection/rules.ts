import type { DetectionRule } from './types'

/**
 * Rule catalogue for Scam Message Checker.
 *
 * Scoring philosophy (see also score.ts):
 * - Weights are relative severity, not "percent scam".
 * - Several moderate signals can accumulate into "Review carefully".
 * - High risk usually needs a strong ask plus pressure/channel, or stacked categories.
 * - Patterns favor common English (and common India-facing) scam phrasing.
 */

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"')\]]+|bit\.ly\/\w+|t\.co\/\w+|tinyurl\.com\/\w+|goo\.gl\/\w+|rb\.gy\/\w+/gi

const SHORTENER_HOSTS =
  /(?:bit\.ly|t\.co|tinyurl\.com|goo\.gl|rb\.gy|ow\.ly|is\.gd|cutt\.ly|rebrand\.ly|shorturl\.at|bl\.ink|tiny\.cc)\b/i

/** Domains that often appear in phishing lookalikes (typosquats / odd TLDs). */
const LOOKALIKE_HINT =
  /(?:[a-z0-9-]+\.)?(?:paypa1|micros0ft|app1e|amaz0n|netf1ix|faceb00k|go0gle|banks?[-]?secure|account[-]?verify|login[-]?secure|sbi[-]?secure|hdfc[-]?verify|icici[-]?secure)\.[a-z]{2,}/i

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

function extractHighRiskLinks(text: string): string | null {
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
    if (/https?:\/\/\d{1,3}(?:\.\d{1,3}){3}/i.test(cleaned)) {
      return cleaned
    }
    // Login / verify / secure path on an unexpected host
    if (
      /https?:\/\/[^\s/]+\/(?:login|signin|verify|secure|account|update|kyc)/i.test(
        cleaned,
      )
    ) {
      return cleaned
    }
  }

  return null
}

function extractAnyLink(text: string): string | null {
  // Avoid double-counting when a high-risk link already matches
  if (extractHighRiskLinks(text)) return null
  const urls = text.match(URL_PATTERN)
  if (!urls || urls.length === 0) return null
  return urls[0].replace(/[.,;:!?)]+$/, '')
}

export const DETECTION_RULES: DetectionRule[] = [
  {
    id: 'urgency-threat',
    category: 'urgency',
    title: 'Urgent pressure or threats',
    explanation:
      'Scammers push you to act before you can verify. Phrases about accounts being locked, legal action, or "act now" create panic.',
    weight: 14,
    patterns: [
      /\bact\s+now\b/i,
      /\bimmediately\b/i,
      /\bwithin\s+\d+\s*(?:hours?|mins?|minutes?|hrs?)\b/i,
      /\burgent(?:ly)?\b/i,
      /\bfinal\s+notice\b/i,
      /\baccount\s+(?:will\s+be\s+)?(?:suspended|locked|closed|blocked|deactivated)\b/i,
      /\blegal\s+action\b/i,
      /\bwarrant\b/i,
      /\barrest\b/i,
      /\blast\s+chance\b/i,
      /\brespond\s+(?:within|immediately)\b/i,
      /\bexpir(?:e|es|ing|ed)\s+(?:today|tonight|soon|in\s+\d+)\b/i,
      /\blimited\s+time\b/i,
      /\baction\s+required\b/i,
      /\bfailure\s+to\s+(?:respond|verify|update)\b/i,
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
      /\b(?:atm\s+)?(?:pin|p\.i\.n\.?)\b(?:\s+(?:code|number))?\b/i,
      /\b(?:otp|one[-\s]?time\s+(?:password|passcode|code)|verification\s+code|security\s+code|auth(?:entication)?\s+code)\b/i,
      /\bconfirm\s+your\s+(?:password|pin|otp|credentials|login)\b/i,
      /\bsend\s+(?:me\s+)?(?:your\s+)?(?:password|pin|otp|code)\b/i,
      /\breply\s+with\s+(?:your\s+)?(?:password|pin|otp|code)\b/i,
      /\bshare\s+(?:your\s+)?(?:password|pin|otp|verification\s+code)\b/i,
      /\benter\s+(?:your\s+)?(?:password|pin|otp|cvv)\b/i,
      /\bprovide\s+(?:your\s+)?(?:password|otp|credentials)\b/i,
      /\b2fa\s+code\b|\btwo[-\s]factor\s+code\b/i,
    ],
  },
  {
    id: 'personal-kyc',
    category: 'credentials',
    title: 'Asks for ID, KYC, or sensitive personal details',
    explanation:
      'Unexpected requests for Aadhaar, PAN, full KYC dumps, or date of birth over chat or SMS are high risk. Official teams use secure apps or branches.',
    weight: 22,
    patterns: [
      /\baadhaar\b|\baadhar\b|\buidai\b/i,
      /\bpan\s+(?:card|number)\b/i,
      /\bkyc\s+(?:update|pending|incomplete|verify|verification|link)\b/i,
      /\bcomplete\s+(?:your\s+)?kyc\b/i,
      /\bshare\s+(?:your\s+)?(?:aadhaar|aadhar|pan|ssn|social\s+security)\b/i,
      /\bdate\s+of\s+birth\b.{0,40}\b(?:confirm|send|reply|share|verify)\b/i,
      /\bfull\s+name\s+as\s+per\s+(?:aadhaar|pan|id)\b/i,
      /\bmother'?s?\s+maiden\s+name\b/i,
    ],
  },
  {
    id: 'money-payment',
    category: 'money',
    title: 'Requests money, gift cards, or bank details',
    explanation:
      'Unexpected requests for money transfers, gift cards, crypto, UPI collects, or full bank/card details are classic scam tactics.',
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
      /\bupi\s+(?:id|pin|request|collect)\b/i,
      /\b(?:pay\s+to|send\s+to)\s+\d{10}@[a-z]+/i,
      /\bcollect\s+request\b/i,
      /\baccount\s+number\b/i,
      /\bifsc\b/i,
      /\bimmediately\s+transfer\b/i,
    ],
  },
  {
    id: 'prize-refund',
    category: 'prize',
    title: 'Unexpected prize, refund, or reward',
    explanation:
      '"You won" / surprise refund messages often lure people into clicking links or sharing personal details.',
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
      /\bcashback\s+(?:credited|pending|waiting)\b/i,
      /\byou\s+are\s+(?:eligible|selected)\s+for\b/i,
    ],
  },
  {
    id: 'suspicious-links',
    category: 'links',
    title: 'Shortened or lookalike / login URLs',
    explanation:
      'Shortened links hide the real destination. Lookalike domains and unexpected login or KYC URLs often lead to phishing pages.',
    weight: 16,
    patterns: [],
    test: (text) => extractHighRiskLinks(text),
  },
  {
    id: 'generic-link',
    category: 'links',
    title: 'Contains a web link',
    explanation:
      'Any unexpected link deserves caution, especially with pressure to click. On its own this is a weak signal.',
    weight: 8,
    patterns: [],
    test: (text) => extractAnyLink(text),
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
      /\bdownload\s+(?:this|the|our)\s+(?:app|file|attachment|update|apk)\b/i,
      /\bremote\s+(?:access|desktop|support)\b/i,
      /\banydesk\b|\bteamviewer\b|\bultraviewer\b|\bquick\s*assist\b/i,
      /\bopen\s+(?:the\s+)?attachment\b/i,
      /\benable\s+macros?\b/i,
      /\bscan\s+(?:the\s+)?qr\s*code\b/i,
      /\ballow\s+(?:screen\s+)?sharing\b/i,
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
      /\b(?:microsoft|apple|google|amazon|paypal|irs|income\s+tax|customs|fedex|dhl|ups|sbi|hdfc|icici|axis\s+bank|paytm|phonepe|flipkart)\s+(?:support|security|team|alert|customer\s+care)\b/i,
      /\bit\s+support\b|\btech\s+support\b|\bcustomer\s+care\b/i,
      /\byour\s+(?:bank|account)\s+(?:security|fraud)\s+(?:department|team)\b/i,
      /\b(?:bank|account)\s+security\s+team\b/i,
      /\bon\s+behalf\s+of\b/i,
      /\bofficial\s+(?:notice|alert|warning)\s+from\b/i,
      /\bfrom\s+(?:the\s+)?(?:fraud|security)\s+(?:prevention\s+)?(?:team|department)\b/i,
      /\bcourier\s+(?:partner|service|delivery)\b/i,
      /\bcustoms\s+(?:duty|clearance|department)\b/i,
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
      /\bdelete\s+(?:this|the)\s+(?:message|chat)\s+after\b/i,
    ],
  },
  {
    id: 'unusual-payment',
    category: 'payment_unusual',
    title: 'Unusual payment instructions',
    explanation:
      'Legitimate organizations rarely ask for payment via gift cards, crypto-only channels, or personal money-transfer apps for "fees" or "taxes on prizes".',
    weight: 18,
    patterns: [
      /\bpay\s+(?:the\s+)?(?:fee|tax|duty|release\s+fee|clearance\s+fee)\b/i,
      /\bprocessing\s+fee\b/i,
      /\bdelivery\s+(?:rebooking\s+)?fee\b/i,
      /\bsend\s+(?:via|through)\s+(?:western\s+union|moneygram|cashapp|venmo|zelle)\b/i,
      /\bgift\s*card\s+(?:code|pin|numbers?)\b/i,
      /\btransfer\s+(?:to\s+)?(?:this\s+)?wallet\b/i,
      /\bpay\s+only\s+(?:with|via|using)\s+(?:bitcoin|crypto|gift\s*cards?)\b/i,
      /\badvance\s+(?:fee|payment)\b/i,
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
