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
  hostname: string | null
  usesPlainHttp: boolean
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

/** Human labels for URL heuristic reason codes. */
export const URL_REASON_LABELS: Record<string, string> = {
  'unparseable-url':
    'Could not parse this as a normal web address — odd formatting can hide where a link really goes.',
  'url-shortener':
    'Uses a URL shortener that hides the real destination until you open it. Prefer typing official sites yourself.',
  'ip-literal-host':
    'Points at a raw IP address instead of a normal domain. Phishing kits often skip a real brand domain.',
  'punycode-host':
    'Uses punycode (xn--) which can hide lookalike characters in the host name.',
  'userinfo-at-sign':
    'Contains an @ trick that can disguise the real host after a fake “friendly” prefix.',
  'risky-tld':
    'Uses a top-level domain often seen in disposable phishing sites. Treat unexpected asks on these hosts carefully.',
  'brand-spoof-host':
    'Host name looks like a brand spoof, not an official domain. Check the spelling against a site you open yourself.',
  'sensitive-path':
    'Path looks like login, KYC, OTP, or account verification — a common lure for credential theft.',
  'insecure-http-sensitive':
    'Uses insecure HTTP on a sensitive login-style page, so traffic is easier to intercept.',
  'plain-http':
    'Uses plain HTTP instead of HTTPS. That alone is not proof of harm, but it is weaker protection for any data you type.',
  'security-themed-host':
    'Host name leans on “secure / login / bank” wording to sound official without proving it is.',
  'long-subdomain-chain':
    'Unusually long subdomain chain that can hide the real registrable site farther to the right.',
  'digit-lookalike':
    'Host mixes letters and digits in a way often used for lookalike spelling (for example paypa1).',
}

/** Reasons used for message scoring (excludes soft inspection-only flags). */
const SCORING_REASONS = new Set([
  'unparseable-url',
  'url-shortener',
  'ip-literal-host',
  'punycode-host',
  'userinfo-at-sign',
  'risky-tld',
  'brand-spoof-host',
  'sensitive-path',
  'insecure-http-sensitive',
  'security-themed-host',
])

export function analyzeOne(raw: string): UrlFinding {
  const url = stripTrailingPunctuation(raw)
  const reasons: string[] = []
  const host = hostFromUrl(url)
  const path = pathFromUrl(url)
  const lower = url.toLowerCase()
  const usesPlainHttp = /^http:\/\//i.test(url)

  if (!host) {
    return { url, hostname: null, usesPlainHttp, reasons: ['unparseable-url'] }
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

  if (usesPlainHttp && (SENSITIVE_PATH.test(path) || BRAND_TOKENS.test(host))) {
    reasons.push('insecure-http-sensitive')
  }

  if (
    /(?:secure|login|verify|account|update|kyc|bank|support)/i.test(host) &&
    !isKnownBenignHost(host)
  ) {
    reasons.push('security-themed-host')
  }

  return { url, hostname: host, usesPlainHttp, reasons }
}

/**
 * Richer local inspection for the Link inspection tab.
 * Adds soft structural clues such as plain HTTP (does not visit the URL).
 */
export function analyzeForInspection(raw: string): UrlFinding {
  const base = analyzeOne(raw)
  const reasons = [...base.reasons]

  if (base.usesPlainHttp && !reasons.includes('insecure-http-sensitive')) {
    reasons.push('plain-http')
  }

  if (base.hostname && base.hostname.split('.').filter(Boolean).length >= 4) {
    reasons.push('long-subdomain-chain')
  }

  if (base.hostname && /[a-z]+\d+[a-z]+|\d+[a-z]+\d+/i.test(base.hostname)) {
    reasons.push('digit-lookalike')
  }

  return { ...base, reasons }
}

/** Analyze every URL found in free text for the Link inspection UI. */
export function analyzeUrlsInText(text: string): UrlFinding[] {
  return collectUrls(text).map((url) => analyzeForInspection(url))
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
  let bestScore = 0

  for (const url of urls) {
    const finding = analyzeOne(url)
    const score = finding.reasons.filter((r) => SCORING_REASONS.has(r)).length
    if (score === 0) continue
    if (!best || score > bestScore) {
      best = finding
      bestScore = score
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
