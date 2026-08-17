'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
export function CryptoDetailCard({  detail  }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card/50 transition-colors',
        open ? 'border-border-strong' : 'border-border hover:border-border-strong',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span>
          <span className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {detail.category}
          </span>
          <span className="mt-1 block text-base font-semibold text-foreground">{detail.algorithm}</span>
        </span>
        <span className="flex items-center gap-2 text-sm text-bright">
          <span className="hidden sm:inline">{open ? 'Hide' : 'View details'}</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} strokeWidth={1.8} />
        </span>
      </button>

      {open ? (
        <dl className="grid animate-fade-up gap-x-6 gap-y-3 border-t border-border/70 p-5 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Why</dt>
            <dd className="mt-1 leading-relaxed text-foreground">{detail.why}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Strength</dt>
            <dd className="mt-1 text-foreground">{detail.strength}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">PQC</dt>
            <dd className="mt-1 text-foreground">{detail.pqc}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Migration</dt>
            <dd className="mt-1 text-foreground">{detail.migration}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Reference</dt>
            <dd className="mt-1 font-mono text-xs text-bright">{detail.reference}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}
