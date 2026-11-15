import { ShieldCheck } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="relative overflow-hidden rounded-[1.75rem] border border-brand/15 bg-brand text-white shadow-[0_24px_60px_-30px_rgba(10,53,49,0.85)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 20%, rgba(232,245,242,0.22), transparent 42%), radial-gradient(circle at 88% 10%, rgba(31,138,122,0.45), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 50%)',
        }}
      />
      <div className="relative grid gap-6 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Engineering Innovation Project
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Scam Message Checker
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-brand-soft/95 sm:text-lg">
            Paste a suspicious SMS, email, or chat message. Get a clear risk
            level, the warning signs that fired, and safer next steps—without
            claiming the message is proven genuine or a scam.
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 backdrop-blur-[2px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-soft/90">
            How it works
          </p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-white/90">
            <li>1. Paste the message text</li>
            <li>2. Run the local rule-based check</li>
            <li>3. Review signals, score, and next steps</li>
          </ol>
        </div>
      </div>
    </header>
  )
}
