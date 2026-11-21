export function AppHeader() {
  return (
    <header className="border-b border-line bg-brand text-sheet">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-sm font-medium tracking-wide text-signal-soft">
          BTech Engineering Innovation Project
        </p>
        <div className="max-w-3xl">
          <h1 className="font-display text-[2.35rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            <span className="block sm:inline">Scam Message </span>
            <span className="relative mt-1 inline-block sm:mt-0">
              Checker
              <span
                className="brand-underline absolute -bottom-1 left-0 h-1 w-full origin-left bg-signal"
                aria-hidden="true"
              />
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/90 sm:text-lg">
            Check suspicious messages, inspect risky links, learn common scam
            types, and review scans you choose to save. Analysis stays local in
            your browser. Educational aid only, not proof a message is genuine
            or a scam.
          </p>
        </div>
      </div>
    </header>
  )
}
