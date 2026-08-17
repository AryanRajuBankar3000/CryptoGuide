'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, TriangleAlert, ArrowRight } from 'lucide-react'
import type { UseCaseRecommendation } from '@/lib/crypto/types'
import { StatusBadge } from '../ui/primitives'

export function UseCaseSummaryCard({
  useCase,
  rank,
}: {
  useCase: UseCaseRecommendation
  rank: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'rounded-xl border bg-card/50 transition-colors',
        open ? 'border-border-strong' : 'border-border hover:border-border-strong',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {rank === 0 ? 'Most Critical' : `Priority ${rank + 1}`}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground">{useCase.objectiveTitle}</span>
          <span className="mt-0.5 block font-mono text-xs text-bright">{useCase.primaryAlgorithm}</span>
        </span>
        <StatusBadge status={useCase.priority} className="hidden sm:inline-flex" />
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-bright transition-transform', open && 'rotate-180')} strokeWidth={1.8} />
      </button>

      {open ? (
        <div className="animate-fade-up space-y-5 border-t border-border/70 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{useCase.summary}</p>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Why it was selected</p>
            <ul className="space-y-1.5">
              {useCase.why.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  {w.kind === 'good' ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                  ) : w.kind === 'warn' ? (
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={2} />
                  ) : (
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-bright" strokeWidth={2} />
                  )}
                  {w.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Cryptography</p>
              <div className="flex flex-wrap gap-2">
                {useCase.crypto.map((c) => (
                  <span key={c.algorithm} className="rounded-md border border-border bg-card-2 px-2.5 py-1 text-xs text-foreground">
                    {c.algorithm}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Hardware impact</p>
              <div className="flex flex-wrap gap-2">
                {useCase.hardware.map((h) => (
                  <span key={h.label} className="rounded-md border border-border bg-card-2 px-2.5 py-1 text-xs text-muted-foreground">
                    {h.label}: <span className="text-foreground">{h.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
