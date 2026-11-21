export type AppTab = 'check' | 'links' | 'safety'

interface AppNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

/** Nav revision marker: three tabs only (Check · Links · Guide). No Learn. */
export const NAV_REVISION = 'nav-v3-no-learn-20261121'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'check', label: 'Check' },
  { id: 'links', label: 'Links' },
  { id: 'safety', label: 'Guide' },
]

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <nav
      className="sticky top-0 z-20 border-b border-line bg-sheet/95 backdrop-blur-sm"
      aria-label="App sections"
      data-nav-revision={NAV_REVISION}
    >
      <div
        className="mx-auto flex w-full max-w-5xl gap-1 px-4 sm:px-6 lg:px-8"
        role="tablist"
        aria-label="Toolkit sections"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`min-h-12 px-4 text-sm font-semibold transition sm:px-5 ${
                isActive
                  ? 'border-b-2 border-signal text-ink'
                  : 'border-b-2 border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
