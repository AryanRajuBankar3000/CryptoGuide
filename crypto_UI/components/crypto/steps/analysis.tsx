'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import { Eyebrow } from '../ui/primitives'

const STAGES = [
  'Security objectives analyzed',
  'Vehicle lifecycle evaluated',
  'Hardware constraints evaluated',
  'Cryptographic candidates compared',
  'Post-quantum migration assessed',
  'Final recommendation prepared',
]

export function AnalysisStep() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((a) => Math.min(a + 1, STAGES.length))
    }, 340)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-8">
        <span className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-strong bg-card">
          <span className="absolute h-16 w-16 rounded-2xl border border-primary/40 animate-pulse-ring" />
          <Loader2 className="h-7 w-7 animate-spin text-bright" strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>

      <Eyebrow>Analysis</Eyebrow>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Analyzing security context</h1>

      <ol className="mt-10 w-full max-w-md space-y-3 text-left" aria-live="polite">
        {STAGES.map((stage, i) => {
          const done = i < active
          const current = i === active
          return (
            <li
              key={stage}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300',
                done && 'border-success/30 bg-success/5',
                current && 'border-primary/40 bg-primary/10',
                !done && !current && 'border-border bg-card/30 opacity-50',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                  done && 'border-success bg-success/20 text-success',
                  current && 'border-primary text-bright',
                  !done && !current && 'border-border text-transparent',
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className={cn('text-sm', done || current ? 'text-foreground' : 'text-muted-foreground')}>
                {stage}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-8 h-1 w-full max-w-md overflow-hidden rounded-full bg-card-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-bright transition-all duration-300"
          style={{ width: `${(active / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
