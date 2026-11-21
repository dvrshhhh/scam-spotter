export type AppTab = 'check' | 'links' | 'safety'

interface AppNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'check', label: 'Check' },
  { id: 'links', label: 'Links' },
  { id: 'safety', label: 'Guide' },
]

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <nav className="border-b border-line bg-sheet" aria-label="App sections">
      <div
        className="mx-auto flex w-full max-w-3xl gap-1 px-4 sm:px-6"
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
              className={`min-h-11 flex-1 px-2 text-sm font-semibold transition ${
                isActive
                  ? 'border-b-2 border-signal text-ink'
                  : 'border-b-2 border-transparent text-ink-soft hover:text-ink'
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
