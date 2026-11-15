/**
 * Strict local URL inspection for scam messages.
 * No network calls: host/path heuristics only.
 */

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"')\]]+|(?:bit\.ly|t\.co|tinyurl\.com|goo\.gl|rb\.gy|cutt\.ly|is\.gd|ow\.ly|rebrand\.ly|shorturl\.at|bl\.ink|tiny\.cc|dub\.sh|t\.ly)\/[^\s<>"')\]]+/gi

const SHORTENER_HOSTS = new Set([
  'bit.ly',
  't.co',
  'tinyurl.com',
  'goo.gl',
  'rb.gy',
  'ow.ly',
  'is.gd',
  'cutt.ly',
  'rebrand.ly',
  'shorturl.at',
  'bl.ink',
  'tiny.cc',
  'dub.sh',
  't.ly',
  'lnkd.in',
  'buff.ly',
])

/** TLDs and public suffixes often abused in phishing kits / disposable domains. */
const RISKY_TLDS = new Set([
  'ru',
  'cn',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'top',
  'xyz',
  'click',
  'link',
  'rest',
  'work',
  'country',
  'zip',
  'mov',
  'kim',
  'men',
  'loan',
  'science',
  'quest',
  'cfd',
  'sbs',
  'cyou',
  'icu',
])

const BRAND_TOKENS =
  /(?:paypal|paypa1|microsoft|micros0ft|apple|app1e|amazon|amaz0n|netflix|netf1ix|facebook|faceb00k|google|go0gle|whatsapp|instagram|hdfc|icici|sbi|axis|paytm|phonepe|gpay|googlepay|flipkart|amazonpay|kotak|yesbank|federalbank)/i

const SENSITIVE_PATH =
  /\/(?:login|signin|sign-in|verify|verification|secure|account|update|kyc|otp|password|credential|wallet|claim|refund|unlock|recover|confirm)/i

const CLICK_PRESSURE =
  /\b(?:click|tap|open|visit|follow)\s+(?:this\s+)?(?:link|url|here|below|above)\b|\b(?:click|tap)\s+here\b|\bverify\s+(?:here|now|via|at)\b|\blogin\s+(?:here|now|via|at)\b/i

export interface UrlFinding {
  url: string
  reasons: string[]
}

function stripTrailingPunctuation(raw: string): string {
  return raw.replace(/[.,;:!?)\]]+$/g, '')
}

function hostFromUrl(raw: string): string | null {
  let candidate = raw.trim()
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate.replace(/^\/\//, '')}`
  }
  try {
    const host = new URL(candidate).hostname.toLowerCase()
    return host || null
  } catch {
    const fallback = candidate
      .replace(/^https?:\/\//i, '')
      .split(/[/?#]/)[0]
      ?.toLowerCase()
    return fallback || null
  }
}

function pathFromUrl(raw: string): string {
  let candidate = raw.trim()
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate.replace(/^\/\//, '')}`
  }
  try {
    return `${new URL(candidate).pathname}${new URL(candidate).search}`
  } catch {
    const idx = candidate.indexOf('/')
    return idx >= 0 ? candidate.slice(idx) : ''
  }
}

function tldOf(host: string): string {
  const parts = host.split('.').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

function analyzeOne(raw: string): UrlFinding {
  const url = stripTrailingPunctuation(raw)
  const reasons: string[] = []
  const host = hostFromUrl(url)
  const path = pathFromUrl(url)
  const lower = url.toLowerCase()

  if (!host) {
    reasons.push('unparseable-url')
    return { url, reasons }
  }

  if (SHORTENER_HOSTS.has(host) || [...SHORTENER_HOSTS].some((s) => host.endsWith(`.${s}`))) {
    reasons.push('url-shortener')
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    reasons.push('ip-literal-host')
  }

  if (host.includes('xn--') || lower.includes('xn--')) {
    reasons.push('punycode-host')
  }

  if (/https?:\/\/[^/\s]+@/i.test(url) || host.includes('@')) {
    reasons.push('userinfo-at-sign')
  }

  if (RISKY_TLDS.has(tldOf(host))) {
    reasons.push('risky-tld')
  }

  if (looksLikeBrandSpoof(host)) {
    reasons.push('brand-spoof-host')
  }

  if (SENSITIVE_PATH.test(path) || SENSITIVE_PATH.test(lower)) {
    reasons.push('sensitive-path')
  }

  if (/^http:\/\//i.test(url) && (SENSITIVE_PATH.test(path) || BRAND_TOKENS.test(host))) {
    reasons.push('insecure-http-sensitive')
  }

  if (
    /(?:secure|login|verify|account|update|kyc|bank|support)/i.test(host) &&
    !isKnownBenignHost(host)
  ) {
    reasons.push('security-themed-host')
  }

  return { url, reasons }
}

function looksLikeBrandSpoof(host: string): boolean {
  if (!BRAND_TOKENS.test(host)) return false
  // Brand token present but not an obvious official apex (heuristic only)
  const officialish =
    /(?:^|\.)(?:paypal\.com|microsoft\.com|apple\.com|amazon\.com|netflix\.com|facebook\.com|google\.com|whatsapp\.com|instagram\.com|hdfcbank\.com|icicibank\.com|onlinesbi\.sbi|sbi\.co\.in|axisbank\.com|paytm\.com|phonepe\.com|flipkart\.com)$/i
  return !officialish.test(host)
}

function isKnownBenignHost(host: string): boolean {
  return /(?:^|\.)(?:google\.com|microsoft\.com|apple\.com|amazon\.in|amazon\.com|github\.com|wikipedia\.org)$/i.test(
    host,
  )
}

export function collectUrls(text: string): string[] {
  const found = text.match(URL_PATTERN) ?? []
  const cleaned = found.map(stripTrailingPunctuation)
  return [...new Set(cleaned)]
}

/**
 * High-confidence suspicious URL (shortener, spoof, risky TLD, sensitive path, etc.).
 */
export function findStrictSuspiciousUrl(text: string): string | null {
  const urls = collectUrls(text)
  let best: UrlFinding | null = null

  for (const url of urls) {
    const finding = analyzeOne(url)
    if (finding.reasons.length === 0) continue
    if (!best || finding.reasons.length > best.reasons.length) {
      best = finding
    }
  }

  return best?.url ?? null
}

/**
 * Any URL that did not already qualify as high-risk.
 * Still treated as a caution signal under stricter policy.
 */
export function findResidualUrl(text: string): string | null {
  if (findStrictSuspiciousUrl(text)) return null
  const urls = collectUrls(text)
  return urls[0] ?? null
}

/** True when the message pressures the reader to open a link. */
export function hasClickPressure(text: string): boolean {
  return CLICK_PRESSURE.test(text)
}

export function countUrls(text: string): number {
  return collectUrls(text).length
}
