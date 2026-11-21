export function AppHeader() {
  return (
    <header className="border-b border-line bg-brand text-sheet">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-9">
        <p className="text-sm font-medium tracking-wide text-signal-soft">
          BTech Engineering Innovation Project
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="relative inline-block">
            Scam Message Checker
            <span
              className="brand-underline absolute -bottom-1 left-0 h-1 w-full origin-left bg-signal"
              aria-hidden="true"
            />
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/90">
          Check suspicious messages in your browser. Flags common warning signs —
          can make mistakes, and cannot prove a message is safe or fraudulent.
        </p>
      </div>
    </header>
  )
}
