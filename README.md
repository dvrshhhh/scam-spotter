# Scam Message Checker

Educational web app for a third-year BTech Engineering Innovation Project. Paste a suspicious SMS, email, or chat message to see common warning signs, a transparent risk score, and safer next steps.

**This tool does not prove that a message is genuine or a scam.** A low-risk result is not a guarantee of safety.

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (configured for `http://127.0.0.1:4731`).

### GitHub Pages

Static site URL (after Pages is enabled on the `gh-pages` branch):

**https://riowgmi.github.io/scam-spotter/**

Rebuild and publish the Pages branch:

```bash
VITE_BASE=/scam-spotter/ npm run build
# then publish the dist/ folder to the gh-pages branch
```

The repo must allow GitHub Pages (public repos work on Free; private repos need a paid GitHub plan). In **Settings → Pages**, set Source to **Deploy from a branch**, branch `gh-pages`, folder `/`.

Other scripts:

```bash
npm run build    # typecheck + production build
npm run preview  # serve the production build
npm run lint     # oxlint
```

## What you can do in the app

1. Paste a message into the large text area.
2. Choose **Check message**.
3. Review:
   - Risk level: **Low risk**, **Review carefully**, or **High risk**
   - Score meter from 0 to 100
   - Each matched warning sign with excerpt / explanation
   - Practical next steps
4. Use **Clear** or **Load example** (ordinary / suspicious / uncertain).
5. Optionally **Save this scan locally** (stores risk metadata on the device, not the full message text by default).

## Privacy

- Checking is **local** in the browser after dependencies are installed.
- Message contents are **not uploaded** and are **not logged** to the console.
- Nothing is stored unless you explicitly save a scan summary.
- No paid APIs, API keys, or hosted backend are required for core checking.

## How detection & scoring work

The checker is **rule-based TypeScript** under `src/detection/`:

| File | Role |
| --- | --- |
| `normalize.ts` | Local text cleanup before matching (obfuscation, lookalikes, spacing tricks) |
| `rules.ts` | Extensible catalogue of warning-sign patterns (urgency, credentials/KYC, money/UPI, prizes, links, software, impersonation, secrecy, unusual payment) |
| `score.ts` | Weighted sum, diversity + combo bonuses, thresholds, next-step copy |
| `checkMessage.ts` | Runs rules, builds the explainable result |
| `types.ts` | Shared types |

### Scoring approach

1. Text is **normalized** first (spacing tricks, lookalike characters, light obfuscation) so wording like `p a s s w o r d` still matches.
2. Each matched rule contributes its **weight** (roughly 8 to 28). Stronger hallmarks (password/OTP asks, KYC/UPI asks, gift-card/bank asks) weigh more than weaker cues (a lone ordinary link).
3. URL checks are **strict**: shorteners, risky TLDs, brand-spoof hosts, IP hosts, punycode, `@` tricks, sensitive paths (login/KYC/otp), insecure HTTP on those paths, click-here pressure, and multiple links all raise the score. A plain leftover URL still counts as a caution signal.
4. If hits span **3+ categories**, a **diversity bonus (+8)** is added.
5. **Dangerous combo bonuses** apply when known stacks appear together (for example credentials + urgency, impersonation + link), capped so overlaps cannot runaway-score.
6. The total is capped at **100**.
7. Threshold bands:
   - **0 to 29**: Low risk
   - **30 to 59**: Review carefully
   - **60 to 100**: High risk

A single weak signal does **not** auto-escalate to High risk. The UI shows matched text, weights, and expandable scoring notes so the outcome stays explainable.

```bash
npm run test:detection   # regression checks for examples + edge cases
```

## Limitations

- Patterns favor common English scam phrasing; novel wording can be missed.
- Legitimate messages that use similar words can be flagged.
- No remote AI is used. Optional on-device AI was intentionally omitted to avoid large model downloads.
- Always verify through official apps, websites, or numbers you already trust.

## Project demo guide (short)

1. Start the app with `npm install` then `npm run dev`.
2. Load the **Ordinary** example, then **Check message**. Expect **Low risk**.
3. Load the **Uncertain** example. Expect **Review carefully** (link plus urgency/update pressure).
4. Load the **Suspicious** example. Expect **High risk** with multiple stacked warning signs.
5. Point out the privacy note: analysis is local; optional save stores only a summary.
6. Expand **How scoring worked** to show transparent weights and thresholds.

## Suggested project structure

```
src/
  components/     Message input, risk result, meter, warnings, examples, privacy
  data/           Example messages
  detection/      Rules, scoring, checker
  App.tsx         Dashboard composition
```

## License

Built as an academic demonstration project. Use freely for learning and coursework.
