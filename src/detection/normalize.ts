/**
 * Normalize message text before rule matching.
 * Helps catch common obfuscation without sending text anywhere.
 */

/** Map a few lookalike / fullwidth characters back to ASCII letters. */
const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic lookalikes
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  у: 'y',
  х: 'x',
  і: 'i',
  ɑ: 'a',
  ɡ: 'g',
  // Fullwidth digits often used in obfuscated URLs / codes
  '０': '0',
  '１': '1',
  '３': '3',
  '４': '4',
  '５': '5',
  '７': '7',
  '８': '8',
  '９': '9',
}

export interface NormalizedMessage {
  /** Original trimmed text (for display excerpts when useful). */
  original: string
  /** Text used for rule matching. */
  normalized: string
}

/**
 * Prepare text for detection:
 * - trim
 * - strip zero-width / bidi control chars
 * - map a few Cyrillic/fullwidth lookalikes
 * - collapse letter-spacing tricks like "p a s s w o r d" and "p.a.s.s"
 * - normalize whitespace
 */
export function normalizeMessage(rawText: string): NormalizedMessage {
  const original = rawText.trim()
  if (!original) {
    return { original: '', normalized: '' }
  }

  let text = original.normalize('NFKC')

  // Zero-width and bidi overrides often used to hide keywords
  text = text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, '')

  text = [...text]
    .map((ch) => HOMOGLYPH_MAP[ch] ?? HOMOGLYPH_MAP[ch.toLowerCase()] ?? ch)
    .join('')

  // "p a s s w o r d" or "p.a.s.s.w.o.r.d" -> "password"
  text = collapseSpacedLetters(text)

  // Light leetspeak inside words (passw0rd, paypa1 already partly covered by URL rules)
  text = text.replace(/\bpassw[o0]rd\b/gi, 'password')
  text = text.replace(/\bverif[y1]\b/gi, 'verify')
  text = text.replace(/\blog[i1]n\b/gi, 'login')
  text = text.replace(/\bacc[o0]unt\b/gi, 'account')

  text = text.replace(/\s+/g, ' ').trim()

  return { original, normalized: text }
}

function collapseSpacedLetters(input: string): string {
  // Sequences of single letters separated by spaces or dots (length >= 4)
  return input.replace(
    /\b(?:[A-Za-z](?:[.\u00B7\s]+)){3,}[A-Za-z]\b/g,
    (chunk) => chunk.replace(/[.\u00B7\s]+/g, ''),
  )
}
