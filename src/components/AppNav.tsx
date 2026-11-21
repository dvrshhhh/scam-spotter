export type AppTab = 'check' | 'links' | 'safety' | 'learn'

interface AppNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: 'check', label: 'Check', hint: 'Paste a message' },
  { id: 'links', label: 'Link inspection', hint: 'Inspect URLs locally' },
  { id: 'safety', label: 'Safety guide', hint: 'What to do next' },
  { id: 'learn', label: 'Learn', hint: 'Practise with samples' },
]

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <nav className="border-b border-line bg-sheet" aria-label="App sections">
      <div
        className="mx-auto flex w-full max-w-5xl gap-0 overflow-x-auto px-2 sm:px-6 lg:px-8"
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
              className={`min-w-[8rem] flex-1 px-3 py-3 text-left transition sm:min-w-0 sm:px-4 ${
                isActive
                  ? 'border-b-2 border-signal bg-white text-ink'
                  : 'border-b-2 border-transparent text-ink-soft hover:bg-white/70 hover:text-ink'
              }`}
            >
              <span className="block font-display text-sm font-bold">
                {tab.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">{tab.hint}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
