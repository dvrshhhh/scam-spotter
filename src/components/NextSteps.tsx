interface NextStepsProps {
  steps: string[]
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <ol className="space-y-3" aria-label="Suggested next steps">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
          <span
            className="font-display w-6 shrink-0 text-base font-bold text-signal"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span>
            <span className="sr-only">Step {index + 1}: </span>
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
}
