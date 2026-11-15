import { CheckCircle2 } from 'lucide-react'

interface NextStepsProps {
  steps: string[]
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <ol className="space-y-3" aria-label="Suggested next steps">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
            aria-hidden="true"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
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
