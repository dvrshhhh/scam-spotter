# Scam Message Checker

Local scam-safety toolkit for a third-year BTech Engineering Innovation Project. Paste SMS, email, or chat text to see common warning signs, a transparent risk score, link-structure clues, calm next steps, and educational practise samples.

**This tool does not prove that a message is genuine or a scam.** A low-risk result is not a guarantee of safety. The checker flags common warning signs and can make mistakes.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://127.0.0.1:4731`).

Other scripts:

```bash
npm run build           # typecheck + production build
npm run preview         # serve the production build
npm run lint            # oxlint
npm run test:detection  # regression checks for examples + edge cases
```

### GitHub Pages (optional)

If you publish a static build to the `gh-pages` branch:

**https://dvrshhhh.github.io/scam-spotter/**

```bash
VITE_BASE=/scam-spotter/ npm run build
# then publish the dist/ folder to the gh-pages branch
```

## Features

Simple top nav: **Check · Links · Guide**.

1. **Check** — paste a message (or pick one example from a dropdown), run the local risk score (**Low risk / Review carefully / High risk**), see warning signs, likely patterns, hostnames, and next steps. Score details stay collapsed until you open them.
2. **Links** — inspect URLs from pasted text for structural clues only. Never visits links.
3. **Guide** — pick a situation from a dropdown and follow calm next steps. No invented phone numbers.

### Optional scan history

- History is **disabled by default**. Enable it explicitly if you want summaries.
- When enabled, only **date**, **risk level**, and **warning-sign categories** are stored in this browser’s `localStorage`.
- The original message text is **never** stored.
- Use **Clear history** to remove saved summaries. Disabling history stops new saves; clear removes what was stored.

## Privacy

- Checking and link inspection run **locally in the browser** after dependencies are installed.
- Message contents are **not uploaded** and are **not logged** to the console.
- No backend, paid service, API key, or remote AI is required for core tools.
- Optional history (off by default) stores only non-content metadata on this device.

## How detection & scoring work

Rule-based TypeScript under `src/detection/`:

| File | Role |
| --- | --- |
| `normalize.ts` | Local text cleanup (lookalikes, spacing/underscore tricks, light leetspeak) |
| `rules.ts` | Warning-sign patterns, including job-offer pressure |
| `score.ts` | Weighted sum, diversity + dangerous combo bonuses, thresholds |
| `urlSignals.ts` | Local URL structure heuristics (never fetches) |
| `classify.ts` | Likely pattern labels from detected clues |
| `checkMessage.ts` | Runs the full check, extracts hostnames, builds the explainable result |
| `types.ts` | Shared types |

There is **no network backend**. “Detection backend” means this in-browser rule engine.

### Scoring approach

1. Text is normalized first (spacing tricks, lookalike characters, light obfuscation).
2. Each matched rule contributes a weight (roughly 8 to 28).
3. URL checks are structural only: shorteners, risky TLDs, brand-spoof hosts, IP hosts, punycode, `@` tricks, sensitive paths, and related cues.
4. Hits across **3+ categories** add a diversity bonus (+8).
5. Dangerous combo bonuses apply for known stacks (for example credentials + urgency), with a cap.
6. Total is capped at **100**.
7. Bands: **0–29** Low risk · **30–59** Review carefully · **60–100** High risk.

Likely patterns (when clues support them): account impersonation, payment request, unexpected prize, suspicious job offer, urgent threat. Labels are educational, not a verdict.

## Limitations

- Patterns favor common English (and some India-focused) scam phrasing; novel wording can be missed.
- Legitimate messages that use similar words can be flagged.
- Link inspection never visits URLs and cannot prove a link is malicious or safe.
- No remote AI is used.
- Always verify through official apps, websites, or numbers you already trust.

## Project layout

```
src/
  components/   Check UI, link inspection, safety guide, history, nav
  data/         Examples and safety paths
  detection/    Rules, scoring, URL heuristics, pattern classification
  App.tsx       Toolkit shell
```

## License

Built as an academic demonstration project. Use freely for learning and coursework.
