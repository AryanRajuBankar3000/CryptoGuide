'use client'

import { Check, TriangleAlert } from 'lucide-react'

export function PostureIndicator({ 
  score,
  strong,
  attention,
 }) {
  const segments = 10
  const filled = Math.round((score / 100) * segments)

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bright/70">Current Security Posture</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-semibold tabular-nums text-foreground">{score}</span>
            <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: segments }).map((_, i) => (
              <span
                key={i}
                className={
                  i < filled
                    ? 'h-2.5 w-6 rounded-full bg-gradient-to-r from-primary to-bright'
                    : 'h-2.5 w-6 rounded-full bg-card-2'
                }
              />
            ))}
          </div>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground/80">
            An assessment indicator derived from your selected context. It is not a certification or guarantee.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-success">Strong</p>
            <ul className="space-y-1.5">
              {strong.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-success" strokeWidth={2} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-warning">Needs attention</p>
            <ul className="space-y-1.5">
              {attention.length === 0 ? (
                <li className="text-sm text-muted-foreground/60">None flagged</li>
              ) : (
                attention.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-foreground">
                    <TriangleAlert className="h-4 w-4 text-warning" strokeWidth={2} />
                    {a}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
