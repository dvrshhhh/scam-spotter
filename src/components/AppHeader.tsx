export function AppHeader() {
  return (
    <header className="border-b border-line bg-brand text-sheet">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-sm font-medium tracking-wide text-signal-soft">
          BTech Engineering Innovation Project
        </p>
        <div className="max-w-3xl">
          <h1 className="font-display text-[2.35rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            <span className="block sm:inline">Scam Message </span>
            <span className="relative mt-1 inline-block pb-1 sm:mt-0">
              Checker
              <span
                className="brand-underline absolute bottom-0 left-0 h-1 w-full origin-left bg-signal"
                aria-hidden="true"
              />
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/90 sm:text-lg">
            Paste a suspicious SMS, email, or chat. Analysis stays in your
            browser and flags common warning signs. It can make mistakes and
            cannot prove a message is safe or fraudulent.
          </p>
        </div>
      </div>
    </header>
  )
}
