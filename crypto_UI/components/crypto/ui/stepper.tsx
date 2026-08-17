'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useStore, STEP_ORDER, type Step } from '../store'

const STEP_LABELS: Record<Step, string> = {
  objectives: 'Security Objective',
  context: 'System Context',
  review: 'Review',
  analysis: 'Review',
  recommendation: 'Recommendation',
}

export function Stepper() {
  const { step, goToStep, objectiveCount, context, recommendation } = useStore()

  const activeIndex = STEP_ORDER.indexOf(step === 'analysis' ? 'review' : step)

  const isReachable = (index: number): boolean => {
    if (index === 0) return true
    if (index === 1) return objectiveCount > 0
    if (index === 2) return objectiveCount > 0 && !!context.projectType
    if (index === 3) return !!recommendation
    return false
  }

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
        {STEP_ORDER.map((s, index) => {
          const completed = index < activeIndex
          const active = index === activeIndex
          const reachable = isReachable(index) && index <= activeIndex
          return (
            <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && goToStep(s)}
                className={cn(
                  'group flex items-center gap-2.5 whitespace-nowrap rounded-md px-2 py-1.5 text-left transition-colors',
                  reachable && !active && 'hover:bg-card-2',
                  !reachable && 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-all',
                    active && 'border-primary bg-primary/15 text-bright shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
                    completed && 'border-primary bg-primary text-primary-foreground',
                    !active && !completed && 'border-border text-muted-foreground',
                  )}
                >
                  {completed ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'hidden text-sm font-medium sm:inline',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {STEP_LABELS[s]}
                </span>
              </button>
              {index < STEP_ORDER.length - 1 ? (
                <span
                  className={cn(
                    'h-px flex-1 min-w-4 transition-colors',
                    index < activeIndex ? 'bg-primary/60' : 'bg-border',
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
